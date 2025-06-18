import { useEffect, useCallback } from 'react'
import type { SaveDialogOptions, OpenDialogOptions } from '@/types/electron'

export function useElectron() {
  const isElectron = !!window.electronAPI
  const api = window.electronAPI

  return {
    isElectron,
    api,
  }
}

export function useElectronFileSystem() {
  const { isElectron, api } = useElectron()

  const saveFile = useCallback(
    async (path: string, content: string) => {
      if (!isElectron || !api) {
        throw new Error('Electron API is not available')
      }
      return api.saveFile(path, content)
    },
    [isElectron, api]
  )

  const readFile = useCallback(
    async (path: string) => {
      if (!isElectron || !api) {
        throw new Error('Electron API is not available')
      }
      return api.readFile(path)
    },
    [isElectron, api]
  )

  const showSaveDialog = useCallback(
    async (options: SaveDialogOptions) => {
      if (!isElectron || !api) {
        throw new Error('Electron API is not available')
      }
      return api.showSaveDialog(options)
    },
    [isElectron, api]
  )

  const showOpenDialog = useCallback(
    async (options: OpenDialogOptions) => {
      if (!isElectron || !api) {
        throw new Error('Electron API is not available')
      }
      return api.showOpenDialog(options)
    },
    [isElectron, api]
  )

  return {
    isElectron,
    saveFile,
    readFile,
    showSaveDialog,
    showOpenDialog,
  }
}

export function useElectronMenu(handler: (action: string, data?: unknown) => void) {
  const { isElectron, api } = useElectron()

  useEffect(() => {
    if (!isElectron || !api) return

    api.onMenuAction(handler)

    return () => {
      api.removeAllListeners()
    }
  }, [isElectron, api, handler])
}
