import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, PencilIcon, TrashIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { useProjectStore } from '../stores/projectStore'
import type { ProjectMeta, CreateProjectInput } from '../types'

export function ProjectsPage() {
  const navigate = useNavigate()
  const { projects, activeProject, loadProjects, createProject, deleteProject, setActiveProject } = useProjectStore()
  const [isCreating, setIsCreating] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState<CreateProjectInput>({
    title: '',
    author: '',
    description: '',
    genre: '',
    synopsis: '',
  })

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const filtered = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.author.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreate = async () => {
    if (!form.title.trim() || !form.author.trim()) return
    const project = await createProject(form)
    setActiveProject(project)
    setIsCreating(false)
    setForm({ title: '', author: '', description: '', genre: '', synopsis: '' })
    navigate('/editor')
  }

  const handleSelect = (project: ProjectMeta) => {
    setActiveProject(project)
    navigate('/editor')
  }

  const handleDelete = async (e: React.MouseEvent, project: ProjectMeta) => {
    e.stopPropagation()
    if (!confirm(`「${project.title}」を削除しますか？\nすべての章・設定が失われます。`)) return
    await deleteProject(project.id)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* ページヘッダー */}
      <div className="
        px-8 py-6 shrink-0
        border-b border-paper-darker dark:border-night-border
        bg-paper dark:bg-night
      ">
        <div className="max-w-4xl mx-auto flex items-end justify-between gap-4">
          <div>
            <h1 className="font-mincho text-2xl text-ink dark:text-paper tracking-wide">
              プロジェクト
            </h1>
            <p className="text-sm text-ash font-gothic mt-1">
              {projects.length > 0
                ? `${projects.length} 作品`
                : '作品はまだありません'
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* 検索 */}
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="タイトル・作者で検索"
              className="input-sumi text-sm w-48"
            />
            {/* 新規作成 */}
            <button
              onClick={() => setIsCreating(true)}
              className="btn-primary flex items-center gap-1.5"
            >
              <PlusIcon className="w-4 h-4" />
              <span className="font-gothic text-sm">新規作成</span>
            </button>
          </div>
        </div>
      </div>

      {/* 新規作成フォーム */}
      {isCreating && (
        <div className="
          border-b border-paper-darker dark:border-night-border
          bg-paper-dark dark:bg-night-surface
          animate-slide-up
        ">
          <div className="max-w-4xl mx-auto px-8 py-6 space-y-4">
            <h2 className="font-mincho text-lg text-ink dark:text-paper">新しい作品</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-ash font-gothic">タイトル *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="input-sumi w-full"
                  placeholder="作品タイトル"
                  autoFocus
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-ash font-gothic">作者名 *</label>
                <input
                  type="text"
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="input-sumi w-full"
                  placeholder="ペンネーム"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-ash font-gothic">ジャンル</label>
                <input
                  type="text"
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="input-sumi w-full"
                  placeholder="異世界ファンタジー、現代など"
                />
              </div>
              <div className="space-y-1 col-span-2">
                <label className="text-xs text-ash font-gothic">あらすじ</label>
                <textarea
                  value={form.synopsis}
                  onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
                  className="input-sumi w-full resize-none"
                  rows={3}
                  placeholder="作品の概要を入力してください"
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setIsCreating(false)} className="btn-ghost font-gothic text-sm">
                キャンセル
              </button>
              <button
                onClick={handleCreate}
                disabled={!form.title.trim() || !form.author.trim()}
                className="btn-primary font-gothic text-sm"
              >
                作成して執筆開始
              </button>
            </div>
          </div>
        </div>
      )}

      {/* プロジェクト一覧 */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          {filtered.length === 0 ? (
            <div className="text-center py-20 animate-fade-in">
              <BookOpenIcon className="w-12 h-12 text-ash/30 mx-auto mb-4" />
              <p className="font-mincho text-ink dark:text-paper text-lg mb-2">
                {search ? '見つかりませんでした' : 'まだ作品がありません'}
              </p>
              <p className="text-sm text-ash font-gothic">
                {search
                  ? '別のキーワードで検索してみてください'
                  : '「新規作成」ボタンから最初の作品を始めましょう'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isActive={activeProject?.id === project.id}
                  onSelect={() => handleSelect(project)}
                  onDelete={(e) => handleDelete(e, project)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// プロジェクトカード
// ============================================================
interface ProjectCardProps {
  project: ProjectMeta
  isActive: boolean
  onSelect: () => void
  onDelete: (e: React.MouseEvent) => void
}

function ProjectCard({ project, isActive, onSelect, onDelete }: ProjectCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        card-sumi p-5 cursor-pointer
        border-l-4 transition-all duration-200
        hover:shadow-md
        group
        ${isActive
          ? 'border-l-vermillion shadow-sm'
          : 'border-l-transparent hover:border-l-paper-darker dark:hover:border-l-night-border'
        }
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* タイトル・作者 */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <h2 className="font-mincho text-base text-ink dark:text-paper font-semibold leading-snug">
              {project.title}
            </h2>
            {isActive && (
              <span className="text-xs text-vermillion font-gothic">執筆中</span>
            )}
          </div>
          <p className="text-xs text-ash font-gothic mt-0.5">{project.author}</p>

          {/* あらすじ */}
          {project.synopsis && (
            <p className="text-sm text-ink-muted dark:text-ash font-mincho mt-2 line-clamp-2 leading-relaxed">
              {project.synopsis}
            </p>
          )}

          {/* メタ情報 */}
          <div className="flex items-center gap-4 mt-3 text-xs text-ash font-gothic">
            <span>{project.chapterCount} 章</span>
            <span>{project.totalWordCount.toLocaleString()} 字</span>
            {project.genre && <span>{project.genre}</span>}
            <span className="ml-auto">
              {new Date(project.updatedAt).toLocaleDateString('ja-JP')}
            </span>
          </div>
        </div>

        {/* アクション */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); /* TODO: edit */ }}
            className="btn-ghost p-1.5"
            title="編集"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="btn-danger p-1.5"
            title="削除"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
