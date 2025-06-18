import { useState } from 'react'
import { Plugin } from '../../types/plugin'
import {
  PowerIcon,
  TrashIcon,
  CogIcon,
  ExclamationTriangleIcon,
  PuzzlePieceIcon,
} from '@heroicons/react/24/outline'

interface PluginListProps {
  plugins: Plugin[]
  onEnable: (pluginId: string) => Promise<{ success: boolean; error?: string }>
  onDisable: (pluginId: string) => Promise<{ success: boolean; error?: string }>
  onUninstall: (pluginId: string) => { success: boolean; error?: string }
  onUpdateSettings?: (
    pluginId: string,
    settings: Record<string, unknown>
  ) => {
    success: boolean
    error?: string
  }
}

export default function PluginList({ plugins, onEnable, onDisable, onUninstall }: PluginListProps) {
  const [selectedPlugin, setSelectedPlugin] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  const handleTogglePlugin = async (plugin: Plugin) => {
    if (plugin.enabled) {
      const result = await onDisable(plugin.id)
      if (!result.success) {
        alert(`無効化に失敗しました: ${result.error}`)
      }
    } else {
      const result = await onEnable(plugin.id)
      if (!result.success) {
        alert(`有効化に失敗しました: ${result.error}`)
      }
    }
  }

  const handleUninstall = (pluginId: string) => {
    if (confirm('このプラグインをアンインストールしますか？')) {
      const result = onUninstall(pluginId)
      if (!result.success) {
        alert(`アンインストールに失敗しました: ${result.error}`)
      }
    }
  }

  const getCategoryLabel = (category: Plugin['category']) => {
    const labels = {
      editor: 'エディタ拡張',
      export: 'エクスポート',
      analyzer: '分析ツール',
      utility: 'ユーティリティ',
      custom: 'カスタム',
    }
    return labels[category] || category
  }

  if (plugins.length === 0) {
    return (
      <div className="bg-white p-8 rounded-lg shadow text-center">
        <PuzzlePieceIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-600">インストール済みのプラグインがありません</p>
        <p className="text-sm text-gray-500 mt-2">
          マーケットプレイスからプラグインをインストールするか、
          <br />
          開発者向けタブから独自のプラグインを追加してください
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {plugins.map((plugin) => (
        <div key={plugin.id} className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold">{plugin.name}</h3>
                <span className="ml-2 px-2 py-1 text-xs bg-gray-100 rounded">
                  v{plugin.version}
                </span>
                <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                  {getCategoryLabel(plugin.category)}
                </span>
                {plugin.runtime?.state === 'error' && (
                  <span className="ml-2 px-2 py-1 text-xs bg-red-100 text-red-700 rounded flex items-center">
                    <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                    エラー
                  </span>
                )}
              </div>
              {plugin.description && <p className="text-gray-600 mt-1">{plugin.description}</p>}
              {plugin.author && <p className="text-sm text-gray-500 mt-1">作者: {plugin.author}</p>}
              {plugin.runtime?.error && (
                <p className="text-sm text-red-600 mt-2">{plugin.runtime.error}</p>
              )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
              {/* 設定ボタン */}
              {plugin.manifest.settings && plugin.manifest.settings.length > 0 && (
                <button
                  onClick={() => {
                    setSelectedPlugin(plugin.id)
                    setShowSettings(true)
                  }}
                  className="p-2 text-gray-600 hover:text-gray-800"
                  title="設定"
                >
                  <CogIcon className="w-5 h-5" />
                </button>
              )}

              {/* 有効/無効化ボタン */}
              <button
                onClick={() => handleTogglePlugin(plugin)}
                className={`p-2 ${
                  plugin.enabled
                    ? 'text-green-600 hover:text-green-800'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
                title={plugin.enabled ? '無効化' : '有効化'}
              >
                <PowerIcon className="w-5 h-5" />
              </button>

              {/* アンインストールボタン */}
              <button
                onClick={() => handleUninstall(plugin.id)}
                className="p-2 text-red-600 hover:text-red-800"
                title="アンインストール"
                disabled={plugin.enabled}
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 権限一覧 */}
          {plugin.manifest.permissions.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-2">必要な権限:</p>
              <div className="flex flex-wrap gap-2">
                {plugin.manifest.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* 設定モーダル（簡易版） */}
      {showSettings && selectedPlugin && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">プラグイン設定</h3>
            <p className="text-gray-600 mb-4">プラグイン設定機能は現在開発中です</p>
            <button
              onClick={() => {
                setShowSettings(false)
                setSelectedPlugin(null)
              }}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
