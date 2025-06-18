// プラグインシステムの型定義

export interface Plugin {
  id: string
  name: string
  version: string
  description?: string
  author?: string
  enabled: boolean
  category: 'editor' | 'export' | 'analyzer' | 'utility' | 'custom'
  manifest: PluginManifest
  runtime?: PluginRuntime
}

export interface PluginManifest {
  main: string // プラグインのエントリーポイント
  permissions: PluginPermission[]
  settings?: PluginSettingDefinition[]
  commands?: PluginCommand[]
  hooks?: PluginHook[]
  exports?: PluginExport[]
  dependencies?: PluginDependency[]
}

export type PluginPermission =
  | 'read:project'
  | 'write:project'
  | 'read:chapters'
  | 'write:chapters'
  | 'read:characters'
  | 'write:characters'
  | 'read:settings'
  | 'write:settings'
  | 'ui:toolbar'
  | 'ui:contextmenu'
  | 'ui:sidebar'
  | 'export:custom'
  | 'analyze:text'

export interface PluginSettingDefinition {
  key: string
  type: 'string' | 'number' | 'boolean' | 'select' | 'color'
  label: string
  description?: string
  defaultValue: unknown
  options?: Array<{ value: string; label: string }> // select型の場合
  min?: number // number型の場合
  max?: number // number型の場合
}

export interface PluginCommand {
  id: string
  name: string
  description?: string
  shortcut?: string
  icon?: string
  handler: string // 実行する関数名
}

export interface PluginHook {
  event: PluginEvent
  handler: string // 実行する関数名
  priority?: number
}

export type PluginEvent =
  | 'chapter:beforeSave'
  | 'chapter:afterSave'
  | 'chapter:beforeDelete'
  | 'chapter:afterDelete'
  | 'project:beforeExport'
  | 'project:afterExport'
  | 'editor:textChange'
  | 'editor:selectionChange'
  | 'app:startup'
  | 'app:shutdown'

export interface PluginExport {
  format: string
  name: string
  extension: string
  handler: string // エクスポート処理を行う関数名
}

export interface PluginDependency {
  pluginId: string
  version: string
}

// プラグインランタイム（プラグイン実行時の情報）
export interface PluginRuntime {
  instance?: PluginInstance
  settings: Record<string, unknown>
  state: 'loading' | 'active' | 'error' | 'disabled'
  error?: string
}

// プラグインAPIインターフェース
export interface PluginAPI {
  // プロジェクト関連
  getProject(): unknown
  updateProject(updates: unknown): void

  // チャプター関連
  getChapters(): unknown[]
  getChapter(id: string): unknown
  updateChapter(id: string, updates: unknown): void

  // キャラクター関連
  getCharacters(): unknown[]
  getCharacter(id: string): unknown
  updateCharacter(id: string, updates: unknown): void

  // UI関連
  showNotification(message: string, type?: 'info' | 'success' | 'warning' | 'error'): void
  showDialog(options: DialogOptions): Promise<unknown>
  registerToolbarAction(action: ToolbarAction): void
  registerContextMenuAction(action: ContextMenuAction): void

  // ストレージ
  getPluginStorage(key: string): unknown
  setPluginStorage(key: string, value: unknown): void

  // イベント
  emit(event: string, data?: unknown): void
  on(event: string, handler: (data: unknown) => void): void
  off(event: string, handler: (data: unknown) => void): void
}

export interface DialogOptions {
  title: string
  content: string | (() => HTMLElement)
  buttons?: Array<{
    text: string
    primary?: boolean
    onClick?: () => void
  }>
  width?: number
  height?: number
}

export interface ToolbarAction {
  id: string
  title: string
  icon?: string
  onClick: () => void
  position?: 'left' | 'right'
}

export interface ContextMenuAction {
  id: string
  title: string
  icon?: string
  onClick: (context: { selection: string; chapterId?: string }) => void
  condition?: (context: { selection: string; chapterId?: string }) => boolean
}

// プラグインインスタンス（実際のプラグインが実装するインターフェース）
export interface PluginInstance {
  activate(api: PluginAPI): void | Promise<void>
  deactivate?(): void | Promise<void>
  [key: string]: unknown // その他のメソッド（commands, hooks, exportsのhandler）
}

// プラグインマーケットプレイス用の型
export interface MarketplacePlugin {
  id: string
  name: string
  version: string
  description: string
  author: string
  category: Plugin['category']
  downloads: number
  rating: number
  ratingCount: number
  lastUpdated: string
  homepage?: string
  repository?: string
  size: number
  screenshots?: string[]
  tags?: string[]
}
