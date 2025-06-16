import { useState } from 'react'
import { useCharacters } from '../hooks/useCharacters'
import { CharacterCard } from '../components/character/CharacterCard'
import { CharacterForm } from '../components/character/CharacterForm'
import { Character } from '../types/project'
import { useProjects } from '../hooks/useProjects'

export default function CharactersPage() {
  const { currentProject } = useProjects()
  const { characters, addCharacter, updateCharacter, deleteCharacter } = useCharacters()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCharacter, setEditingCharacter] = useState<Character | undefined>()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<Character['role'] | 'all'>('all')

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">プロジェクトを選択してください</p>
      </div>
    )
  }

  const handleSubmit = (characterData: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingCharacter) {
      updateCharacter(editingCharacter.id, characterData)
    } else {
      addCharacter({
        ...characterData,
        projectId: currentProject.id,
      })
    }
    setIsFormOpen(false)
    setEditingCharacter(undefined)
  }

  const handleEdit = (character: Character) => {
    setEditingCharacter(character)
    setIsFormOpen(true)
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingCharacter(undefined)
  }

  const filteredCharacters = characters.filter((character) => {
    const matchesSearch =
      character.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      character.furigana?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || character.role === filterRole
    return matchesSearch && matchesRole
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">キャラクター管理</h1>
        <p className="mt-1 text-sm text-gray-600">
          物語に登場するキャラクターのプロフィールを管理できます
        </p>
      </div>

      {!isFormOpen && (
        <>
          <div className="mb-6 flex justify-between items-center">
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="キャラクター名で検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as Character['role'] | 'all')}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="all">すべての役割</option>
                <option value="protagonist">主人公</option>
                <option value="antagonist">敵役</option>
                <option value="main">メインキャラクター</option>
                <option value="support">サブキャラクター</option>
                <option value="other">その他</option>
              </select>
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              新規キャラクター
            </button>
          </div>

          {filteredCharacters.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {searchTerm || filterRole !== 'all'
                  ? '条件に一致するキャラクターがいません'
                  : 'まだキャラクターが登録されていません'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCharacters.map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  onEdit={handleEdit}
                  onDelete={deleteCharacter}
                />
              ))}
            </div>
          )}
        </>
      )}

      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingCharacter ? 'キャラクター編集' : '新規キャラクター'}
          </h2>
          <CharacterForm
            character={editingCharacter}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  )
}
