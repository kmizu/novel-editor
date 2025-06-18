// プロジェクトの完全なデータを取得するフック

import { useState, useEffect, useCallback } from 'react'
import { storage } from '../utils/storage'
import type { Project } from '../types'

export const useProjectData = (projectId: string | undefined) => {
  const [projectData, setProjectData] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjectData = useCallback(() => {
    if (!projectId) {
      setProjectData(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = storage.getProject(projectId)

      if (data) {
        // storage から取得したデータを統合された Project 型に変換
        const fullProject: Project = {
          ...data.project,
          chapters: data.chapters || [],
          characters: data.characters || [],
          worldSettings: {
            items: data.worldSettings || [],
          },
          plot: data.plot,
          synopsis: data.synopsis || data.project.synopsis,
        }

        setProjectData(fullProject)
        setError(null)
      } else {
        setProjectData(null)
        setError('プロジェクトが見つかりません')
      }
    } catch (err) {
      console.error('Failed to load project data:', err)
      setError('プロジェクトデータの読み込みに失敗しました')
      setProjectData(null)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadProjectData()
  }, [loadProjectData])

  return {
    project: projectData,
    loading,
    error,
    reload: loadProjectData,
  }
}
