import { memo, useState } from 'react'
import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useEditorStore } from '../../stores/editorStore'
import { useProjectStore } from '../../stores/projectStore'
import type { ChapterMeta } from '../../types'

interface ChapterNavProps {
  chapters: ChapterMeta[]
  activeChapterId: string | null
  onSelect: (id: string) => void
  projectId: string
}

export const ChapterNav = memo(function ChapterNav({
  chapters,
  activeChapterId,
  onSelect,
  projectId,
}: ChapterNavProps) {
  const { updateChapterMeta, deleteChapter } = useEditorStore()
  useProjectStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')

  const startEdit = (chapter: ChapterMeta) => {
    setEditingId(chapter.id)
    setEditTitle(chapter.title)
  }

  const confirmEdit = async () => {
    if (!editingId || !editTitle.trim()) return
    await updateChapterMeta(projectId, editingId, { title: editTitle.trim() })
    setEditingId(null)
  }

  const cancelEdit = () => setEditingId(null)

  const handleDelete = async (chapter: ChapterMeta) => {
    if (!confirm(`「${chapter.title}」を削除しますか？\nこの操作は元に戻せません。`)) return
    await deleteChapter(projectId, chapter.id)
  }

  if (chapters.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-xs text-ash font-gothic text-center">
          まだ章がありません
        </p>
      </div>
    )
  }

  return (
    <ul className="flex-1 overflow-y-auto py-1">
      {chapters.map((chapter, index) => (
        <li key={chapter.id} className="group">
          {editingId === chapter.id ? (
            /* 編集中 */
            <div className="px-3 py-2 flex items-center gap-1">
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') confirmEdit()
                  if (e.key === 'Escape') cancelEdit()
                }}
                className="input-sumi text-xs flex-1 min-w-0"
                autoFocus
              />
              <button onClick={confirmEdit} className="btn-ghost p-1 shrink-0">
                <CheckIcon className="w-3 h-3 text-vermillion" />
              </button>
              <button onClick={cancelEdit} className="btn-ghost p-1 shrink-0">
                <XMarkIcon className="w-3 h-3" />
              </button>
            </div>
          ) : (
            /* 通常表示 */
            <div
              className={`
                flex items-center gap-2 px-3 py-2.5 cursor-pointer
                border-l-2 transition-all duration-150
                ${chapter.id === activeChapterId
                  ? 'border-l-vermillion bg-paper-dark dark:bg-night-raised text-ink dark:text-paper'
                  : 'border-l-transparent text-ash hover:text-ink dark:hover:text-paper hover:bg-paper-dark/50 dark:hover:bg-night-raised/50'
                }
              `}
            >
              {/* 章番号（縦書き風） */}
              <span
                className="text-xs text-ash flex-none w-4 text-center"
                aria-hidden="true"
              >
                {index + 1}
              </span>

              {/* タイトル（クリックで選択） */}
              <button
                onClick={() => onSelect(chapter.id)}
                className="flex-1 text-left min-w-0"
              >
                <span className="block text-xs font-mincho truncate leading-relaxed">
                  {chapter.title}
                </span>
                <span className="block text-xs text-ash font-gothic mt-0.5">
                  {chapter.wordCount.toLocaleString()} 字
                </span>
              </button>

              {/* アクション（hover時のみ表示） */}
              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button
                  onClick={() => startEdit(chapter)}
                  className="btn-ghost p-1"
                  title="タイトルを編集"
                >
                  <PencilIcon className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(chapter)}
                  className="btn-danger p-1"
                  title="章を削除"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
})
