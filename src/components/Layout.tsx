import { Outlet, Link, useLocation } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useTheme } from '../hooks/useTheme'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import {
  HomeIcon,
  FolderIcon,
  PencilIcon,
  ChartBarIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon,
  CogIcon,
  SunIcon,
  MoonIcon,
  PuzzlePieceIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'ホーム', href: '/', icon: HomeIcon },
  { name: 'プロジェクト', href: '/projects', icon: FolderIcon },
  { name: 'エディタ', href: '/editor', icon: PencilIcon },
  { name: 'プロット', href: '/plot', icon: ChartBarIcon },
  { name: 'キャラクター', href: '/characters', icon: UserGroupIcon },
  { name: '世界観', href: '/world-building', icon: GlobeAltIcon },
  { name: '統計', href: '/statistics', icon: ChartBarIcon },
  { name: '共同執筆', href: '/collaboration', icon: UsersIcon },
  { name: 'プラグイン', href: '/plugins', icon: PuzzlePieceIcon },
  { name: 'エクスポート', href: '/export', icon: ArrowDownTrayIcon },
  { name: '設定', href: '/settings', icon: CogIcon },
]

export default function Layout() {
  const location = useLocation()
  const { activeProject } = useProjects()
  const { theme, toggleTheme } = useTheme()
  useKeyboardShortcuts()

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* サイドバー */}
      <div className="w-64 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex flex-col h-full">
          {/* ロゴ部分 */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">小説エディタ</h1>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {theme === 'light' ? (
                <MoonIcon className="w-5 h-5" />
              ) : (
                <SunIcon className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* プロジェクト表示 */}
          {activeProject && (
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400">現在のプロジェクト</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {activeProject.title}
              </p>
            </div>
          )}

          {/* ナビゲーション */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200'
                      : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
