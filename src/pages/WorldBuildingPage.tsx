import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, GlobeAltIcon } from '@heroicons/react/24/outline'
import { useProjectStore } from '../stores/projectStore'
import { api } from '../api/tauri'
import type { WorldSetting, SaveWorldSettingInput, WorldCategory } from '../types'

const CATEGORY_LABELS: Record<WorldCategory, string> = {
  geography: '地理',
  history: '歴史',
  culture: '文化',
  politics: '政治',
  magic: '魔法・超能力',
  technology: '技術',
  other: 'その他',
}

const CATEGORY_ICONS: Record<WorldCategory, string> = {
  geography: '🗺️',
  history: '📜',
  culture: '🎭',
  politics: '⚖️',
  magic: '✨',
  technology: '⚙️',
  other: '📝',
}

const EMPTY_FORM: SaveWorldSettingInput = {
  category: 'other',
  title: '',
  content: '',
  tags: [],
}

interface WorldFormProps {
  initial?: SaveWorldSettingInput
  onSave: (input: SaveWorldSettingInput) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

function WorldForm({ initial = EMPTY_FORM, onSave, onCancel, isSaving }: WorldFormProps) {
  const [form, setForm] = useState<SaveWorldSettingInput>(initial)
  const [tagInput, setTagInput] = useState('')

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !(form.tags ?? []).includes(tag)) {
      setForm({ ...form, tags: [...(form.tags ?? []), tag] })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: (form.tags ?? []).filter((t) => t !== tag) })
  }

  return (
    <div className="card-sumi p-5 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-ash font-gothic mb-1">カテゴリ</label>
          <select
            className="input-sumi w-full"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as WorldCategory })}
          >
            {(Object.keys(CATEGORY_LABELS) as WorldCategory[]).map((c) => (
              <option key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-ash font-gothic mb-1">タイトル *</label>
          <input
            className="input-sumi w-full"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="例: 魔法の仕組み"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-ash font-gothic mb-1">内容</label>
        <textarea
          className="input-sumi w-full h-40 resize-none"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          placeholder="詳細な説明、設定の詳細など"
        />
      </div>

      <div>
        <label className="block text-xs text-ash font-gothic mb-1">タグ</label>
        <div className="flex gap-2 mb-2">
          <input
            className="input-sumi flex-1 text-sm"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            placeholder="タグを入力してEnter"
          />
          <button onClick={addTag} className="btn-ghost text-sm px-3 py-1.5">追加</button>
        </div>
        {(form.tags ?? []).length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {(form.tags ?? []).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 text-xs font-gothic bg-paper-dark dark:bg-night-raised px-2 py-0.5 text-ash"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="hover:text-vermillion">×</button>
              </span>
            ))}
          </div>
        )}
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

export function WorldBuildingPage() {
  const { activeProject } = useProjectStore()
  const [settings, setSettings] = useState<WorldSetting[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [activeCategory, setActiveCategory] = useState<WorldCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!activeProject) return
    setIsLoading(true)
    api.listWorldSettings(activeProject.id)
      .then(setSettings)
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

  const handleSave = async (input: SaveWorldSettingInput) => {
    setIsSaving(true)
    try {
      const saved = await api.saveWorldSetting(activeProject.id, input)
      setSettings((prev) => {
        const idx = prev.findIndex((s) => s.id === saved.id)
        return idx >= 0 ? prev.map((s) => (s.id === saved.id ? saved : s)) : [saved, ...prev]
      })
      setEditingId(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('この設定を削除しますか？')) return
    try {
      await api.deleteWorldSetting(activeProject.id, id)
      setSettings((prev) => prev.filter((s) => s.id !== id))
    } catch (e) {
      setError(String(e))
    }
  }

  const filtered = settings.filter((s) => {
    const categoryMatch = activeCategory === 'all' || s.category === activeCategory
    const searchMatch = !search || s.title.includes(search) || s.content.includes(search) || s.tags.some((t) => t.includes(search))
    return categoryMatch && searchMatch
  })

  const categoryCounts = settings.reduce<Record<string, number>>((acc, s) => {
    acc[s.category] = (acc[s.category] ?? 0) + 1
    return acc
  }, {})

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6 animate-fade-in">
        {/* ヘッダー */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-mincho text-2xl text-ink dark:text-paper tracking-wide">世界観設定</h1>
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
          <WorldForm
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            isSaving={isSaving}
          />
        )}

        {/* フィルター */}
        {settings.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setActiveCategory('all')}
                className={`text-xs font-gothic px-3 py-1 border transition-colors ${
                  activeCategory === 'all'
                    ? 'border-ink dark:border-paper text-ink dark:text-paper bg-paper-dark dark:bg-night-raised'
                    : 'border-ash/30 text-ash hover:border-ash'
                }`}
              >
                すべて ({settings.length})
              </button>
              {(Object.keys(CATEGORY_LABELS) as WorldCategory[]).map((cat) => {
                const count = categoryCounts[cat] ?? 0
                if (count === 0) return null
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`text-xs font-gothic px-3 py-1 border transition-colors ${
                      activeCategory === cat
                        ? 'border-ink dark:border-paper text-ink dark:text-paper bg-paper-dark dark:bg-night-raised'
                        : 'border-ash/30 text-ash hover:border-ash'
                    }`}
                  >
                    {CATEGORY_ICONS[cat]} {CATEGORY_LABELS[cat]} ({count})
                  </button>
                )
              })}
            </div>
            {settings.length > 5 && (
              <input
                className="input-sumi w-full text-sm"
                placeholder="タイトル・内容・タグで検索…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            )}
          </div>
        )}

        {/* 一覧 */}
        {isLoading ? (
          <p className="text-ash text-sm font-gothic text-center py-8">読み込み中…</p>
        ) : filtered.length === 0 && editingId !== 'new' ? (
          <div className="text-center py-12 space-y-2">
            <GlobeAltIcon className="w-10 h-10 text-ash/40 mx-auto" />
            <p className="text-ash text-sm font-gothic">
              {search || activeCategory !== 'all' ? '該当する設定がありません' : 'まだ世界観設定がありません'}
            </p>
            {!search && activeCategory === 'all' && (
              <button
                onClick={() => setEditingId('new')}
                className="text-xs text-vermillion font-gothic hover:underline"
              >
                最初の設定を追加する
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((setting) =>
              editingId === setting.id ? (
                <WorldForm
                  key={setting.id}
                  initial={{
                    id: setting.id,
                    category: setting.category,
                    title: setting.title,
                    content: setting.content,
                    tags: setting.tags,
                  }}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                  isSaving={isSaving}
                />
              ) : (
                <div key={setting.id} className="card-sumi p-4 space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm text-ash">{CATEGORY_ICONS[setting.category]}</span>
                        <span className="font-mincho text-base text-ink dark:text-paper">{setting.title}</span>
                        <span className="text-xs text-ash font-gothic border border-ash/20 px-1.5 py-0.5">
                          {CATEGORY_LABELS[setting.category]}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setEditingId(setting.id)}
                        className="p-1.5 text-ash hover:text-ink dark:hover:text-paper transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(setting.id)}
                        className="p-1.5 text-ash hover:text-vermillion transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {setting.content && (
                    <p className="text-sm text-ink dark:text-paper/80 font-gothic line-clamp-4 whitespace-pre-line">
                      {setting.content}
                    </p>
                  )}

                  {setting.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {setting.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-gothic bg-paper-dark dark:bg-night-raised text-ash px-2 py-0.5"
                        >
                          {tag}
                        </span>
                      ))}
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
