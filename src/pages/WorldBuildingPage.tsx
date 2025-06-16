import { useState } from 'react'
import { useWorldSettings } from '../hooks/useWorldSettings'
import { WorldSettingCard } from '../components/worldbuilding/WorldSettingCard'
import { WorldSettingForm } from '../components/worldbuilding/WorldSettingForm'
import { WorldSetting } from '../types/project'
import { useProjects } from '../hooks/useProjects'

export default function WorldBuildingPage() {
  const { currentProject } = useProjects()
  const { worldSettings, addWorldSetting, updateWorldSetting, deleteWorldSetting } =
    useWorldSettings()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingSetting, setEditingSetting] = useState<WorldSetting | undefined>()
  const [selectedCategory, setSelectedCategory] = useState<WorldSetting['category'] | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">プロジェクトを選択してください</p>
      </div>
    )
  }

  const handleSubmit = (settingData: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingSetting) {
      updateWorldSetting(editingSetting.id, settingData)
    } else {
      addWorldSetting({
        ...settingData,
        projectId: currentProject.id,
      })
    }
    setIsFormOpen(false)
    setEditingSetting(undefined)
  }

  const handleEdit = (setting: WorldSetting) => {
    setEditingSetting(setting)
    setIsFormOpen(true)
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setEditingSetting(undefined)
  }

  const filteredSettings = worldSettings.filter((setting) => {
    const matchesCategory = selectedCategory === 'all' || setting.category === selectedCategory
    const matchesSearch =
      setting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  const categories: { value: WorldSetting['category'] | 'all'; label: string }[] = [
    { value: 'all', label: 'すべて' },
    { value: 'geography', label: '地理' },
    { value: 'history', label: '歴史' },
    { value: 'culture', label: '文化' },
    { value: 'politics', label: '政治' },
    { value: 'magic', label: '魔法・超能力' },
    { value: 'technology', label: '技術・科学' },
    { value: 'other', label: 'その他' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">世界観設定</h1>
        <p className="mt-1 text-sm text-gray-600">物語の舞台となる世界の設定を管理できます</p>
      </div>

      {!isFormOpen && (
        <>
          <div className="mb-6">
            <div className="flex gap-2 flex-wrap mb-4">
              {categories.map((category) => (
                <button
                  key={category.value}
                  onClick={() => setSelectedCategory(category.value)}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    selectedCategory === category.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <input
                type="text"
                placeholder="検索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                新規設定追加
              </button>
            </div>
          </div>

          {filteredSettings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                {searchTerm || selectedCategory !== 'all'
                  ? '条件に一致する設定がありません'
                  : 'まだ世界観設定が登録されていません'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredSettings.map((setting) => (
                <WorldSettingCard
                  key={setting.id}
                  setting={setting}
                  onEdit={handleEdit}
                  onDelete={deleteWorldSetting}
                />
              ))}
            </div>
          )}
        </>
      )}

      {isFormOpen && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            {editingSetting ? '世界観設定編集' : '新規世界観設定'}
          </h2>
          <WorldSettingForm
            setting={editingSetting}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      )}
    </div>
  )
}
