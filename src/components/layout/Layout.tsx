import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useProjects } from '../../hooks/useProjects'
import { useTheme } from '../../hooks/useTheme'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import ProjectEditDialog from '../project/ProjectEditDialog'
import {
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  QuestionMarkCircleIcon,
} from '@heroicons/react/24/outline'

export default function Layout() {
  const location = useLocation()
  const { activeProject, updateProject } = useProjects()
  const { theme, toggleTheme } = useTheme()
  const { shortcuts } = useKeyboardShortcuts()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [saveNotification, setSaveNotification] = useState(false)

  useEffect(() => {
    const handleSaveNotification = () => {
      setSaveNotification(true)
      setTimeout(() => setSaveNotification(false), 2000)
    }

    window.addEventListener('save-notification', handleSaveNotification)
    return () => window.removeEventListener('save-notification', handleSaveNotification)
  }, [])

  const menuItems = [
    { path: '/', label: 'ホーム', icon: '🏠' },
    { path: '/editor', label: 'エディタ', icon: '✍️' },
    { path: '/plot', label: 'プロット', icon: '📋' },
    { path: '/characters', label: 'キャラクター', icon: '👥' },
    { path: '/world', label: '世界観', icon: '🌍' },
    { path: '/export', label: 'エクスポート', icon: '📤' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* ヘッダー */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              ネット小説執筆支援エディタ
            </h1>
            <div className="flex items-center space-x-4">
              {activeProject && (
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activeProject.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {activeProject.author}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsEditDialogOpen(true)}
                    className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                    title="プロジェクト設定"
                  >
                    <Cog6ToothIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
              <button
                onClick={() => setShowShortcuts(!showShortcuts)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                title="キーボードショートカット"
              >
                <QuestionMarkCircleIcon className="w-5 h-5" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                title="テーマ切り替え"
              >
                {theme === 'light' ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <SunIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* サイドバーナビゲーション */}
        <nav className="w-64 bg-white dark:bg-gray-800 shadow-md min-h-[calc(100vh-4rem)]">
          <ul className="p-4 space-y-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg
                      transition-colors duration-200
                      ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-medium'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }
                    `}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* メインコンテンツエリア */}
        <main className="flex-1 p-8">
          <Outlet />
        </main>
      </div>

      {/* プロジェクト編集ダイアログ */}
      <ProjectEditDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        project={activeProject}
        onUpdate={updateProject}
      />

      {/* キーボードショートカット一覧 */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full animate-slide-in">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              キーボードショートカット
            </h2>
            <ul className="space-y-2">
              {shortcuts.map((shortcut, index) => (
                <li key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{shortcut.description}</span>
                  <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-gray-900 dark:text-white font-mono text-xs">
                    {shortcut.keys}
                  </kbd>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowShortcuts(false)}
              className="mt-6 w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {/* 保存通知 */}
      {saveNotification && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
          保存しました
        </div>
      )}
    </div>
  )
}
