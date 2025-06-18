import { useEffect, useRef, useCallback } from 'react'
import { VersionSettings } from '../types/version'

interface UseAutoVersioningProps {
  content: string
  settings: VersionSettings
  onCreateVersion: (message?: string) => void
  enabled?: boolean
}

export const useAutoVersioning = ({
  content,
  settings,
  onCreateVersion,
  enabled = true,
}: UseAutoVersioningProps) => {
  const lastSavedContent = useRef(content)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 自動保存の実行
  const performAutoSave = useCallback(() => {
    if (!enabled || !settings.autoSave) return

    const changeSize = Math.abs(content.length - lastSavedContent.current.length)
    if (changeSize >= settings.minChangeSize) {
      onCreateVersion('自動保存')
      lastSavedContent.current = content
    }
  }, [content, enabled, onCreateVersion, settings.autoSave, settings.minChangeSize])

  // タイマーのリセット
  const resetTimer = useCallback(() => {
    if (saveTimer.current) {
      clearTimeout(saveTimer.current)
    }

    if (enabled && settings.autoSave) {
      saveTimer.current = setTimeout(
        performAutoSave,
        settings.autoSaveInterval * 60 * 1000 // 分をミリ秒に変換
      )
    }
  }, [enabled, performAutoSave, settings.autoSave, settings.autoSaveInterval])

  // コンテンツ変更時の処理
  useEffect(() => {
    resetTimer()

    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
      }
    }
  }, [content, resetTimer])

  // 手動保存
  const manualSave = useCallback(
    (message?: string) => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current)
      }
      onCreateVersion(message)
      lastSavedContent.current = content
      resetTimer()
    },
    [content, onCreateVersion, resetTimer]
  )

  // コンポーネントのアンマウント時に保存
  useEffect(() => {
    return () => {
      if (enabled && settings.autoSave) {
        const changeSize = Math.abs(content.length - lastSavedContent.current.length)
        if (changeSize > 0) {
          onCreateVersion('自動保存（終了時）')
        }
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return {
    manualSave,
    isAutoSaveEnabled: enabled && settings.autoSave,
  }
}
