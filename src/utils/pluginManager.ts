// プラグインマネージャー

import { Plugin, PluginAPI, PluginInstance } from '../types/plugin'
import { StorageManager } from './storage'

const PLUGIN_STORAGE_KEY = 'novel_editor_plugins'
const PLUGIN_SETTINGS_KEY = 'novel_editor_plugin_settings'

export class PluginManager {
  private static instance: PluginManager | null = null
  private plugins: Map<string, Plugin> = new Map()
  private pluginAPIs: Map<string, PluginAPI> = new Map()
  private eventListeners: Map<string, Set<(data: unknown) => void>> = new Map()

  private constructor() {
    this.loadPlugins()
  }

  static getInstance(): PluginManager {
    if (!PluginManager.instance) {
      PluginManager.instance = new PluginManager()
    }
    return PluginManager.instance
  }

  // プラグインの読み込み
  private loadPlugins(): void {
    const savedPlugins = StorageManager.get<Plugin[]>(PLUGIN_STORAGE_KEY) || []
    savedPlugins.forEach((plugin) => {
      this.plugins.set(plugin.id, {
        ...plugin,
        runtime: {
          state: 'disabled',
          settings: this.loadPluginSettings(plugin.id),
        },
      })
    })
  }

  // プラグイン設定の読み込み
  private loadPluginSettings(pluginId: string): Record<string, unknown> {
    const allSettings =
      StorageManager.get<Record<string, Record<string, unknown>>>(PLUGIN_SETTINGS_KEY) || {}
    return allSettings[pluginId] || {}
  }

  // プラグイン設定の保存
  private savePluginSettings(pluginId: string, settings: Record<string, unknown>): void {
    const allSettings =
      StorageManager.get<Record<string, Record<string, unknown>>>(PLUGIN_SETTINGS_KEY) || {}
    allSettings[pluginId] = settings
    StorageManager.set(PLUGIN_SETTINGS_KEY, allSettings)
  }

  // プラグインの保存
  private savePlugins(): void {
    const pluginsArray = Array.from(this.plugins.values()).map((plugin) => ({
      ...plugin,
      runtime: undefined, // runtimeは保存しない
    }))
    StorageManager.set(PLUGIN_STORAGE_KEY, pluginsArray)
  }

  // プラグインのインストール
  async installPlugin(pluginCode: string, manifest: Plugin['manifest']): Promise<void> {
    const pluginId = crypto.randomUUID()

    // プラグインのメタデータを作成
    const plugin: Plugin = {
      id: pluginId,
      name: manifest.main,
      version: '1.0.0',
      enabled: false,
      category: 'custom',
      manifest,
      runtime: {
        state: 'disabled',
        settings: {},
      },
    }

    // プラグインコードを保存（実際の実装では、より安全な方法で保存する）
    const codeKey = `novel_editor_plugin_code_${pluginId}`
    StorageManager.set(codeKey, pluginCode)

    this.plugins.set(pluginId, plugin)
    this.savePlugins()
  }

  // プラグインのアンインストール
  uninstallPlugin(pluginId: string): void {
    const plugin = this.plugins.get(pluginId)
    if (!plugin) return

    // プラグインが有効な場合は無効化
    if (plugin.enabled) {
      this.disablePlugin(pluginId)
    }

    // プラグインコードを削除
    const codeKey = `novel_editor_plugin_code_${pluginId}`
    StorageManager.remove(codeKey)

    // プラグイン設定を削除
    const allSettings =
      StorageManager.get<Record<string, Record<string, unknown>>>(PLUGIN_SETTINGS_KEY) || {}
    delete allSettings[pluginId]
    StorageManager.set(PLUGIN_SETTINGS_KEY, allSettings)

    this.plugins.delete(pluginId)
    this.savePlugins()
  }

  // プラグインの有効化
  async enablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin || plugin.enabled) return

    try {
      // プラグインコードを読み込む
      const codeKey = `novel_editor_plugin_code_${pluginId}`
      const pluginCode = StorageManager.get<string>(codeKey)
      if (!pluginCode) {
        throw new Error('Plugin code not found')
      }

      // プラグインAPIを作成
      const api = this.createPluginAPI(pluginId)
      this.pluginAPIs.set(pluginId, api)

      // プラグインを実行（サンドボックス環境で実行する必要がある）
      // ここでは簡略化のため、evalを使用（実際の実装では避けるべき）
      const pluginInstance = await this.loadPluginInstance(pluginCode, plugin.manifest.main)

      if (plugin.runtime) {
        plugin.runtime.instance = pluginInstance
        plugin.runtime.state = 'loading'
      }

      // プラグインをアクティベート
      await pluginInstance.activate(api)

      if (plugin.runtime) {
        plugin.runtime.state = 'active'
      }
      plugin.enabled = true

      this.plugins.set(pluginId, plugin)
      this.savePlugins()

      // フックを登録
      this.registerHooks(pluginId, plugin)
    } catch (error) {
      if (plugin.runtime) {
        plugin.runtime.state = 'error'
        plugin.runtime.error = error instanceof Error ? error.message : 'Unknown error'
      }
      throw error
    }
  }

  // プラグインの無効化
  async disablePlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId)
    if (!plugin || !plugin.enabled) return

    try {
      // プラグインをデアクティベート
      if (plugin.runtime?.instance?.deactivate) {
        await plugin.runtime.instance.deactivate()
      }

      // フックを解除
      this.unregisterHooks(pluginId)

      // APIを削除
      this.pluginAPIs.delete(pluginId)

      if (plugin.runtime) {
        plugin.runtime.instance = undefined
        plugin.runtime.state = 'disabled'
      }
      plugin.enabled = false

      this.plugins.set(pluginId, plugin)
      this.savePlugins()
    } catch (error) {
      console.error(`Failed to disable plugin ${pluginId}:`, error)
    }
  }

  // プラグインインスタンスの読み込み（簡略化版）
  private async loadPluginInstance(code: string, mainFunction: string): Promise<PluginInstance> {
    // 実際の実装では、Web Workerやiframeを使用してサンドボックス環境で実行する
    // ここでは簡略化のため、Functionコンストラクタを使用
    const wrappedCode = `
      return (function() {
        ${code}
        return ${mainFunction};
      })();
    `
    const pluginFactory = new Function(wrappedCode)
    return pluginFactory() as PluginInstance
  }

  // プラグインAPIの作成
  private createPluginAPI(pluginId: string): PluginAPI {
    return {
      getProject: () => {
        // 実装は後で追加
        return {}
      },
      updateProject: () => {
        // 実装は後で追加
      },
      getChapters: () => {
        // 実装は後で追加
        return []
      },
      getChapter: () => {
        // 実装は後で追加
        return null
      },
      updateChapter: () => {
        // 実装は後で追加
      },
      getCharacters: () => {
        // 実装は後で追加
        return []
      },
      getCharacter: () => {
        // 実装は後で追加
        return null
      },
      updateCharacter: () => {
        // 実装は後で追加
      },
      showNotification: (message, type = 'info') => {
        console.log(`[${type.toUpperCase()}] ${message}`)
        // 実際の実装では、トースト通知などを表示
      },
      showDialog: async () => {
        // 実装は後で追加
        return null
      },
      registerToolbarAction: () => {
        // 実装は後で追加
      },
      registerContextMenuAction: () => {
        // 実装は後で追加
      },
      getPluginStorage: (key) => {
        const plugin = this.plugins.get(pluginId)
        return plugin?.runtime?.settings[key]
      },
      setPluginStorage: (key, value) => {
        const plugin = this.plugins.get(pluginId)
        if (plugin?.runtime) {
          plugin.runtime.settings[key] = value
          this.savePluginSettings(pluginId, plugin.runtime.settings)
        }
      },
      emit: (event, data) => {
        this.emitEvent(event, data)
      },
      on: (event, handler) => {
        this.addEventListener(event, handler)
      },
      off: (event, handler) => {
        this.removeEventListener(event, handler)
      },
    }
  }

  // フックの登録
  private registerHooks(pluginId: string, plugin: Plugin): void {
    if (!plugin.manifest.hooks) return

    plugin.manifest.hooks.forEach((hook) => {
      const handler = (data: unknown) => {
        try {
          const instance = plugin.runtime?.instance
          if (
            instance &&
            hook.handler in instance &&
            typeof instance[hook.handler] === 'function'
          ) {
            const handler = instance[hook.handler] as (data: unknown) => void
            handler(data)
          }
        } catch (error) {
          console.error(`Error in plugin hook ${pluginId}:${hook.event}:`, error)
        }
      }

      this.addEventListener(hook.event, handler)
    })
  }

  // フックの解除
  private unregisterHooks(_pluginId: string): void {
    // 実際の実装では、プラグインごとのハンドラーを追跡して解除する
    // ここでは簡略化
  }

  // イベントリスナーの管理
  private addEventListener(event: string, handler: (data: unknown) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set())
    }
    this.eventListeners.get(event)?.add(handler)
  }

  private removeEventListener(event: string, handler: (data: unknown) => void): void {
    this.eventListeners.get(event)?.delete(handler)
  }

  private emitEvent(event: string, data?: unknown): void {
    this.eventListeners.get(event)?.forEach((handler) => {
      try {
        handler(data)
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error)
      }
    })
  }

  // プラグイン一覧の取得
  getPlugins(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  // プラグインの取得
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId)
  }

  // プラグイン設定の更新
  updatePluginSettings(pluginId: string, settings: Record<string, unknown>): void {
    const plugin = this.plugins.get(pluginId)
    if (plugin?.runtime) {
      plugin.runtime.settings = { ...plugin.runtime.settings, ...settings }
      this.savePluginSettings(pluginId, plugin.runtime.settings)
    }
  }

  // イベントの発火（他のコンポーネントから呼ばれる）
  triggerEvent(event: string, data?: unknown): void {
    this.emitEvent(event, data)
  }
}
