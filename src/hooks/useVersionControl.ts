import { useState, useCallback, useEffect } from 'react'
import { Version, VersionHistory, VersionSettings, defaultVersionSettings } from '../types/version'
import { StorageManager } from '../utils/storage'
import { generateId } from '../utils/helpers'
import { calculateDiff } from '../utils/diff'

const VERSION_STORAGE_PREFIX = 'version_history_'
const VERSION_SETTINGS_KEY = 'version_settings'

export const useVersionControl = (
  entityId: string,
  entityType: Version['entityType'],
  currentContent: string
) => {
  const [history, setHistory] = useState<VersionHistory>({
    entityId,
    entityType,
    versions: [],
  })
  const [settings, setSettings] = useState<VersionSettings>(defaultVersionSettings)
  const [loading, setLoading] = useState(true)

  // ストレージキーの生成
  const getStorageKey = useCallback(() => {
    return `${VERSION_STORAGE_PREFIX}${entityType}_${entityId}`
  }, [entityId, entityType])

  // 履歴の読み込み
  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedHistory = StorageManager.get<VersionHistory>(getStorageKey())
        if (savedHistory) {
          setHistory(savedHistory)
        }

        const savedSettings = StorageManager.get<VersionSettings>(VERSION_SETTINGS_KEY)
        if (savedSettings) {
          setSettings(savedSettings)
        }
      } catch (error) {
        console.error('Failed to load version history:', error)
      } finally {
        setLoading(false)
      }
    }

    loadHistory()
  }, [getStorageKey])

  // 履歴の保存
  const saveHistory = useCallback(
    (updatedHistory: VersionHistory) => {
      try {
        StorageManager.set(getStorageKey(), updatedHistory)
        setHistory(updatedHistory)
      } catch (error) {
        console.error('Failed to save version history:', error)
      }
    },
    [getStorageKey]
  )

  // 設定の保存
  const updateSettings = useCallback(
    (newSettings: Partial<VersionSettings>) => {
      const updated = { ...settings, ...newSettings }
      setSettings(updated)
      StorageManager.set(VERSION_SETTINGS_KEY, updated)
    },
    [settings]
  )

  // バージョンの作成
  const createVersion = useCallback(
    (message?: string, tags?: string[]) => {
      const lastVersion = history.versions[history.versions.length - 1]
      const previousContent = lastVersion?.content || ''

      // 変更がない場合はバージョンを作成しない
      if (previousContent === currentContent) {
        return null
      }

      // 差分計算
      const diff = calculateDiff(previousContent, currentContent)

      // 最小変更サイズのチェック
      const changeSize = Math.abs(currentContent.length - previousContent.length)
      if (changeSize < settings.minChangeSize && !message && !tags?.length) {
        return null
      }

      const newVersion: Version = {
        id: generateId(),
        entityId,
        entityType,
        content: currentContent,
        createdAt: new Date().toISOString(),
        message,
        tags,
        diff,
      }

      let updatedVersions = [...history.versions, newVersion]

      // 最大バージョン数の制限（タグ付きバージョンは保持）
      if (updatedVersions.length > settings.maxVersions) {
        const taggedVersions = updatedVersions.filter((v) => v.tags && v.tags.length > 0)
        const untaggedVersions = updatedVersions.filter((v) => !v.tags || v.tags.length === 0)

        if (untaggedVersions.length > settings.maxVersions - taggedVersions.length) {
          const toRemove = untaggedVersions.length - (settings.maxVersions - taggedVersions.length)
          untaggedVersions.splice(0, toRemove)
        }

        updatedVersions = [...taggedVersions, ...untaggedVersions].sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
      }

      const updatedHistory: VersionHistory = {
        ...history,
        versions: updatedVersions,
        currentVersionId: newVersion.id,
      }

      saveHistory(updatedHistory)
      return newVersion
    },
    [
      currentContent,
      entityId,
      entityType,
      history,
      saveHistory,
      settings.maxVersions,
      settings.minChangeSize,
    ]
  )

  // バージョンの復元
  const restoreVersion = useCallback(
    (versionId: string) => {
      const version = history.versions.find((v) => v.id === versionId)
      if (version) {
        return version.content
      }
      return null
    },
    [history.versions]
  )

  // バージョンの比較
  const compareVersions = useCallback(
    (versionId1: string, versionId2: string) => {
      const version1 = history.versions.find((v) => v.id === versionId1)
      const version2 = history.versions.find((v) => v.id === versionId2)

      if (!version1 || !version2) {
        return null
      }

      return calculateDiff(version1.content, version2.content)
    },
    [history.versions]
  )

  // タグの追加
  const addTag = useCallback(
    (versionId: string, tag: string) => {
      const updatedVersions = history.versions.map((v) => {
        if (v.id === versionId) {
          const tags = v.tags || []
          if (!tags.includes(tag)) {
            return { ...v, tags: [...tags, tag] }
          }
        }
        return v
      })

      saveHistory({ ...history, versions: updatedVersions })
    },
    [history, saveHistory]
  )

  // タグの削除
  const removeTag = useCallback(
    (versionId: string, tag: string) => {
      const updatedVersions = history.versions.map((v) => {
        if (v.id === versionId && v.tags) {
          return { ...v, tags: v.tags.filter((t) => t !== tag) }
        }
        return v
      })

      saveHistory({ ...history, versions: updatedVersions })
    },
    [history, saveHistory]
  )

  // バージョンの削除
  const deleteVersion = useCallback(
    (versionId: string) => {
      const updatedVersions = history.versions.filter((v) => v.id !== versionId)
      saveHistory({ ...history, versions: updatedVersions })
    },
    [history, saveHistory]
  )

  // 統計情報の取得
  const getStats = useCallback(() => {
    const totalVersions = history.versions.length
    const taggedVersions = history.versions.filter((v) => v.tags && v.tags.length > 0).length
    const totalChanges = history.versions.reduce(
      (acc, v) => acc + (v.diff?.additions || 0) + (v.diff?.deletions || 0),
      0
    )

    return {
      totalVersions,
      taggedVersions,
      totalChanges,
      oldestVersion: history.versions[0]?.createdAt,
      newestVersion: history.versions[history.versions.length - 1]?.createdAt,
    }
  }, [history.versions])

  return {
    history,
    settings,
    loading,
    createVersion,
    restoreVersion,
    compareVersions,
    addTag,
    removeTag,
    deleteVersion,
    updateSettings,
    getStats,
  }
}
