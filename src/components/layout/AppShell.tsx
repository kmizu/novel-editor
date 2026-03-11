import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useSettingsStore } from '../../stores/settingsStore'

export function AppShell() {
  const { theme } = useSettingsStore()

  return (
    <div className={theme}>
      <div className="flex h-screen overflow-hidden bg-paper dark:bg-night">
        {/* 本の背表紙のような細いサイドバー */}
        <Sidebar />

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
