import React, { createContext, useContext, useMemo } from 'react'
import {
  StorageService,
  LocalStorageService,
  ElectronStorageService,
} from '../services/storageService'
import { useElectron } from '../hooks/useElectron'

interface StorageContextValue {
  storageService: StorageService
  isElectron: boolean
}

const StorageContext = createContext<StorageContextValue | null>(null)

export function StorageProvider({ children }: { children: React.ReactNode }) {
  const { isElectron, api } = useElectron()

  const storageService = useMemo(() => {
    if (isElectron && api) {
      return new ElectronStorageService(api)
    }
    return new LocalStorageService()
  }, [isElectron, api])

  const value = useMemo(
    () => ({
      storageService,
      isElectron,
    }),
    [storageService, isElectron]
  )

  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStorage() {
  const context = useContext(StorageContext)
  if (!context) {
    throw new Error('useStorage must be used within a StorageProvider')
  }
  return context
}
