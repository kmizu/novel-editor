import { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useProjectStore } from '../stores/projectStore'
import { api } from '../api/tauri'
import type { Character, SaveCharacterInput, CharacterRole } from '../types'

const ROLE_LABELS: Record<CharacterRole, string> = {
  protagonist: '主人公',
  antagonist: '敵役',
  main: 'メイン',
  support: 'サポート',
  other: 'その他',
}

const ROLE_COLORS: Record<CharacterRole, string> = {
  protagonist: 'bg-vermillion/10 text-vermillion border-vermillion/30',
  antagonist: 'bg-night/10 text-ink dark:text-paper border-ash/30',
  main: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  support: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800',
  other: 'bg-paper-dark dark:bg-night-raised text-ash border-ash/20',
}

const EMPTY_FORM: SaveCharacterInput = {
  name: '',
  furigana: '',
  age: '',
  gender: '',
  role: 'support',
  appearance: '',
  personality: '',
  background: '',
  notes: '',
  relationships: [],
}

interface CharacterFormProps {
  initial?: SaveCharacterInput
  onSave: (input: SaveCharacterInput) => Promise<void>
  onCancel: () => void
  isSaving: boolean
}

function CharacterForm({ initial = EMPTY_FORM, onSave, onCancel, isSaving }: CharacterFormProps) {
  const [form, setForm] = useState<SaveCharacterInput>(initial)

  const field = (key: keyof SaveCharacterInput) => (
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [key]: e.target.value })
  )

  return (
    <div className="card-sumi p-5 space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs text-ash font-gothic mb-1">名前 *</label>
          <input
            className="input-sumi w-full"
            value={form.name}
            onChange={field('name')}
            placeholder="例: 田中 一郎"
          />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs text-ash font-gothic mb-1">ふりがな</label>
          <input
            className="input-sumi w-full font-gothic"
            value={form.furigana ?? ''}
            onChange={field('furigana')}
            placeholder="たなか いちろう"
          />
        </div>
        <div>
          <label className="block text-xs text-ash font-gothic mb-1">役割</label>
          <select
            className="input-sumi w-full"
            value={form.role}
            onChange={field('role')}
          >
            {(Object.keys(ROLE_LABELS) as CharacterRole[]).map((r) => (
              <option key={r} value={r}>{ROLE_LABELS[r]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-ash font-gothic mb-1">年齢</label>
          <input
            className="input-sumi w-full"
            value={form.age ?? ''}
            onChange={field('age')}
            placeholder="17歳"
          />
        </div>
        <div>
          <label className="block text-xs text-ash font-gothic mb-1">性別</label>
          <input
            className="input-sumi w-full"
            value={form.gender ?? ''}
            onChange={field('gender')}
            placeholder="男性 / 女性 / 不明"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs text-ash font-gothic mb-1">外見</label>
        <textarea
          className="input-sumi w-full h-20 resize-none"
          value={form.appearance ?? ''}
          onChange={field('appearance')}
          placeholder="髪の色、体格、服装など"
        />
      </div>
      <div>
        <label className="block text-xs text-ash font-gothic mb-1">性格</label>
        <textarea
          className="input-sumi w-full h-20 resize-none"
          value={form.personality ?? ''}
          onChange={field('personality')}
          placeholder="性格、口癖、癖など"
        />
      </div>
      <div>
        <label className="block text-xs text-ash font-gothic mb-1">背景・過去</label>
        <textarea
          className="input-sumi w-full h-20 resize-none"
          value={form.background ?? ''}
          onChange={field('background')}
          placeholder="生い立ち、動機、秘密など"
        />
      </div>
      <div>
        <label className="block text-xs text-ash font-gothic mb-1">メモ</label>
        <textarea
          className="input-sumi w-full h-16 resize-none"
          value={form.notes ?? ''}
          onChange={field('notes')}
          placeholder="その他のメモ"
        />
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button onClick={onCancel} className="btn-ghost text-sm px-4 py-2">キャンセル</button>
        <button
          onClick={() => onSave(form)}
          disabled={isSaving || !form.name.trim()}
          className="btn-primary text-sm px-4 py-2"
        >
          {isSaving ? '保存中…' : '保存'}
        </button>
      </div>
    </div>
  )
}

export function CharactersPage() {
  const { activeProject } = useProjectStore()
  const [characters, setCharacters] = useState<Character[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | 'new' | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (!activeProject) return
    setIsLoading(true)
    api.listCharacters(activeProject.id)
      .then(setCharacters)
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

  const handleSave = async (input: SaveCharacterInput) => {
    setIsSaving(true)
    try {
      const saved = await api.saveCharacter(activeProject.id, input)
      setCharacters((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id)
        return idx >= 0 ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev]
      })
      setEditingId(null)
    } catch (e) {
      setError(String(e))
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('このキャラクターを削除しますか？')) return
    try {
      await api.deleteCharacter(activeProject.id, id)
      setCharacters((prev) => prev.filter((c) => c.id !== id))
    } catch (e) {
      setError(String(e))
    }
  }

  const filtered = characters.filter((c) =>
    c.name.includes(search) || c.furigana.includes(search)
  )

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6 animate-fade-in">
        {/* ヘッダー */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="font-mincho text-2xl text-ink dark:text-paper tracking-wide">キャラクター</h1>
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
          <CharacterForm
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
            isSaving={isSaving}
          />
        )}

        {/* 検索 */}
        {characters.length > 3 && (
          <input
            className="input-sumi w-full"
            placeholder="名前で検索…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        )}

        {/* キャラクター一覧 */}
        {isLoading ? (
          <p className="text-ash text-sm font-gothic text-center py-8">読み込み中…</p>
        ) : filtered.length === 0 && editingId !== 'new' ? (
          <div className="text-center py-12 space-y-2">
            <UserCircleIcon className="w-10 h-10 text-ash/40 mx-auto" />
            <p className="text-ash text-sm font-gothic">まだキャラクターがいません</p>
            <button
              onClick={() => setEditingId('new')}
              className="text-xs text-vermillion font-gothic hover:underline"
            >
              最初のキャラクターを追加する
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((character) =>
              editingId === character.id ? (
                <CharacterForm
                  key={character.id}
                  initial={{
                    id: character.id,
                    name: character.name,
                    furigana: character.furigana,
                    age: character.age,
                    gender: character.gender,
                    role: character.role,
                    appearance: character.appearance,
                    personality: character.personality,
                    background: character.background,
                    notes: character.notes,
                    relationships: character.relationships,
                  }}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                  isSaving={isSaving}
                />
              ) : (
                <div key={character.id} className="card-sumi p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mincho text-base text-ink dark:text-paper">{character.name}</span>
                        {character.furigana && (
                          <span className="text-xs text-ash font-gothic">({character.furigana})</span>
                        )}
                        <span className={`text-xs px-2 py-0.5 border font-gothic ${ROLE_COLORS[character.role]}`}>
                          {ROLE_LABELS[character.role]}
                        </span>
                        {character.age && (
                          <span className="text-xs text-ash font-gothic">{character.age}</span>
                        )}
                        {character.gender && (
                          <span className="text-xs text-ash font-gothic">{character.gender}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => setEditingId(character.id)}
                        className="p-1.5 text-ash hover:text-ink dark:hover:text-paper transition-colors"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(character.id)}
                        className="p-1.5 text-ash hover:text-vermillion transition-colors"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {(character.appearance || character.personality || character.background) && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-gothic border-t border-paper-dark dark:border-night-raised pt-3">
                      {character.appearance && (
                        <div>
                          <p className="text-ash mb-0.5">外見</p>
                          <p className="text-ink dark:text-paper/80 line-clamp-3">{character.appearance}</p>
                        </div>
                      )}
                      {character.personality && (
                        <div>
                          <p className="text-ash mb-0.5">性格</p>
                          <p className="text-ink dark:text-paper/80 line-clamp-3">{character.personality}</p>
                        </div>
                      )}
                      {character.background && (
                        <div>
                          <p className="text-ash mb-0.5">背景</p>
                          <p className="text-ink dark:text-paper/80 line-clamp-3">{character.background}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {character.notes && (
                    <p className="text-xs text-ash font-gothic border-t border-paper-dark dark:border-night-raised pt-2">
                      {character.notes}
                    </p>
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
