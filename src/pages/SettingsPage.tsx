import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { storage, StorageManager } from '../utils/storage'
import {
  CogIcon,
  SunIcon,
  MoonIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
} from '@heroicons/react/24/outline'

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleExportAllData = () => {
    const allData = {
      projects: storage.getProjects(),
      chapters: storage.getAllChapters(),
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
    }
    const dataStr = JSON.stringify(allData, null, 2)

    // Download file
    const blob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `novel-editor-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        // Validate data structure
        if (!data.projects || !Array.isArray(data.projects)) {
          throw new Error('Invalid data format')
        }

        // Import all data at once
        StorageManager.importAllData(data)

        alert('データのインポートが完了しました')
        window.location.reload()
      } catch {
        alert('データのインポートに失敗しました。ファイルの形式を確認してください。')
      }
    }
    reader.readAsText(file)
  }

  const handleDeleteAllData = () => {
    if (showDeleteConfirm) {
      storage.clearAll()
      alert('すべてのデータが削除されました')
      window.location.reload()
    } else {
      setShowDeleteConfirm(true)
      setTimeout(() => setShowDeleteConfirm(false), 5000)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">設定</h2>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <CogIcon className="w-5 h-5 inline mr-2" />
            表示設定
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700 dark:text-gray-300">テーマ</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                ライトモードとダークモードを切り替えます
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {theme === 'light' ? (
                <>
                  <MoonIcon className="w-5 h-5 mr-2" />
                  ダークモード
                </>
              ) : (
                <>
                  <SunIcon className="w-5 h-5 mr-2" />
                  ライトモード
                </>
              )}
            </button>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            <ArrowDownTrayIcon className="w-5 h-5 inline mr-2" />
            データ管理
          </h3>

          <div className="space-y-4">
            {/* Export */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300">データのエクスポート</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  すべてのプロジェクトデータをバックアップ
                </p>
              </div>
              <button
                onClick={handleExportAllData}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowDownTrayIcon className="w-5 h-5 mr-2" />
                エクスポート
              </button>
            </div>

            {/* Import */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700 dark:text-gray-300">データのインポート</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  バックアップファイルから復元
                </p>
              </div>
              <label className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors cursor-pointer">
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                インポート
                <input type="file" accept=".json" onChange={handleImportData} className="hidden" />
              </label>
            </div>

            {/* Delete All */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
              <div>
                <p className="text-gray-700 dark:text-gray-300">すべてのデータを削除</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">この操作は取り消せません</p>
              </div>
              <button
                onClick={handleDeleteAllData}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  showDeleteConfirm
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                <TrashIcon className="w-5 h-5 mr-2" />
                {showDeleteConfirm ? '本当に削除する' : 'データを削除'}
              </button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            キーボードショートカット
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">エディタを開く</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl + E</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">プロットを開く</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl + P</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">キャラクター管理</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl + K</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">世界観設定</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl + W</kbd>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300">保存</span>
              <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl + S</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
