import { useState, useEffect, useMemo, useCallback } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useChapters } from '../hooks/useChapters'
import { usePlots } from '../hooks/usePlots'
import { useAutoSave } from '../hooks/useAutoSave'
import { useVersionControl } from '../hooks/useVersionControl'
import { useAutoVersioning } from '../hooks/useAutoVersioning'
import { calculateDiff } from '../utils/diff'
import { Link } from 'react-router-dom'
import { useWritingSession } from '../hooks/useWritingSession'
import {
  PlusIcon,
  Bars3BottomLeftIcon,
  XMarkIcon,
  DocumentTextIcon,
  BookOpenIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline'
import ChapterList from '../components/editor/ChapterList'
import { TextEditor } from '../components/editor/TextEditor'
import PlotReference from '../components/editor/PlotReference'
import VersionHistory from '../components/version/VersionHistory'
import VersionDiff from '../components/version/VersionDiff'
import VoiceInputButton from '../components/voice/VoiceInputButton'
import TextToSpeechControls from '../components/voice/TextToSpeechControls'
import { SearchReplace } from '../components/editor/SearchReplace'

export default function EditorPage() {
  const { activeProject } = useProjects()
  const { chapters, createChapter, updateChapter, deleteChapter, reorderChapters } = useChapters(
    activeProject?.id || null
  )
  const { plots } = usePlots(activeProject?.id || null)
  const [selectedChapterId, setSelectedChapterId] = useState<string>('')
  const [content, setContent] = useState('')
  const [isCreatingChapter, setIsCreatingChapter] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [showSidebar, setShowSidebar] = useState(true)
  const [showMemo, setShowMemo] = useState(false)
  const [showPlot, setShowPlot] = useState(false)
  const [showVersion, setShowVersion] = useState(false)
  const [memoContent, setMemoContent] = useState('')
  const [comparedVersionDiff, setComparedVersionDiff] = useState<ReturnType<
    typeof calculateDiff
  > | null>(null)
  const [showSearch, setShowSearch] = useState(false)
  const [searchMode, setSearchMode] = useState<'search' | 'replace'>('search')

  // 選択中の章（メモ化）
  const selectedChapter = useMemo(
    () => chapters.find((ch) => ch.id === selectedChapterId),
    [chapters, selectedChapterId]
  )

  // 文字数をカウント（スペースを除く）
  const countCharacters = useCallback((text: string): number => {
    return text.replace(/\s/g, '').length
  }, [])

  // バージョン管理
  const versionControl = useVersionControl(selectedChapterId, 'chapter', content)

  // 自動バージョン保存
  const { manualSave } = useAutoVersioning({
    content,
    settings: versionControl.settings,
    onCreateVersion: versionControl.createVersion,
    enabled: !!selectedChapterId,
  })

  // 執筆セッション管理
  useWritingSession(activeProject?.id || '', selectedChapterId, content)

  // 検索・置換イベントのリスナー
  useEffect(() => {
    const handleOpenSearch = () => {
      setShowSearch(true)
      setSearchMode('search')
    }
    const handleOpenReplace = () => {
      setShowSearch(true)
      setSearchMode('replace')
    }
    const handleNavigateChapter = (e: CustomEvent) => {
      const direction = e.detail.direction
      const currentIndex = chapters.findIndex(ch => ch.id === selectedChapterId)
      if (direction === 'prev' && currentIndex > 0) {
        setSelectedChapterId(chapters[currentIndex - 1].id)
      } else if (direction === 'next' && currentIndex < chapters.length - 1) {
        setSelectedChapterId(chapters[currentIndex + 1].id)
      }
    }
    const handleCreateNewChapter = () => {
      setIsCreatingChapter(true)
    }

    window.addEventListener('open-search', handleOpenSearch)
    window.addEventListener('open-replace', handleOpenReplace)
    window.addEventListener('navigate-chapter', handleNavigateChapter as EventListener)
    window.addEventListener('create-new-chapter', handleCreateNewChapter)

    return () => {
      window.removeEventListener('open-search', handleOpenSearch)
      window.removeEventListener('open-replace', handleOpenReplace)
      window.removeEventListener('navigate-chapter', handleNavigateChapter as EventListener)
      window.removeEventListener('create-new-chapter', handleCreateNewChapter)
    }
  }, [chapters, selectedChapterId])

  // 自動保存設定（本文）
  const {
    isSaving,
    lastSaved,
    error: saveError,
  } = useAutoSave({
    onSave: () => {
      if (selectedChapter && content !== selectedChapter.content) {
        const characterCount = countCharacters(content)
        updateChapter(selectedChapterId, { content, wordCount: characterCount })
      }
    },
    delay: 3000, // 3秒に延長
    dependencies: [content, selectedChapterId],
  })

  // 自動保存設定（メモ）
  const { isSaving: isSavingMemo } = useAutoSave({
    onSave: () => {
      if (selectedChapter && memoContent !== selectedChapter.notes) {
        updateChapter(selectedChapterId, { notes: memoContent })
      }
    },
    delay: 3000, // 3秒に延長
    dependencies: [memoContent, selectedChapterId],
  })

  // 初期選択設定
  useEffect(() => {
    if (chapters.length > 0 && !selectedChapterId) {
      setSelectedChapterId(chapters[0].id)
    }
  }, [chapters, selectedChapterId])

  // 章が変更されたときの処理（章のIDが変わったときのみ）
  useEffect(() => {
    if (selectedChapter) {
      setContent(selectedChapter.content)
      setMemoContent(selectedChapter.notes || '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChapterId]) // selectedChapterIdの変更のみを監視

  // バージョンの復元
  const handleRestoreVersion = useCallback(
    (versionId: string) => {
      const restoredContent = versionControl.restoreVersion(versionId)
      if (restoredContent !== null) {
        setContent(restoredContent)
        manualSave('バージョン復元')
      }
    },
    [versionControl, manualSave]
  )

  // バージョンの比較
  const handleCompareVersions = useCallback(
    (versionId1: string, versionId2: string) => {
      const diff = versionControl.compareVersions(versionId1, versionId2)
      if (diff) {
        setComparedVersionDiff(diff)
      }
    },
    [versionControl]
  )

  // 新しい章を作成（メモ化）
  const handleCreateChapter = useCallback(() => {
    if (newChapterTitle.trim()) {
      const newChapter = createChapter({
        title: newChapterTitle,
        content: '',
        order: chapters.length,
        status: 'draft',
        projectId: activeProject?.id || '',
        notes: '',
      })
      if (newChapter) {
        setSelectedChapterId(newChapter.id)
        setNewChapterTitle('')
        setIsCreatingChapter(false)
      }
    }
  }, [newChapterTitle, chapters.length, createChapter, activeProject?.id])

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">プロジェクトを選択してください</p>
      </div>
    )
  }

  return (
    <div className="h-full flex">
      {/* 検索・置換 */}
      <SearchReplace
        text={content}
        onReplace={setContent}
        isOpen={showSearch}
        onClose={() => setShowSearch(false)}
        mode={searchMode}
      />
      
      {/* サイドバー */}
      {showSidebar && (
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">章一覧</h3>
              <button
                onClick={() => setShowSidebar(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {!isCreatingChapter ? (
              <button
                onClick={() => setIsCreatingChapter(true)}
                className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                新しい章を作成
              </button>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateChapter()}
                  placeholder="章のタイトルを入力"
                  className="w-full px-3 py-2 border rounded"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateChapter}
                    className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                  >
                    作成
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingChapter(false)
                      setNewChapterTitle('')
                    }}
                    className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                  >
                    キャンセル
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {chapters.length === 0 ? (
              <p className="text-gray-500 text-center py-8">章がまだありません</p>
            ) : (
              <ChapterList
                chapters={chapters}
                selectedChapterId={selectedChapterId}
                onSelectChapter={setSelectedChapterId}
                onUpdateChapter={updateChapter}
                onDeleteChapter={deleteChapter}
                onReorderChapters={(chapters) => {
                  const chapterIds = chapters.map((ch) => ch.id)
                  reorderChapters(chapterIds)
                }}
              />
            )}
          </div>

          <div className="p-4 border-t border-gray-200 text-sm text-gray-600">
            総文字数: {chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0).toLocaleString()}
          </div>
        </div>
      )}

      {/* メインエディタ */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {!showSidebar && (
                <button
                  onClick={() => setShowSidebar(true)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                  title="サイドバーを表示"
                >
                  <Bars3BottomLeftIcon className="w-5 h-5" />
                </button>
              )}
              {selectedChapter && (
                <h2 className="text-xl font-semibold text-gray-900">
                  第{selectedChapter.order + 1}章: {selectedChapter.title}
                </h2>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {activeProject && (
                <Link
                  to={`/projects/${activeProject.id}/statistics`}
                  className="flex items-center space-x-1 px-3 py-1 rounded text-gray-600 hover:bg-gray-100"
                  title="統計を表示"
                >
                  <ChartBarIcon className="w-4 h-4" />
                  <span className="text-sm">統計</span>
                </Link>
              )}
              <button
                onClick={() => setShowVersion(!showVersion)}
                className={`flex items-center space-x-1 px-3 py-1 rounded ${
                  showVersion ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="バージョン履歴"
              >
                <ClockIcon className="w-4 h-4" />
                <span className="text-sm">履歴</span>
              </button>
              <button
                onClick={() => setShowPlot(!showPlot)}
                className={`flex items-center space-x-1 px-3 py-1 rounded ${
                  showPlot ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="プロット参照"
              >
                <BookOpenIcon className="w-4 h-4" />
                <span className="text-sm">プロット</span>
              </button>
              <button
                onClick={() => setShowMemo(!showMemo)}
                className={`flex items-center space-x-1 px-3 py-1 rounded ${
                  showMemo ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
                title="各話メモ"
              >
                <DocumentTextIcon className="w-4 h-4" />
                <span className="text-sm">メモ</span>
              </button>
              <div className="flex items-center border-l pl-4 ml-2 space-x-2">
                <VoiceInputButton
                  onTranscript={(text) => {
                    setContent((prev) => prev + text)
                  }}
                />
                <TextToSpeechControls text={content} />
              </div>
              <span className="text-sm text-gray-600">
                文字数: {selectedChapter ? countCharacters(content).toLocaleString() : 0}
              </span>
              {(isSaving || isSavingMemo) && (
                <span className="text-sm text-blue-600">保存中...</span>
              )}
              {!isSaving && !isSavingMemo && lastSaved && !saveError && (
                <span className="text-sm text-green-600">保存済み</span>
              )}
              {saveError && <span className="text-sm text-red-600">保存エラー</span>}
            </div>
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-6">
          {selectedChapter ? (
            <div className="max-w-4xl mx-auto h-full">
              {showVersion ? (
                <div className="h-full flex space-x-4">
                  {/* 本文エリア */}
                  <div className="flex-1">
                    <TextEditor
                      content={content}
                      onChange={setContent}
                      className="h-full p-6 bg-white dark:bg-gray-800"
                    />
                  </div>
                  {/* バージョン履歴エリア */}
                  <div className="w-96 bg-white rounded-lg shadow-sm border border-gray-200">
                    {comparedVersionDiff ? (
                      <div className="h-full flex flex-col">
                        <div className="p-2 border-b">
                          <button
                            onClick={() => setComparedVersionDiff(null)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            ← 履歴に戻る
                          </button>
                        </div>
                        <div className="flex-1">
                          <VersionDiff diff={comparedVersionDiff} />
                        </div>
                      </div>
                    ) : (
                      <VersionHistory
                        versions={versionControl.history.versions}
                        currentVersionId={versionControl.history.currentVersionId}
                        onRestore={handleRestoreVersion}
                        onCompare={handleCompareVersions}
                        onDelete={versionControl.deleteVersion}
                        onAddTag={versionControl.addTag}
                        onRemoveTag={versionControl.removeTag}
                      />
                    )}
                  </div>
                </div>
              ) : showMemo || showPlot ? (
                <div className="h-full flex flex-col space-y-4">
                  {/* 本文エリア */}
                  <div className="flex-1">
                    <TextEditor
                      content={content}
                      onChange={setContent}
                      className="h-full p-6 bg-white dark:bg-gray-800"
                    />
                  </div>
                  {/* プロット参照エリア */}
                  {showPlot && (
                    <div className="h-1/3">
                      <PlotReference
                        plots={plots}
                        chapterId={selectedChapterId}
                        onClose={() => setShowPlot(false)}
                      />
                    </div>
                  )}
                  {/* メモエリア */}
                  {showMemo && !showPlot && (
                    <div className="h-1/3">
                      <div className="h-full bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            各話メモ
                          </h3>
                          <button
                            onClick={() => setShowMemo(false)}
                            className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                        <textarea
                          className="w-full h-[calc(100%-2rem)] p-3 bg-transparent resize-none focus:outline-none dark:text-white"
                          placeholder="この章に関するメモやアイデアを記入..."
                          value={memoContent}
                          onChange={(e) => setMemoContent(e.target.value)}
                          style={{ fontFamily: 'sans-serif', fontSize: '14px' }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <TextEditor
                  content={content}
                  onChange={setContent}
                  className="h-full p-6 bg-white dark:bg-gray-800"
                />
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-4">章を選択または作成して執筆を始めましょう</p>
                {!showSidebar && (
                  <button
                    onClick={() => setShowSidebar(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    章一覧を表示
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
