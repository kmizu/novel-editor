import { Project, Chapter, Character, WorldSetting } from '../types/project'

const STORAGE_PREFIX = 'novel_editor_'

export const StorageKeys = {
  PROJECTS: `${STORAGE_PREFIX}projects`,
  CHAPTERS: `${STORAGE_PREFIX}chapters`,
  CHARACTERS: `${STORAGE_PREFIX}characters`,
  PLOTS: `${STORAGE_PREFIX}plots`,
  WORLD_SETTINGS: `${STORAGE_PREFIX}world_settings`,
  MEMOS: `${STORAGE_PREFIX}memos`,
  ACTIVE_PROJECT: `${STORAGE_PREFIX}active_project`,
  USER_PREFERENCES: `${STORAGE_PREFIX}preferences`,
  VERSION_SETTINGS: `${STORAGE_PREFIX}version_settings`,
} as const

interface ProjectData {
  project: Project
  chapters: Chapter[]
  characters: Character[]
  worldSettings: WorldSetting[]
  plot?: string
  synopsis?: string
}

export class StorageManager {
  static get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error(`Error reading from localStorage with key ${key}:`, error)
      return null
    }
  }

  static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.error(`Error writing to localStorage with key ${key}:`, error)
      return false
    }
  }

  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.error(`Error removing from localStorage with key ${key}:`, error)
      return false
    }
  }

  static clear(): boolean {
    try {
      Object.values(StorageKeys).forEach((key) => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  static getStorageSize(): number {
    let totalSize = 0
    Object.values(StorageKeys).forEach((key) => {
      const item = localStorage.getItem(key)
      if (item) {
        totalSize += item.length
      }
    })
    return totalSize
  }

  static exportAllData(): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    Object.entries(StorageKeys).forEach(([name, key]) => {
      const value = this.get(key)
      if (value !== null) {
        data[name] = value
      }
    })
    return data
  }

  static importAllData(data: Record<string, unknown>): boolean {
    try {
      Object.entries(data).forEach(([name, value]) => {
        const key = StorageKeys[name as keyof typeof StorageKeys]
        if (key) {
          this.set(key, value)
        }
      })
      return true
    } catch (error) {
      console.error('Error importing data:', error)
      return false
    }
  }
}

export const storage = {
  getProjects(): Project[] {
    return StorageManager.get<Project[]>(StorageKeys.PROJECTS) || []
  },

  saveProjects(projects: Project[]): void {
    StorageManager.set(StorageKeys.PROJECTS, projects)
  },

  getProject(projectId: string): ProjectData | null {
    const key = `${STORAGE_PREFIX}project_${projectId}`
    return StorageManager.get<ProjectData>(key)
  },

  saveProject(projectData: ProjectData): void {
    const key = `${STORAGE_PREFIX}project_${projectData.project.id}`
    StorageManager.set(key, projectData)
  },

  deleteProject(projectId: string): void {
    const key = `${STORAGE_PREFIX}project_${projectId}`
    StorageManager.remove(key)
  },

  getActiveProjectId(): string | null {
    return StorageManager.get<string>(StorageKeys.ACTIVE_PROJECT)
  },

  setActiveProjectId(projectId: string | null): void {
    if (projectId === null) {
      StorageManager.remove(StorageKeys.ACTIVE_PROJECT)
    } else {
      StorageManager.set(StorageKeys.ACTIVE_PROJECT, projectId)
    }
  },

  getChapters(projectId: string): Chapter[] {
    const key = `${STORAGE_PREFIX}chapters_${projectId}`
    return StorageManager.get<Chapter[]>(key) || []
  },

  saveChapters(projectId: string, chapters: Chapter[]): void {
    const key = `${STORAGE_PREFIX}chapters_${projectId}`
    StorageManager.set(key, chapters)
  },

  getAllChapters(): Record<string, Chapter[]> {
    const allChapters: Record<string, Chapter[]> = {}
    const projects = this.getProjects()
    projects.forEach((project) => {
      allChapters[project.id] = this.getChapters(project.id)
    })
    return allChapters
  },

  clearAll(): void {
    StorageManager.clear()
  },
}
