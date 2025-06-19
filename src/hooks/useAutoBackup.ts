import { useEffect, useRef, useState } from 'react'
import { useStorage } from '../contexts/StorageContext'
import { Project } from '../types'

interface BackupMetadata {
  id: string
  projectId: string
  timestamp: number
  size: number
  type: 'auto' | 'manual'
}

interface UseAutoBackupOptions {
  intervalMinutes?: number
  maxBackups?: number
  enabled?: boolean
}

export function useAutoBackup(
  project: Project | null,
  options: UseAutoBackupOptions = {}
) {
  const { intervalMinutes = 30, maxBackups = 10, enabled = true } = options
  const { storageService: storage } = useStorage()
  const [isBackingUp, setIsBackingUp] = useState(false)
  const [lastBackup, setLastBackup] = useState<Date | null>(null)
  const [backupHistory, setBackupHistory] = useState<BackupMetadata[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval>>()

  // バックアップメタデータの取得
  const getBackupMetadata = (): BackupMetadata[] => {
    try {
      const stored = localStorage.getItem('backup_metadata')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // バックアップメタデータの保存
  const saveBackupMetadata = (metadata: BackupMetadata[]) => {
    localStorage.setItem('backup_metadata', JSON.stringify(metadata))
  }

  // プロジェクトデータの収集
  const collectProjectData = async (projectId: string) => {
    const chapters = await storage.getChapters(projectId)
    const characters = await storage.getCharacters(projectId)
    const plots = await storage.getPlots(projectId)
    const worldSettings = await storage.getWorldSettings(projectId)

    return {
      project,
      chapters,
      characters,
      plots,
      worldSettings,
      timestamp: Date.now(),
    }
  }

  // バックアップの作成
  const createBackup = async (type: 'auto' | 'manual' = 'auto') => {
    if (!project || isBackingUp) return

    setIsBackingUp(true)
    try {
      const data = await collectProjectData(project.id)
      const backupId = `backup_${project.id}_${Date.now()}`
      const backupData = JSON.stringify(data)
      
      // バックアップをlocalStorageに保存
      localStorage.setItem(backupId, backupData)

      // メタデータを更新
      const metadata = getBackupMetadata()
      const newMetadata: BackupMetadata = {
        id: backupId,
        projectId: project.id,
        timestamp: Date.now(),
        size: new Blob([backupData]).size,
        type,
      }

      // プロジェクトのバックアップのみを抽出
      const projectBackups = metadata.filter(m => m.projectId === project.id)
      const otherBackups = metadata.filter(m => m.projectId !== project.id)

      // 古いバックアップを削除
      if (projectBackups.length >= maxBackups) {
        const sortedBackups = projectBackups.sort((a, b) => b.timestamp - a.timestamp)
        const toDelete = sortedBackups.slice(maxBackups - 1)
        toDelete.forEach(backup => {
          localStorage.removeItem(backup.id)
        })
      }

      // 新しいメタデータを保存
      const updatedMetadata = [
        ...otherBackups,
        ...projectBackups.slice(0, maxBackups - 1),
        newMetadata,
      ]
      saveBackupMetadata(updatedMetadata)
      setBackupHistory(updatedMetadata.filter(m => m.projectId === project.id))
      setLastBackup(new Date())

      return backupId
    } catch (error) {
      console.error('Backup failed:', error)
      throw error
    } finally {
      setIsBackingUp(false)
    }
  }

  // バックアップの復元
  const restoreBackup = async (backupId: string) => {
    try {
      const backupData = localStorage.getItem(backupId)
      if (!backupData) {
        throw new Error('バックアップが見つかりません')
      }

      const data = JSON.parse(backupData)
      
      // プロジェクトデータの復元
      if (data.project) {
        await storage.saveProject(data.project)
      }
      if (data.chapters && data.project) {
        await storage.saveChapters(data.project.id, data.chapters)
      }
      if (data.characters && data.project) {
        await storage.saveCharacters(data.project.id, data.characters)
      }
      if (data.plots && data.project) {
        await storage.savePlots(data.project.id, data.plots)
      }
      if (data.worldSettings && data.project) {
        await storage.saveWorldSettings(data.project.id, data.worldSettings)
      }

      return true
    } catch (error) {
      console.error('Restore failed:', error)
      throw error
    }
  }

  // バックアップの削除
  const deleteBackup = (backupId: string) => {
    localStorage.removeItem(backupId)
    const metadata = getBackupMetadata()
    const updatedMetadata = metadata.filter(m => m.id !== backupId)
    saveBackupMetadata(updatedMetadata)
    setBackupHistory(updatedMetadata.filter(m => m.projectId === project?.id))
  }

  // 自動バックアップの設定
  useEffect(() => {
    if (!enabled || !project) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      return
    }

    // 初期バックアップ履歴の読み込み
    const metadata = getBackupMetadata()
    setBackupHistory(metadata.filter(m => m.projectId === project.id))

    // 最後のバックアップ時刻を設定
    const projectBackups = metadata.filter(m => m.projectId === project.id)
    if (projectBackups.length > 0) {
      const latest = projectBackups.sort((a, b) => b.timestamp - a.timestamp)[0]
      setLastBackup(new Date(latest.timestamp))
    }

    // 自動バックアップの間隔を設定
    intervalRef.current = setInterval(() => {
      createBackup('auto')
    }, intervalMinutes * 60 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [enabled, project, intervalMinutes])

  return {
    isBackingUp,
    lastBackup,
    backupHistory,
    createBackup,
    restoreBackup,
    deleteBackup,
  }
}