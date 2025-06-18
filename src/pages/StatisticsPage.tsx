import { useState, useMemo } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useChapters } from '../hooks/useChapters'
import { useWritingSession } from '../hooks/useWritingSession'
import SimpleStatisticsDashboard from '../components/statistics/SimpleStatisticsDashboard'
import SimpleWritingStyleAnalysis from '../components/statistics/SimpleWritingStyleAnalysis'
import { ChartBarIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

export default function StatisticsPage() {
  const { activeProject } = useProjects()
  const { chapters } = useChapters(activeProject?.id || null)
  const { sessions } = useWritingSession(activeProject?.id || '', undefined, undefined)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'style'>('dashboard')

  const stats = useMemo(() => {
    const totalWords = chapters.reduce((sum, ch) => sum + (ch.wordCount || 0), 0)
    const totalChapters = chapters.length
    const allText = chapters.map((ch) => ch.content).join('\n')

    return {
      totalWords,
      totalChapters,
      allText,
    }
  }, [chapters])

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">プロジェクトを選択してください</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">統計・分析</h1>
          <p className="text-gray-600 mt-2">{activeProject.title} の執筆統計</p>
        </div>

        {/* タブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <ChartBarIcon className="w-5 h-5 mr-2" />
                執筆統計
              </button>
              <button
                onClick={() => setActiveTab('style')}
                className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'style'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <DocumentTextIcon className="w-5 h-5 mr-2" />
                文体分析
              </button>
            </nav>
          </div>
        </div>

        {/* コンテンツ */}
        {activeTab === 'dashboard' ? (
          <SimpleStatisticsDashboard
            sessions={sessions}
            totalWords={stats.totalWords}
            totalChapters={stats.totalChapters}
          />
        ) : (
          <SimpleWritingStyleAnalysis text={stats.allText} />
        )}
      </div>
    </div>
  )
}
