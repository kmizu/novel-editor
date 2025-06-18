import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useChapters } from '../hooks/useChapters'
import { useCharacters } from '../hooks/useCharacters'
import { usePlots } from '../hooks/usePlots'
import { useWorldSettings } from '../hooks/useWorldSettings'
import ProjectShare from '../components/collaboration/ProjectShare'
import { UsersIcon, LockClosedIcon } from '@heroicons/react/24/outline'

export default function CollaborationPage() {
  const { activeProject } = useProjects()
  const { chapters } = useChapters(activeProject?.id || null)
  const { characters } = useCharacters()
  const { plots } = usePlots(activeProject?.id || null)
  const { worldSettings } = useWorldSettings()
  const [activeTab, setActiveTab] = useState<'share' | 'permissions'>('share')

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">プロジェクトを選択してください</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">共同執筆</h1>
          <p className="text-gray-600 mt-2">
            プロジェクトを他のユーザーと共有して、共同で執筆を進めましょう
          </p>
        </div>

        {/* タブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('share')}
                className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'share'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <UsersIcon className="w-5 h-5 mr-2" />
                共有設定
              </button>
              <button
                onClick={() => setActiveTab('permissions')}
                className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'permissions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <LockClosedIcon className="w-5 h-5 mr-2" />
                権限管理
              </button>
            </nav>
          </div>
        </div>

        {/* コンテンツ */}
        {activeTab === 'share' ? (
          <ProjectShare
            project={activeProject}
            chapters={chapters}
            characters={characters}
            plots={plots}
            worldSettings={worldSettings}
          />
        ) : (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">権限管理</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <LockClosedIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-2">権限管理機能は現在開発中です</p>
              <p className="text-sm text-gray-500">
                将来的には、ユーザーごとに編集権限を設定できるようになります
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
