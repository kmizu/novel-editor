import { Project } from '../../types/project'
import { PencilIcon, TrashIcon, FolderOpenIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

interface ProjectCardProps {
  project: Project
  isActive: boolean
  onSelect: () => void
  onEdit: () => void
  onDelete: () => void
}

export default function ProjectCard({
  project,
  isActive,
  onSelect,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  // TODO: プロジェクトごとの章数と文字数を取得する
  const totalChapters = 0
  const totalWords = 0

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow ${
        isActive ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={onSelect}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.title}</h3>
          <p className="text-sm text-gray-600">{project.author}</p>
        </div>
        <div className="flex space-x-2 ml-4">
          <Link
            to={`/projects/${project.id}/statistics`}
            onClick={(e) => e.stopPropagation()}
            className="p-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded"
            title="統計"
          >
            <ChartBarIcon className="w-5 h-5" />
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
            title="編集"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded"
            title="削除"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-4 line-clamp-2">
        {project.synopsis || 'あらすじが未設定です'}
      </p>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span>{totalChapters} 章</span>
          <span>{totalWords.toLocaleString()} 文字</span>
        </div>
        {isActive && (
          <span className="flex items-center text-blue-600">
            <FolderOpenIcon className="w-4 h-4 mr-1" />
            アクティブ
          </span>
        )}
      </div>

      {project.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
