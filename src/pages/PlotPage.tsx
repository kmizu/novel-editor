import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, ListBulletIcon } from '@heroicons/react/24/outline'
import { useProjectStore } from '../stores/projectStore'
import { api } from '../api/tauri'
import type { Plot, SavePlotInput, PlotType } from '../types'

const PLOT_TYPE_LABELS: Record<PlotType, string> = {
  main: 'メインプロット',
  sub: 'サブプロット',
  chapter: '話ごとのメモ',
}

const PLOT_TYPE_COLORS: Record<PlotType, string> = {
  main: 'border-l-vermillion',
  sub: 'border-l-blue-400 dark:border-l-blue-600',
  chapter: 'border-l-ash',
}

const EMPTY_FORM: SavePlotInput = {
  title: '',
  content: '',
  plotType: 'main',
  chapterId: null,
}

interface PlotFormProps {
  initial?: SavePlotInput
  onSave: (input: SavePlotInput) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

function PlotForm({ initial = EMPTY_FORM, onSave, onCancel, isSaving }: PlotFormProps) {
  const [form, setForm] = useState<SavePlotInput>(initial)

  return (
    <div className="card-sumi p-5 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-ash font-gothic mb-1">種別</label>
          <select
            className="input-sumi w-full"
            value={form.plotType}
            onChange={(e) => setForm({ ...form, plotType: e.target.value as PlotType })}
          >
            {(Object.keys(PLOT_TYPE_LABELS) as PlotType[]).map((t) => (
              <option key={t} value={t}>{PLOT_TYPE_LABELS[t]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-ash font-gothic mb-1">タイトル *</label>
          <input
            className="input-sumi w-full"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="例: 主人公の目的"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-ash font-gothic mb-1">内容</label>
        <textarea
          className="input-sumi w-full h-36 resize-none"
          value={form.content ?? ''}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="プロットの詳細、展開、メモなど"
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onCancel} className="btn-ghost text-sm px-4 py-2">キャンセル</button>
        <button
          onClick={() => onSave(form)}
          disabled={isSaving || !form.title.trim()}
          className="btn-primary text-sm px-4 py-2"
        >
          {isSaving ? '保存中…' : '保存'}
        </button>
      </div>
    </div>
  )
}

export function PlotPage() {
  const { activeProject } = useProjectStore()
  const [plots, setPlots] = useState<Plot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeType, setActiveType] = useState<PlotType | 'all'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    if (!activeProject) return
    setIsLoading(true)
    api.listPlots(activeProject.id)
      .then(setPlots)
      .catch((e) => setError(String(e)))
      .finally(() => setIsLoading(false))
  }, [activeProject])

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-ash font-gothic text-sm">プロジェクトを選択してください</p>
      </div>
    )
  }

  const handleSave = async (input: SavePlotInput) => {
    setIsSaving(true)
    try {
      const saved = await api.savePlot(activeProject.id, input)
      setPlots((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id)
        return idx >= 0 ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved]
      })
      setEditingId(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このプロットを削除しますか？')) return
    try {
      await api.deletePlot(activeProject.id, id)
      setPlots((prev) => prev.filter((p) => p.id !== id))
    } catch (e) {
      setError(String(e))
    }
  }

  const filtered = activeType === 'all'
    ? plots
    : plots.filter((p) => p.plotType === activeType)

  const typeCounts = plots.reduce<Record<string, number>>((acc, p) => {
    acc[p.plotType] = (acc[p.plotType] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6 animate-fade-in">
        {/* ヘッダー */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-mincho text-2xl text-ink dark:text-paper tracking-wide">プロット</h1>
            <p className="text-sm text-ash font-gothic mt-1">{activeProject.title}</p>
          </div>
          {editingId !== 'new' && (
            <button
              onClick={() => setEditingId('new')}
              className="btn-primary gap-1.5 text-sm px-4 py-2"
            >
              <PlusIcon className="w-4 h-4" />
              追加
            </button>
          )}
        </div>

        {error && (
          <p className="text-sm text-vermillion font-gothic bg-vermillion/5 px-3 py-2">{error}</p>
        )}

        {/* 新規作成フォーム */}
        {editingId === 'new' && (
          <PlotForm
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            isSaving={isSaving}
          />
        )}

        {/* フィルタータブ */}
        {plots.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveType('all')}
              className={`text-xs font-gothic px-3 py-1 border transition-colors ${
                activeType === 'all'
                  ? 'border-ink dark:border-paper text-ink dark:text-paper bg-paper-dark dark:bg-night-raised'
                  : 'border-ash/30 text-ash hover:border-ash'
              }`}
            >
              すべて ({plots.length})
            </button>
            {(Object.keys(PLOT_TYPE_LABELS) as PlotType[]).map((t) => {
              const count = typeCounts[t] ?? 0
              if (count === 0) return null
              return (
                <button
                  key={t}
                  onClick={() => setActiveType(t)}
                  className={`text-xs font-gothic px-3 py-1 border transition-colors ${
                    activeType === t
                      ? 'border-ink dark:border-paper text-ink dark:text-paper bg-paper-dark dark:bg-night-raised'
                      : 'border-ash/30 text-ash hover:border-ash'
                  }`}
                >
                  {PLOT_TYPE_LABELS[t]} ({count})
                </button>
              )
            })}
          </div>
        )}

        {/* プロット一覧 */}
        {isLoading ? (
          <p className="text-ash text-sm font-gothic text-center py-8">読み込み中…</p>
        ) : filtered.length === 0 && editingId !== 'new' ? (
          <div className="text-center py-12 space-y-2">
            <ListBulletIcon className="w-10 h-10 text-ash/40 mx-auto" />
            <p className="text-ash text-sm font-gothic">
              {activeType !== 'all' ? '該当するプロットがありません' : 'まだプロットがありません'}
            </p>
            {activeType === 'all' && (
              <button
                onClick={() => setEditingId('new')}
                className="text-xs text-vermillion font-gothic hover:underline"
              >
                最初のプロットを追加する
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((plot) =>
              editingId === plot.id ? (
                <PlotForm
                  key={plot.id}
                  initial={{
                    id: plot.id,
                    title: plot.title,
                    content: plot.content,
                    plotType: plot.plotType,
                    chapterId: plot.chapterId,
                  }}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                  isSaving={isSaving}
                />
              ) : (
                <div
                  key={plot.id}
                  className={`card-sumi border-l-4 ${PLOT_TYPE_COLORS[plot.plotType]}`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <button
                        className="min-w-0 flex-1 text-left"
                        onClick={() => setExpandedId(expandedId === plot.id ? null : plot.id)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mincho text-sm text-ink dark:text-paper">{plot.title}</span>
                          <span className="text-xs text-ash font-gothic">{PLOT_TYPE_LABELS[plot.plotType]}</span>
                        </div>
                        {plot.content && expandedId !== plot.id && (
                          <p className="text-xs text-ash font-gothic mt-1 line-clamp-1">{plot.content}</p>
                        )}
                      </button>
                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={() => setEditingId(plot.id)}
                          className="p-1.5 text-ash hover:text-ink dark:hover:text-paper transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(plot.id)}
                          className="p-1.5 text-ash hover:text-vermillion transition-colors"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  {expandedId === plot.id && plot.content && (
                    <div className="px-4 pb-4 border-t border-paper-dark dark:border-night-raised pt-3">
                      <p className="text-sm text-ink dark:text-paper/80 font-gothic whitespace-pre-line">{plot.content}</p>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  )
}
