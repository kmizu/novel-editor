import { useEffect, useRef, useState } from 'react'
import { debounce } from '../utils/helpers'

interface UseAutoSaveOptions {
  onSave: () => void | Promise<void>
  delay?: number
  dependencies?: unknown[]
}

export const useAutoSave = ({ onSave, delay = 1000, dependencies = [] }: UseAutoSaveOptions) => {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const debouncedSaveRef = useRef<ReturnType<typeof debounce> | null>(null)

  useEffect(() => {
    debouncedSaveRef.current = debounce(async () => {
      try {
        setIsSaving(true)
        setError(null)
        await onSave()
        setLastSaved(new Date())
      } catch (err) {
        setError('保存に失敗しました')
        console.error('Auto-save error:', err)
      } finally {
        setIsSaving(false)
      }
    }, delay)

    return () => {
      debouncedSaveRef.current = null
    }
  }, [onSave, delay])

  useEffect(() => {
    if (debouncedSaveRef.current && dependencies.length > 0) {
      debouncedSaveRef.current()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  const forceSave = async () => {
    try {
      setIsSaving(true)
      setError(null)
      await onSave()
      setLastSaved(new Date())
    } catch (err) {
      setError('保存に失敗しました')
      console.error('Force save error:', err)
      throw err
    } finally {
      setIsSaving(false)
    }
  }

  return {
    isSaving,
    lastSaved,
    error,
    forceSave,
  }
}
