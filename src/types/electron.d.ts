// Electron APIの型定義

// Electron のダイアログオプションの型定義
export interface SaveDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: Array<{
    name: string
    extensions: string[]
  }>
  properties?: Array<
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'treatPackageAsDirectory'
    | 'showOverwriteConfirmation'
    | 'dontAddToRecent'
  >
}

export interface OpenDialogOptions {
  title?: string
  defaultPath?: string
  buttonLabel?: string
  filters?: Array<{
    name: string
    extensions: string[]
  }>
  properties?: Array<
    | 'openFile'
    | 'openDirectory'
    | 'multiSelections'
    | 'showHiddenFiles'
    | 'createDirectory'
    | 'promptToCreate'
    | 'noResolveAliases'
    | 'treatPackageAsDirectory'
    | 'dontAddToRecent'
  >
}

export interface SaveDialogReturnValue {
  canceled: boolean
  filePath?: string
}

export interface OpenDialogReturnValue {
  canceled: boolean
  filePaths: string[]
}

export interface ElectronAPI {
  // ファイル操作
  saveFile: (path: string, content: string) => Promise<{ success: boolean; error?: string }>
  readFile: (path: string) => Promise<{ success: boolean; content?: string; error?: string }>
  showSaveDialog: (options: SaveDialogOptions) => Promise<SaveDialogReturnValue>
  showOpenDialog: (options: OpenDialogOptions) => Promise<OpenDialogReturnValue>

  // メニューイベント
  onMenuAction: (callback: (action: string, data?: unknown) => void) => void

  // プロジェクトパスの更新
  updateProjectPath: (path: string) => void

  // イベントリスナーの削除
  removeAllListeners: () => void

  // プラットフォーム情報
  platform: NodeJS.Platform
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
