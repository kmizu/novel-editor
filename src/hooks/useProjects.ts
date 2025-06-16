import { useState, useEffect, useCallback } from 'react'
import { Project } from '../types/project'
import { storage } from '../utils/storage'

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProjects = useCallback(() => {
    try {
      setLoading(true)
      const savedProjects = storage.getProjects()
      const savedActiveId = storage.getActiveProjectId()

      setProjects(savedProjects)
      setActiveProjectId(savedActiveId)
      setError(null)
    } catch (err) {
      setError('プロジェクトの読み込みに失敗しました')
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  const createProject = useCallback(
    (projectData: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
      try {
        const newProject: Project = {
          ...projectData,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        const updatedProjects = [...projects, newProject]
        storage.saveProjects(updatedProjects)
        setProjects(updatedProjects)

        // 新規プロジェクトのデータを初期化
        storage.saveProject({
          project: newProject,
          chapters: [],
          characters: [],
          worldSettings: [],
          plot: '',
          synopsis: projectData.synopsis || '',
        })

        return newProject
      } catch (err) {
        setError('プロジェクトの作成に失敗しました')
        console.error('Error creating project:', err)
        return null
      }
    },
    [projects]
  )

  const updateProject = useCallback(
    (projectId: string, updates: Partial<Project>) => {
      try {
        const updatedProjects = projects.map((project) =>
          project.id === projectId
            ? { ...project, ...updates, updatedAt: new Date().toISOString() }
            : project
        )

        storage.saveProjects(updatedProjects)
        setProjects(updatedProjects)
        return true
      } catch (err) {
        setError('プロジェクトの更新に失敗しました')
        console.error('Error updating project:', err)
        return false
      }
    },
    [projects]
  )

  const setActiveProject = useCallback((projectId: string | null) => {
    try {
      storage.setActiveProjectId(projectId)
      setActiveProjectId(projectId)
      return true
    } catch (err) {
      setError('アクティブプロジェクトの設定に失敗しました')
      console.error('Error setting active project:', err)
      return false
    }
  }, [])

  const deleteProject = useCallback(
    (projectId: string) => {
      try {
        const updatedProjects = projects.filter((project) => project.id !== projectId)
        storage.saveProjects(updatedProjects)
        storage.deleteProject(projectId)
        setProjects(updatedProjects)

        if (activeProjectId === projectId) {
          const newActiveId = updatedProjects.length > 0 ? updatedProjects[0].id : null
          setActiveProject(newActiveId)
        }

        return true
      } catch (err) {
        setError('プロジェクトの削除に失敗しました')
        console.error('Error deleting project:', err)
        return false
      }
    },
    [projects, activeProjectId, setActiveProject]
  )

  const getActiveProject = useCallback(() => {
    return projects.find((project) => project.id === activeProjectId) || null
  }, [projects, activeProjectId])

  const currentProject = getActiveProject()

  return {
    projects,
    activeProjectId,
    activeProject: currentProject,
    currentProject,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    setActiveProject,
    reloadProjects: loadProjects,
  }
}
