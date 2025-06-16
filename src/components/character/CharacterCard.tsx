import { Character } from '../../types/project'

interface CharacterCardProps {
  character: Character
  onEdit: (character: Character) => void
  onDelete: (id: string) => void
}

export function CharacterCard({ character, onEdit, onDelete }: CharacterCardProps) {
  const getRoleBadgeColor = (role: Character['role']) => {
    switch (role) {
      case 'protagonist':
        return 'bg-red-100 text-red-800'
      case 'antagonist':
        return 'bg-purple-100 text-purple-800'
      case 'main':
        return 'bg-blue-100 text-blue-800'
      case 'support':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleLabel = (role: Character['role']) => {
    switch (role) {
      case 'protagonist':
        return '主人公'
      case 'antagonist':
        return '敵役'
      case 'main':
        return 'メイン'
      case 'support':
        return 'サブ'
      default:
        return 'その他'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{character.name}</h3>
          {character.furigana && <p className="text-sm text-gray-500">{character.furigana}</p>}
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(character.role)}`}
        >
          {getRoleLabel(character.role)}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        {(character.age || character.gender) && (
          <div className="flex gap-4">
            {character.age && <span>年齢: {character.age}歳</span>}
            {character.gender && <span>性別: {character.gender}</span>}
          </div>
        )}

        {character.appearance && (
          <div>
            <p className="font-medium text-gray-700">外見:</p>
            <p className="line-clamp-2">{character.appearance}</p>
          </div>
        )}

        {character.personality && (
          <div>
            <p className="font-medium text-gray-700">性格:</p>
            <p className="line-clamp-2">{character.personality}</p>
          </div>
        )}
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => onEdit(character)}
          className="text-sm text-indigo-600 hover:text-indigo-900"
        >
          編集
        </button>
        <button
          onClick={() => {
            if (window.confirm(`「${character.name}」を削除しますか？`)) {
              onDelete(character.id)
            }
          }}
          className="text-sm text-red-600 hover:text-red-900"
        >
          削除
        </button>
      </div>
    </div>
  )
}
