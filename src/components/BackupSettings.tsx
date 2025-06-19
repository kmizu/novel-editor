import { useState, useEffect } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useAutoBackup } from '../hooks/useAutoBackup'
import { useToastContext } from '../App'
import {
  CloudArrowUpIcon,
  ClockIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { LoadingSpinner } from './LoadingSpinner'

export function BackupSettings() {
  const { activeProject } = useProjects()
  const toast = useToastContext()
  const [settings, setSettings] = useState({
    enabled: true,
    intervalMinutes: 30,
    maxBackups: 10,
  })

  const {
    isBackingUp,
    lastBackup,
    backupHistory,
    createBackup,
    restoreBackup,
    deleteBackup,
  } = useAutoBackup(activeProject, settings)

  // 設定の読み込み
  useEffect(() => {
    const stored = localStorage.getItem('backup_settings')
    if (stored) {
      setSettings(JSON.parse(stored))
    }
  }, [])

  // 設定の保存
  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings)
    localStorage.setItem('backup_settings', JSON.stringify(newSettings))
    toast.success('バックアップ設定を保存しました')
  }

  const handleManualBackup = async () => {
    try {
      await createBackup('manual')
      toast.success('バックアップを作成しました')
    } catch (error) {
      toast.error('バックアップの作成に失敗しました')
    }
  }

  const handleRestore = async (backupId: string) => {
    if (!confirm('このバックアップから復元しますか？現在のデータは上書きされます。')) {
      return
    }

    try {
      await restoreBackup(backupId)
      toast.success('バックアップから復元しました')
      // ページをリロードして変更を反映
      setTimeout(() => window.location.reload(), 1000)
    } catch (error) {
      toast.error('復元に失敗しました')
    }
  }

  const handleDelete = (backupId: string) => {
    if (!confirm('このバックアップを削除しますか？')) {
      return
    }

    deleteBackup(backupId)
    toast.success('バックアップを削除しました')
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!activeProject) {
    return (
      <div className="text-center py-8 text-gray-500">
        プロジェクトを選択してください
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* 自動バックアップ設定 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          自動バックアップ設定
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label htmlFor="backup-enabled" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              自動バックアップを有効にする
            </label>
            <input
              id="backup-enabled"
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => saveSettings({ ...settings, enabled: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>

          <div>
            <label htmlFor="backup-interval" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              バックアップ間隔（分）
            </label>
            <input
              id="backup-interval"
              type="number"
              min="5"
              max="120"
              value={settings.intervalMinutes}
              onChange={(e) => saveSettings({ ...settings, intervalMinutes: parseInt(e.target.value) || 30 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="max-backups" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              最大バックアップ数
            </label>
            <input
              id="max-backups"
              type="number"
              min="1"
              max="50"
              value={settings.maxBackups}
              onChange={(e) => saveSettings({ ...settings, maxBackups: parseInt(e.target.value) || 10 })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>

          {lastBackup && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              最後のバックアップ: {formatDate(lastBackup.getTime())}
            </div>
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={handleManualBackup}
            disabled={isBackingUp}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isBackingUp ? (
              <>
                <LoadingSpinner size="sm" />
                <span className="ml-2">バックアップ中...</span>
              </>
            ) : (
              <>
                <CloudArrowUpIcon className="h-5 w-5 mr-2" />
                今すぐバックアップ
              </>
            )}
          </button>
        </div>
      </div>

      {/* バックアップ履歴 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          バックアップ履歴
        </h3>

        {backupHistory.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-8">
            バックアップがありません
          </p>
        ) : (
          <div className="space-y-3">
            {backupHistory
              .sort((a, b) => b.timestamp - a.timestamp)
              .map((backup) => (
                <div
                  key={backup.id}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${
                      backup.type === 'auto' 
                        ? 'bg-gray-100 dark:bg-gray-700' 
                        : 'bg-blue-100 dark:bg-blue-900/20'
                    }`}>
                      <ClockIcon className={`h-5 w-5 ${
                        backup.type === 'auto'
                          ? 'text-gray-600 dark:text-gray-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {backup.type === 'auto' ? '自動' : '手動'}バックアップ
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(backup.timestamp)} • {formatFileSize(backup.size)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleRestore(backup.id)}
                      className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                      title="復元"
                    >
                      <ArrowPathIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(backup.id)}
                      className="p-2 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-400"
                      title="削除"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  )
}