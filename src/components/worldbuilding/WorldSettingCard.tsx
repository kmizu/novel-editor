import { WorldSetting } from '../../types/project'

interface WorldSettingCardProps {
  setting: WorldSetting
  onEdit: (setting: WorldSetting) => void
  onDelete: (id: string) => void
}

export function WorldSettingCard({ setting, onEdit, onDelete }: WorldSettingCardProps) {
  const getCategoryColor = (category: WorldSetting['category']) => {
    switch (category) {
      case 'geography':
        return 'bg-green-100 text-green-800'
      case 'history':
        return 'bg-yellow-100 text-yellow-800'
      case 'culture':
        return 'bg-purple-100 text-purple-800'
      case 'politics':
        return 'bg-red-100 text-red-800'
      case 'magic':
        return 'bg-indigo-100 text-indigo-800'
      case 'technology':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryLabel = (category: WorldSetting['category']) => {
    switch (category) {
      case 'geography':
        return '地理'
      case 'history':
        return '歴史'
      case 'culture':
        return '文化'
      case 'politics':
        return '政治'
      case 'magic':
        return '魔法・超能力'
      case 'technology':
        return '技術・科学'
      default:
        return 'その他'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{setting.title}</h3>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(setting.category)}`}
        >
          {getCategoryLabel(setting.category)}
        </span>
      </div>

      <p className="text-sm text-gray-600 line-clamp-3 mb-4">{setting.content}</p>

      {setting.tags.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1">
          {setting.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>更新: {new Date(setting.updatedAt).toLocaleDateString('ja-JP')}</span>
        <div className="flex gap-2">
          <button onClick={() => onEdit(setting)} className="text-indigo-600 hover:text-indigo-900">
            編集
          </button>
          <button
            onClick={() => {
              if (window.confirm(`「${setting.title}」を削除しますか？`)) {
                onDelete(setting.id)
              }
            }}
            className="text-red-600 hover:text-red-900"
          >
            削除
          </button>
        </div>
      </div>
    </div>
  )
}
