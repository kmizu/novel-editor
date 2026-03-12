import { useState, useCallback, useEffect, useRef } from 'react'
import {
  PlusIcon, EyeIcon, EyeSlashIcon,
  ChevronLeftIcon, ChevronRightIcon,
  ArrowsPointingInIcon, ArrowsPointingOutIcon,
} from '@heroicons/react/24/outline'
import { useProjectStore } from '../stores/projectStore'
import { useEditorStore } from '../stores/editorStore'
import { useSettingsStore } from '../stores/settingsStore'
import { WritingEditor } from '../components/editor/WritingEditor'
import { NovelPreview } from '../components/editor/NovelPreview'
import { WritingModeToggle } from '../components/editor/WritingModeToggle'
import { ChapterNav } from '../components/editor/ChapterNav'
import { countCharacters } from '../utils/ruby'

const AUTOSAVE_DELAY = 3000

export function EditorPage() {
  const { activeProject } = useProjectStore()
  const {
    chapters,
    activeChapter,
    isSaving,
    lastSaved,
    saveError,
    loadChapters,
    selectChapter,
    createChapter,
    saveContent,
    clearEditor,
  } = useEditorStore()
  const { focusMode, toggleFocusMode } = useSettingsStore()

  const [localContent, setLocalContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showChapterNav, setShowChapterNav] = useState(true)
  const [newChapterTitle, setNewChapterTitle] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (activeProject) {
      loadChapters(activeProject.id)
    } else {
      clearEditor()
    }
  }, [activeProject, loadChapters, clearEditor])

  useEffect(() => {
    setLocalContent(activeChapter?.content ?? '')
  }, [activeChapter?.id, activeChapter?.content])

  const handleContentChange = useCallback(
    (content: string) => {
      setLocalContent(content)
      if (!activeProject || !activeChapter) return
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
      autoSaveTimer.current = setTimeout(() => {
        saveContent(activeProject.id, activeChapter.id, content)
      }, AUTOSAVE_DELAY)
    },
    [activeProject, activeChapter, saveContent]
  )

  // 手動保存
  const handleManualSave = useCallback(() => {
    if (!activeProject || !activeChapter) return
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    saveContent(activeProject.id, activeChapter.id, localContent)
  }, [activeProject, activeChapter, localContent, saveContent])

  // キーボードショートカット
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey
      if (mod && e.key === 's') {
        e.preventDefault()
        handleManualSave()
      }
      if (mod && e.shiftKey && e.key === 'F') {
        e.preventDefault()
        toggleFocusMode()
      }
      if (e.key === 'Escape' && focusMode) {
        toggleFocusMode()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleManualSave, toggleFocusMode, focusMode])

  useEffect(() => {
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [])

  const handleCreateChapter = useCallback(async () => {
    if (!activeProject || !newChapterTitle.trim()) return
    const chapter = await createChapter(activeProject.id, { title: newChapterTitle.trim() })
    setNewChapterTitle('')
    setIsCreating(false)
    selectChapter(activeProject.id, chapter.id)
  }, [activeProject, newChapterTitle, createChapter, selectChapter])

  const wordCount = countCharacters(localContent)
  const totalWordCount = chapters.reduce((sum, c) => sum + c.wordCount, 0)

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-3 animate-fade-in">
          <p className="font-mincho text-ink dark:text-paper text-lg">
            プロジェクトを選択してください
          </p>
          <p className="text-sm text-ash font-gothic">
            サイドバーの「プロジェクト」からプロジェクトを選択するか、新規作成してください
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full">
      {/* 章ナビゲーション（フォーカスモード時は非表示） */}
      {showChapterNav && !focusMode && (
        <div className="w-56 flex-none flex flex-col border-r border-paper-darker dark:border-night-border">
          <div className="px-3 py-3 border-b border-paper-darker dark:border-night-border flex items-center justify-between">
            <span className="text-xs font-gothic text-ash tracking-wide">章一覧</span>
            <button
              onClick={() => setIsCreating(true)}
              className="btn-ghost p-1"
              title="新しい章を追加"
            >
              <PlusIcon className="w-4 h-4" />
            </button>
          </div>

          {isCreating && (
            <div className="px-3 py-2 border-b border-paper-darker dark:border-night-border animate-slide-up">
              <input
                type="text"
                value={newChapterTitle}
                onChange={(e) => setNewChapterTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateChapter()
                  if (e.key === 'Escape') setIsCreating(false)
                }}
                placeholder="章のタイトル"
                className="input-sumi text-xs w-full"
                autoFocus
              />
              <div className="flex gap-1 mt-2">
                <button onClick={handleCreateChapter} className="btn-primary text-xs px-2 py-1 flex-1">
                  作成
                </button>
                <button onClick={() => setIsCreating(false)} className="btn-ghost text-xs px-2 py-1">
                  キャンセル
                </button>
              </div>
            </div>
          )}

          <ChapterNav
            chapters={chapters}
            activeChapterId={activeChapter?.id ?? null}
            onSelect={(id) => activeProject && selectChapter(activeProject.id, id)}
            projectId={activeProject.id}
          />

          <div className="px-3 py-2 border-t border-paper-darker dark:border-night-border">
            <p className="text-xs text-ash font-gothic">
              合計 {totalWordCount.toLocaleString()} 字
            </p>
          </div>
        </div>
      )}

      {/* メインエディタエリア */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* ツールバー */}
        <div className="
          px-4 py-2 flex items-center gap-3
          border-b border-paper-darker dark:border-night-border
          shrink-0
        ">
          {/* 章ナビ折りたたみ（フォーカスモード時は非表示） */}
          {!focusMode && (
            <button
              onClick={() => setShowChapterNav(!showChapterNav)}
              className="btn-ghost p-1"
              title={showChapterNav ? '章一覧を隠す' : '章一覧を表示'}
            >
              {showChapterNav
                ? <ChevronLeftIcon className="w-4 h-4" />
                : <ChevronRightIcon className="w-4 h-4" />
              }
            </button>
          )}

          {/* 現在の章タイトル */}
          <span className="font-mincho text-sm text-ink dark:text-paper truncate flex-1 min-w-0">
            {activeChapter?.title ?? '章を選択してください'}
          </span>

          {/* ツール群 */}
          <div className="flex items-center gap-2 shrink-0">
            <WritingModeToggle />

            <span className="text-xs text-ash font-gothic hidden sm:inline">
              {wordCount.toLocaleString()} 字
            </span>

            <span className={
              saveError ? 'save-status-error' :
              isSaving ? 'save-status-saving' :
              'save-status-saved'
            }>
              {saveError ? '保存エラー' : isSaving ? '保存中…' : lastSaved ? '保存済み' : ''}
            </span>

            {/* プレビュートグル */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn-ghost p-1"
              title={showPreview ? 'プレビューを隠す' : '縦書きプレビューを表示'}
            >
              {showPreview
                ? <EyeSlashIcon className="w-4 h-4" />
                : <EyeIcon className="w-4 h-4" />
              }
            </button>

            {/* 集中モードトグル */}
            <button
              onClick={toggleFocusMode}
              className="btn-ghost p-1"
              title={focusMode ? '集中モード解除 (Esc)' : '集中モード (⌘⇧F)'}
            >
              {focusMode
                ? <ArrowsPointingOutIcon className="w-4 h-4" />
                : <ArrowsPointingInIcon className="w-4 h-4" />
              }
            </button>
          </div>
        </div>

        {/* エディタ本体 */}
        <div className="flex-1 flex overflow-hidden">
          {activeChapter ? (
            <>
              <div className={`flex-1 overflow-hidden ${showPreview ? 'w-1/2' : 'w-full'}`}>
                <WritingEditor
                  content={localContent}
                  onChange={handleContentChange}
                />
              </div>

              {showPreview && (
                <div className="w-1/2">
                  <NovelPreview
                    content={localContent}
                    title={activeChapter.title}
                    className="h-full"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-ash text-sm font-gothic">
                章を選択して執筆を開始してください
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
