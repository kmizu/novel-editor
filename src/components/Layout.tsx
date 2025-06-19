import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useProjects } from '../hooks/useProjects'
import { useTheme } from '../hooks/useTheme'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { ElectronMenuHandler } from './ElectronMenuHandler'
import { ShortcutsModal } from './ShortcutsModal'
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
  Bars3Icon,
  XMarkIcon,
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false)
  useKeyboardShortcuts()

  // ショートカット一覧表示イベントのリスナー
  useEffect(() => {
    const handleShowShortcuts = () => setIsShortcutsModalOpen(true)
    window.addEventListener('show-shortcuts', handleShowShortcuts)
    return () => window.removeEventListener('show-shortcuts', handleShowShortcuts)
  }, [])

  // 画面幅が変わったらサイドバーを自動調整
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <ElectronMenuHandler />
      <ShortcutsModal isOpen={isShortcutsModalOpen} onClose={() => setIsShortcutsModalOpen(false)} />
      
      {/* モバイル用サイドバーオーバーレイ */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      
      {/* サイドバー */}
      <div className={`
        fixed md:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg
        transform transition-transform duration-300 ease-in-out md:transform-none
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* ロゴ部分 */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">小説エディタ</h1>
            <div className="flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                aria-label="テーマ切り替え"
              >
                {theme === 'light' ? (
                  <MoonIcon className="w-5 h-5" />
                ) : (
                  <SunIcon className="w-5 h-5" />
                )}
              </button>
              <button
                onClick={() => setIsSidebarOpen(false)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 md:hidden"
                aria-label="サイドバーを閉じる"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
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
                  onClick={() => setIsSidebarOpen(false)}
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
        {/* モバイル用ヘッダー */}
        <header className="md:hidden bg-white dark:bg-gray-800 shadow-sm">
          <div className="flex items-center justify-between h-16 px-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="メニューを開く"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">小説エディタ</h1>
            <button
              onClick={() => setIsShortcutsModalOpen(true)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="ショートカット一覧"
              title="Ctrl+?"
            >
              <span className="text-sm font-medium">?</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
