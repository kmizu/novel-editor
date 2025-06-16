import { useState, useEffect, useCallback } from 'react'
import { Chapter } from '../types/project'
import { StorageManager, StorageKeys } from '../utils/storage'
import { generateId, countCharacters } from '../utils/helpers'

export const useChapters = (projectId: string | null) => {
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (projectId) {
      loadChapters()
    } else {
      setChapters([])
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const loadChapters = useCallback(() => {
    if (!projectId) return

    try {
      setLoading(true)
      const allChapters = StorageManager.get<Chapter[]>(StorageKeys.CHAPTERS) || []
      const projectChapters = allChapters
        .filter((chapter) => chapter.projectId === projectId)
        .sort((a, b) => a.order - b.order)

      setChapters(projectChapters)
      setError(null)
    } catch (err) {
      setError('章の読み込みに失敗しました')
      console.error('Error loading chapters:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  const createChapter = useCallback(
    (chapterData: Omit<Chapter, 'id' | 'createdAt' | 'updatedAt' | 'wordCount'>) => {
      if (!projectId) return null

      try {
        const allChapters = StorageManager.get<Chapter[]>(StorageKeys.CHAPTERS) || []
        const newChapter: Chapter = {
          ...chapterData,
          id: generateId(),
          wordCount: countCharacters(chapterData.content),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const updatedChapters = [...allChapters, newChapter]
        StorageManager.set(StorageKeys.CHAPTERS, updatedChapters)

        const projectChapters = updatedChapters
          .filter((chapter) => chapter.projectId === projectId)
          .sort((a, b) => a.order - b.order)
        setChapters(projectChapters)

        return newChapter
      } catch (err) {
        setError('章の作成に失敗しました')
        console.error('Error creating chapter:', err)
        return null
      }
    },
    [projectId]
  )

  const updateChapter = useCallback(
    (chapterId: string, updates: Partial<Chapter>) => {
      try {
        const allChapters = StorageManager.get<Chapter[]>(StorageKeys.CHAPTERS) || []
        const updatedChapters = allChapters.map((chapter) =>
          chapter.id === chapterId
            ? {
                ...chapter,
                ...updates,
                wordCount: updates.content ? countCharacters(updates.content) : chapter.wordCount,
                updatedAt: new Date().toISOString(),
              }
            : chapter
        )

        StorageManager.set(StorageKeys.CHAPTERS, updatedChapters)

        if (projectId) {
          const projectChapters = updatedChapters
            .filter((chapter) => chapter.projectId === projectId)
            .sort((a, b) => a.order - b.order)
          setChapters(projectChapters)
        }

        return true
      } catch (err) {
        setError('章の更新に失敗しました')
        console.error('Error updating chapter:', err)
        return false
      }
    },
    [projectId]
  )

  const deleteChapter = useCallback(
    (chapterId: string) => {
      try {
        const allChapters = StorageManager.get<Chapter[]>(StorageKeys.CHAPTERS) || []
        const updatedChapters = allChapters.filter((chapter) => chapter.id !== chapterId)
        StorageManager.set(StorageKeys.CHAPTERS, updatedChapters)

        if (projectId) {
          const projectChapters = updatedChapters
            .filter((chapter) => chapter.projectId === projectId)
            .sort((a, b) => a.order - b.order)
          setChapters(projectChapters)
        }

        return true
      } catch (err) {
        setError('章の削除に失敗しました')
        console.error('Error deleting chapter:', err)
        return false
      }
    },
    [projectId]
  )

  const reorderChapters = useCallback(
    (chapterIds: string[]) => {
      try {
        const allChapters = StorageManager.get<Chapter[]>(StorageKeys.CHAPTERS) || []
        const updatedChapters = allChapters.map((chapter) => {
          const newOrder = chapterIds.indexOf(chapter.id)
          if (newOrder !== -1) {
            return { ...chapter, order: newOrder }
          }
          return chapter
        })

        StorageManager.set(StorageKeys.CHAPTERS, updatedChapters)

        if (projectId) {
          const projectChapters = updatedChapters
            .filter((chapter) => chapter.projectId === projectId)
            .sort((a, b) => a.order - b.order)
          setChapters(projectChapters)
        }

        return true
      } catch (err) {
        setError('章の並び替えに失敗しました')
        console.error('Error reordering chapters:', err)
        return false
      }
    },
    [projectId]
  )

  return {
    chapters,
    loading,
    error,
    createChapter,
    updateChapter,
    deleteChapter,
    reorderChapters,
    reloadChapters: loadChapters,
  }
}
