import { useState, useEffect, useCallback } from 'react'
import { Project, Chapter, Character, Plot, WorldSetting } from '../types/project'
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

  const importProject = useCallback(
    (shareData: {
      version: string
      project: Project
      chapters: Chapter[]
      characters: Character[]
      plots: Plot[]
      worldSettings: WorldSetting[]
      exportedAt: string
    }) => {
      try {
        // 新しいプロジェクトIDを生成
        const newProjectId = crypto.randomUUID()
        const now = new Date().toISOString()

        // プロジェクトデータを新しいIDで作成
        const importedProject: Project = {
          ...shareData.project,
          id: newProjectId,
          title: `${shareData.project.title} (インポート)`,
          createdAt: now,
          updatedAt: now,
        }

        // 各種データのIDを新しいプロジェクトIDに更新
        const importedChapters = shareData.chapters.map((chapter) => ({
          ...chapter,
          projectId: newProjectId,
        }))

        const importedCharacters = shareData.characters.map((character) => ({
          ...character,
          projectId: newProjectId,
        }))

        const importedPlots = shareData.plots.map((plot) => ({
          ...plot,
          projectId: newProjectId,
        }))

        const importedWorldSettings = shareData.worldSettings.map((setting) => ({
          ...setting,
          projectId: newProjectId,
        }))

        // プロジェクトリストに追加
        const updatedProjects = [...projects, importedProject]
        storage.saveProjects(updatedProjects)
        setProjects(updatedProjects)

        // プロジェクトデータを保存
        storage.saveProject({
          project: importedProject,
          chapters: importedChapters,
          characters: importedCharacters,
          worldSettings: importedWorldSettings,
          plot: '',
          synopsis: importedProject.synopsis || '',
        })

        // 個別のデータも保存
        const chaptersKey = `novel_editor_chapters_${newProjectId}`
        const charactersKey = `novel_editor_characters_${newProjectId}`
        const plotsKey = `novel_editor_plots_${newProjectId}`
        const worldSettingsKey = `novel_editor_world_settings_${newProjectId}`

        localStorage.setItem(chaptersKey, JSON.stringify(importedChapters))
        localStorage.setItem(charactersKey, JSON.stringify(importedCharacters))
        localStorage.setItem(plotsKey, JSON.stringify(importedPlots))
        localStorage.setItem(worldSettingsKey, JSON.stringify(importedWorldSettings))

        // インポートしたプロジェクトをアクティブに設定
        setActiveProject(newProjectId)

        return { success: true, projectId: newProjectId }
      } catch (err) {
        console.error('Error importing project:', err)
        return { success: false, error: 'プロジェクトのインポートに失敗しました' }
      }
    },
    [projects, setActiveProject]
  )

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
    importProject,
    reloadProjects: loadProjects,
  }
}
