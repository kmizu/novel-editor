import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { useSettingsStore } from '../../stores/settingsStore'
import { ToastContainer, useToast } from '../ui/Toast'
import { createContext, useContext } from 'react'

// Toast をアプリ全体で使えるようにする
type ToastAPI = ReturnType<typeof useToast>['toast']
const ToastContext = createContext<ToastAPI | null>(null)

export function useAppToast(): ToastAPI {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useAppToast must be used inside AppShell')
  return ctx
}

export function AppShell() {
  const { theme, focusMode } = useSettingsStore()
  const { toasts, removeToast, toast } = useToast()

  return (
    <div className={theme}>
      <div className="flex h-screen overflow-hidden bg-paper dark:bg-night">
        {/* フォーカスモード時はサイドバーを非表示 */}
        {!focusMode && <Sidebar />}

        {/* メインコンテンツ */}
        <main className="flex-1 overflow-hidden">
          <ToastContext.Provider value={toast}>
            <Outlet />
          </ToastContext.Provider>
        </main>
      </div>

      {/* トースト通知 */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
