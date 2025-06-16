import { useState, useCallback, useEffect } from 'react'
import { WorldSetting } from '../types/project'
import { storage } from '../utils/storage'
import { useProjects } from './useProjects'

export function useWorldSettings() {
  const { currentProject, updateProject } = useProjects()
  const [worldSettings, setWorldSettings] = useState<WorldSetting[]>([])

  useEffect(() => {
    if (currentProject) {
      const projectData = storage.getProject(currentProject.id)
      setWorldSettings(projectData?.worldSettings || [])
    }
  }, [currentProject])

  const addWorldSetting = useCallback(
    (setting: Omit<WorldSetting, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!currentProject) return

      const newSetting: WorldSetting = {
        ...setting,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedSettings = [...worldSettings, newSetting]
      setWorldSettings(updatedSettings)

      const projectData = storage.getProject(currentProject.id)
      if (projectData) {
        storage.saveProject({
          ...projectData,
          worldSettings: updatedSettings,
          project: {
            ...projectData.project,
            updatedAt: new Date().toISOString(),
          },
        })
        updateProject(currentProject.id, { updatedAt: new Date().toISOString() })
      }

      return newSetting
    },
    [worldSettings, currentProject, updateProject]
  )

  const updateWorldSetting = useCallback(
    (id: string, updates: Partial<WorldSetting>) => {
      if (!currentProject) return

      const updatedSettings = worldSettings.map((setting) =>
        setting.id === id
          ? { ...setting, ...updates, updatedAt: new Date().toISOString() }
          : setting
      )
      setWorldSettings(updatedSettings)

      const projectData = storage.getProject(currentProject.id)
      if (projectData) {
        storage.saveProject({
          ...projectData,
          worldSettings: updatedSettings,
          project: {
            ...projectData.project,
            updatedAt: new Date().toISOString(),
          },
        })
        updateProject(currentProject.id, { updatedAt: new Date().toISOString() })
      }
    },
    [worldSettings, currentProject, updateProject]
  )

  const deleteWorldSetting = useCallback(
    (id: string) => {
      if (!currentProject) return

      const updatedSettings = worldSettings.filter((setting) => setting.id !== id)
      setWorldSettings(updatedSettings)

      const projectData = storage.getProject(currentProject.id)
      if (projectData) {
        storage.saveProject({
          ...projectData,
          worldSettings: updatedSettings,
          project: {
            ...projectData.project,
            updatedAt: new Date().toISOString(),
          },
        })
        updateProject(currentProject.id, { updatedAt: new Date().toISOString() })
      }
    },
    [worldSettings, currentProject, updateProject]
  )

  const getWorldSetting = useCallback(
    (id: string) => {
      return worldSettings.find((setting) => setting.id === id)
    },
    [worldSettings]
  )

  const getSettingsByCategory = useCallback(
    (category: WorldSetting['category']) => {
      return worldSettings.filter((setting) => setting.category === category)
    },
    [worldSettings]
  )

  return {
    worldSettings,
    addWorldSetting,
    updateWorldSetting,
    deleteWorldSetting,
    getWorldSetting,
    getSettingsByCategory,
  }
}
