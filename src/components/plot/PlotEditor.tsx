import { useState, useEffect } from 'react'
import { Plot } from '../../types/project'
import { useAutoSave } from '../../hooks/useAutoSave'
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

interface PlotEditorProps {
  plots: Plot[]
  chapters: Array<{ id: string; title: string; order: number }>
  onCreatePlot: (plotData: Omit<Plot, 'id' | 'createdAt' | 'updatedAt'>) => Plot | null
  onUpdatePlot: (plotId: string, updates: Partial<Plot>) => boolean
  onDeletePlot: (plotId: string) => boolean
  onReorderPlots: (plotIds: string[]) => boolean
}

export default function PlotEditor({
  plots,
  chapters,
  onCreatePlot,
  onUpdatePlot,
  onDeletePlot,
  onReorderPlots: _onReorderPlots, // TODO: ドラッグ&ドロップによる並び替え機能を実装
}: PlotEditorProps) {
  const [selectedPlotId, setSelectedPlotId] = useState<string>('')
  const [content, setContent] = useState('')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['main']))
  const [isCreatingPlot, setIsCreatingPlot] = useState(false)
  const [newPlotTitle, setNewPlotTitle] = useState('')
  const [newPlotType, setNewPlotType] = useState<Plot['type']>('main')
  const [newPlotChapterId, setNewPlotChapterId] = useState<string>('')

  // 選択中のプロット
  const selectedPlot = plots.find((p) => p.id === selectedPlotId)

  // 自動保存設定
  const {
    isSaving,
    lastSaved,
    error: saveError,
  } = useAutoSave({
    onSave: () => {
      if (selectedPlot && content !== selectedPlot.content) {
        onUpdatePlot(selectedPlotId, { content })
      }
    },
    delay: 1000,
    dependencies: [content, selectedPlotId],
  })

  // プロットをタイプ別にグループ化
  const mainPlots = plots.filter((p) => p.type === 'main').sort((a, b) => a.order - b.order)
  const subPlots = plots.filter((p) => p.type === 'sub').sort((a, b) => a.order - b.order)
  const chapterPlots = chapters.map((chapter) => ({
    chapter,
    plots: plots
      .filter((p) => p.type === 'chapter' && p.chapterId === chapter.id)
      .sort((a, b) => a.order - b.order),
  }))

  // 初期選択設定
  useEffect(() => {
    if (plots.length > 0 && !selectedPlotId) {
      setSelectedPlotId(plots[0].id)
    }
  }, [plots, selectedPlotId])

  // プロットが選択されたときの処理
  useEffect(() => {
    if (selectedPlot) {
      setContent(selectedPlot.content)
    }
  }, [selectedPlot])

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const handleCreatePlot = () => {
    if (newPlotTitle.trim()) {
      let order = 0
      if (newPlotType === 'main') {
        order = mainPlots.length
      } else if (newPlotType === 'sub') {
        order = subPlots.length
      } else if (newPlotType === 'chapter' && newPlotChapterId) {
        const chapterGroup = chapterPlots.find((cp) => cp.chapter.id === newPlotChapterId)
        order = chapterGroup?.plots.length || 0
      }

      const newPlot = onCreatePlot({
        projectId: selectedPlot?.projectId || '',
        title: newPlotTitle,
        content: '',
        type: newPlotType,
        chapterId: newPlotType === 'chapter' ? newPlotChapterId : undefined,
        order,
      })

      if (newPlot) {
        setSelectedPlotId(newPlot.id)
        setNewPlotTitle('')
        setIsCreatingPlot(false)
        setNewPlotChapterId('')
      }
    }
  }

  const handleDeletePlot = (plotId: string) => {
    if (window.confirm('このプロットを削除してもよろしいですか？')) {
      onDeletePlot(plotId)
      if (plotId === selectedPlotId && plots.length > 1) {
        const remainingPlots = plots.filter((p) => p.id !== plotId)
        if (remainingPlots.length > 0) {
          setSelectedPlotId(remainingPlots[0].id)
        }
      }
    }
  }

  const renderPlotItem = (plot: Plot, showDelete = true) => (
    <div
      key={plot.id}
      className={`
        flex items-center justify-between px-3 py-2 rounded cursor-pointer group
        ${selectedPlotId === plot.id ? 'bg-blue-50 border border-blue-300' : 'hover:bg-gray-100'}
      `}
      onClick={() => setSelectedPlotId(plot.id)}
    >
      <span className="text-sm truncate">{plot.title}</span>
      {showDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDeletePlot(plot.id)
          }}
          className="p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      )}
    </div>
  )

  return (
    <div className="flex h-full">
      {/* サイドバー */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">プロット一覧</h3>
          </div>

          {!isCreatingPlot ? (
            <button
              onClick={() => setIsCreatingPlot(true)}
              className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              新しいプロット
            </button>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                value={newPlotTitle}
                onChange={(e) => setNewPlotTitle(e.target.value)}
                placeholder="プロットのタイトル"
                className="w-full px-3 py-2 border rounded"
                autoFocus
              />
              <select
                value={newPlotType}
                onChange={(e) => setNewPlotType(e.target.value as Plot['type'])}
                className="w-full px-3 py-2 border rounded"
              >
                <option value="main">メインプロット</option>
                <option value="sub">サブプロット</option>
                <option value="chapter">章別プロット</option>
              </select>
              {newPlotType === 'chapter' && (
                <select
                  value={newPlotChapterId}
                  onChange={(e) => setNewPlotChapterId(e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="">章を選択</option>
                  {chapters.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      第{chapter.order + 1}章: {chapter.title}
                    </option>
                  ))}
                </select>
              )}
              <div className="flex space-x-2">
                <button
                  onClick={handleCreatePlot}
                  disabled={
                    !newPlotTitle.trim() || (newPlotType === 'chapter' && !newPlotChapterId)
                  }
                  className="flex-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  作成
                </button>
                <button
                  onClick={() => {
                    setIsCreatingPlot(false)
                    setNewPlotTitle('')
                    setNewPlotChapterId('')
                  }}
                  className="flex-1 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                  キャンセル
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* メインプロット */}
          <div>
            <button
              onClick={() => toggleSection('main')}
              className="flex items-center w-full text-left font-medium text-gray-700 hover:text-gray-900"
            >
              {expandedSections.has('main') ? (
                <ChevronDownIcon className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 mr-1" />
              )}
              メインプロット ({mainPlots.length})
            </button>
            {expandedSections.has('main') && (
              <div className="mt-2 space-y-1 ml-5">
                {mainPlots.length === 0 ? (
                  <p className="text-sm text-gray-500">プロットがありません</p>
                ) : (
                  mainPlots.map((plot) => renderPlotItem(plot))
                )}
              </div>
            )}
          </div>

          {/* サブプロット */}
          <div>
            <button
              onClick={() => toggleSection('sub')}
              className="flex items-center w-full text-left font-medium text-gray-700 hover:text-gray-900"
            >
              {expandedSections.has('sub') ? (
                <ChevronDownIcon className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 mr-1" />
              )}
              サブプロット ({subPlots.length})
            </button>
            {expandedSections.has('sub') && (
              <div className="mt-2 space-y-1 ml-5">
                {subPlots.length === 0 ? (
                  <p className="text-sm text-gray-500">プロットがありません</p>
                ) : (
                  subPlots.map((plot) => renderPlotItem(plot))
                )}
              </div>
            )}
          </div>

          {/* 章別プロット */}
          <div>
            <button
              onClick={() => toggleSection('chapters')}
              className="flex items-center w-full text-left font-medium text-gray-700 hover:text-gray-900"
            >
              {expandedSections.has('chapters') ? (
                <ChevronDownIcon className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRightIcon className="w-4 h-4 mr-1" />
              )}
              章別プロット
            </button>
            {expandedSections.has('chapters') && (
              <div className="mt-2 space-y-3 ml-5">
                {chapterPlots.map(({ chapter, plots }) => (
                  <div key={chapter.id}>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      第{chapter.order + 1}章: {chapter.title}
                    </p>
                    <div className="space-y-1 ml-3">
                      {plots.length === 0 ? (
                        <p className="text-xs text-gray-500">プロットがありません</p>
                      ) : (
                        plots.map((plot) => renderPlotItem(plot))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {selectedPlot ? (
              <>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedPlot.title}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedPlot.type === 'main' && 'メインプロット'}
                    {selectedPlot.type === 'sub' && 'サブプロット'}
                    {selectedPlot.type === 'chapter' && `章別プロット`}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  {isSaving && <span className="text-sm text-blue-600">保存中...</span>}
                  {!isSaving && lastSaved && !saveError && (
                    <span className="text-sm text-green-600">保存済み</span>
                  )}
                  {saveError && <span className="text-sm text-red-600">保存エラー</span>}
                </div>
              </>
            ) : (
              <p className="text-gray-500">プロットを選択してください</p>
            )}
          </div>
        </div>

        <div className="flex-1 bg-gray-50 p-6">
          {selectedPlot ? (
            <div className="max-w-4xl mx-auto h-full">
              <textarea
                className="w-full h-full p-6 bg-white border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="プロットの内容を入力してください..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ fontFamily: 'sans-serif', fontSize: '16px', lineHeight: '1.8' }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <p className="text-gray-500 mb-4">プロットを作成または選択してください</p>
                <button
                  onClick={() => setIsCreatingPlot(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  新しいプロットを作成
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
