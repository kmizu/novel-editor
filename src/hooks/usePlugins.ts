// プラグイン管理用のフック

import { useState, useEffect, useCallback } from 'react'
import { Plugin } from '../types/plugin'
import { PluginManager } from '../utils/pluginManager'

export const usePlugins = () => {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const pluginManager = PluginManager.getInstance()

  // プラグイン一覧の読み込み
  const loadPlugins = useCallback(() => {
    try {
      setLoading(true)
      const loadedPlugins = pluginManager.getPlugins()
      setPlugins(loadedPlugins)
      setError(null)
    } catch (err) {
      setError('プラグインの読み込みに失敗しました')
      console.error('Failed to load plugins:', err)
    } finally {
      setLoading(false)
    }
  }, [pluginManager])

  useEffect(() => {
    loadPlugins()
  }, [loadPlugins])

  // プラグインのインストール
  const installPlugin = useCallback(
    async (pluginCode: string, manifest: Plugin['manifest']) => {
      try {
        await pluginManager.installPlugin(pluginCode, manifest)
        loadPlugins()
        return { success: true }
      } catch (err) {
        console.error('Failed to install plugin:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : 'インストールに失敗しました',
        }
      }
    },
    [pluginManager, loadPlugins]
  )

  // プラグインのアンインストール
  const uninstallPlugin = useCallback(
    (pluginId: string) => {
      try {
        pluginManager.uninstallPlugin(pluginId)
        loadPlugins()
        return { success: true }
      } catch (err) {
        console.error('Failed to uninstall plugin:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : 'アンインストールに失敗しました',
        }
      }
    },
    [pluginManager, loadPlugins]
  )

  // プラグインの有効化
  const enablePlugin = useCallback(
    async (pluginId: string) => {
      try {
        await pluginManager.enablePlugin(pluginId)
        loadPlugins()
        return { success: true }
      } catch (err) {
        console.error('Failed to enable plugin:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : '有効化に失敗しました',
        }
      }
    },
    [pluginManager, loadPlugins]
  )

  // プラグインの無効化
  const disablePlugin = useCallback(
    async (pluginId: string) => {
      try {
        await pluginManager.disablePlugin(pluginId)
        loadPlugins()
        return { success: true }
      } catch (err) {
        console.error('Failed to disable plugin:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : '無効化に失敗しました',
        }
      }
    },
    [pluginManager, loadPlugins]
  )

  // プラグイン設定の更新
  const updatePluginSettings = useCallback(
    (pluginId: string, settings: Record<string, unknown>) => {
      try {
        pluginManager.updatePluginSettings(pluginId, settings)
        loadPlugins()
        return { success: true }
      } catch (err) {
        console.error('Failed to update plugin settings:', err)
        return {
          success: false,
          error: err instanceof Error ? err.message : '設定の更新に失敗しました',
        }
      }
    },
    [pluginManager, loadPlugins]
  )

  // プラグインイベントのトリガー
  const triggerPluginEvent = useCallback(
    (event: string, data?: unknown) => {
      pluginManager.triggerEvent(event, data)
    },
    [pluginManager]
  )

  return {
    plugins,
    loading,
    error,
    installPlugin,
    uninstallPlugin,
    enablePlugin,
    disablePlugin,
    updatePluginSettings,
    triggerPluginEvent,
    reloadPlugins: loadPlugins,
  }
}
