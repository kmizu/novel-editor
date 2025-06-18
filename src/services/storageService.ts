import { Project, Chapter, Character, WorldSetting } from '../types/project'

export interface ProjectData {
  project: Project
  chapters: Chapter[]
  characters?: Character[]
  worldSettings?: WorldSetting[]
  plot?: string
  synopsis?: string
}

export interface StorageService {
  saveProject(project: Project): Promise<void>
  loadProject(projectId: string): Promise<Project | null>
  getAllProjects(): Promise<Project[]>
  deleteProject(projectId: string): Promise<void>
  exportProject(
    projectData: ProjectData,
    format: 'json' | 'kakuyomu' | 'narou' | 'text'
  ): Promise<void>
}

// ローカルストレージベースの実装（Web版用）
export class LocalStorageService implements StorageService {
  private readonly PREFIX = 'novel-editor-'

  async saveProject(project: Project): Promise<void> {
    const key = `${this.PREFIX}project-${project.id}`
    localStorage.setItem(key, JSON.stringify(project))
  }

  async loadProject(projectId: string): Promise<Project | null> {
    const key = `${this.PREFIX}project-${projectId}`
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : null
  }

  async getAllProjects(): Promise<Project[]> {
    const projects: Project[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith(`${this.PREFIX}project-`)) {
        const data = localStorage.getItem(key)
        if (data) {
          projects.push(JSON.parse(data))
        }
      }
    }
    return projects
  }

  async deleteProject(projectId: string): Promise<void> {
    const key = `${this.PREFIX}project-${projectId}`
    localStorage.removeItem(key)
  }

  async exportProject(_projectData: ProjectData, _format: string): Promise<void> {
    // Web版では別途実装
    throw new Error('Export not implemented for web version')
  }
}

// Electronファイルシステムベースの実装
export class ElectronStorageService implements StorageService {
  private currentProjectPath: string | null = null
  private api: import('../types/electron').ElectronAPI

  constructor(electronAPI: import('../types/electron').ElectronAPI) {
    this.api = electronAPI
  }

  async saveProject(project: Project): Promise<void> {
    console.log('ElectronStorageService.saveProject called')
    console.log('Current project path:', this.currentProjectPath)
    console.log('Project:', project)

    if (!this.currentProjectPath) {
      console.log('No current project path, showing save dialog')
      // 新規保存の場合はダイアログを表示
      const result = await this.api.showSaveDialog({
        title: 'プロジェクトを保存',
        defaultPath: `${project.title}.nep`,
        filters: [
          { name: 'Novel Editor Project', extensions: ['nep'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      })

      console.log('Save dialog result:', result)

      if (result.canceled || !result.filePath) {
        console.log('Save canceled by user')
        throw new Error('Save canceled')
      }

      this.currentProjectPath = result.filePath
      this.api.updateProjectPath(this.currentProjectPath)
      console.log('Updated project path to:', this.currentProjectPath)
    }

    // 完全なプロジェクトデータを構築
    const projectData: ProjectData = {
      project,
      chapters: [],
      characters: [],
      worldSettings: [],
      plot: '',
      synopsis: project.synopsis || '',
    }

    // storage.tsを使って完全なプロジェクトデータを取得
    try {
      // 動的インポートでstorage.tsを取得
      const { storage } = await import('../utils/storage')
      const fullProjectData = storage.getProject(project.id)

      if (fullProjectData) {
        projectData.chapters = fullProjectData.chapters || []
        projectData.characters = fullProjectData.characters || []
        projectData.worldSettings = fullProjectData.worldSettings || []
        projectData.plot = fullProjectData.plot || ''
        projectData.synopsis = fullProjectData.synopsis || project.synopsis || ''
      }
    } catch (e) {
      console.error('Failed to get project data from storage:', e)

      // フォールバック: LocalStorageから直接取得
      if (typeof window !== 'undefined' && window.localStorage) {
        const chaptersKey = `novel_editor_chapters_${project.id}`
        const charactersKey = `novel_editor_characters_${project.id}`
        const worldSettingsKey = `novel_editor_world_settings_${project.id}`

        const chaptersData = window.localStorage.getItem(chaptersKey)
        if (chaptersData) {
          try {
            projectData.chapters = JSON.parse(chaptersData)
          } catch (e) {
            console.error('Failed to parse chapters:', e)
          }
        }

        const charactersData = window.localStorage.getItem(charactersKey)
        if (charactersData) {
          try {
            projectData.characters = JSON.parse(charactersData)
          } catch (e) {
            console.error('Failed to parse characters:', e)
          }
        }

        const worldSettingsData = window.localStorage.getItem(worldSettingsKey)
        if (worldSettingsData) {
          try {
            projectData.worldSettings = JSON.parse(worldSettingsData)
          } catch (e) {
            console.error('Failed to parse world settings:', e)
          }
        }
      }
    }

    // プロジェクトデータを保存
    console.log('Saving to file:', this.currentProjectPath)
    console.log('Project data to save:', projectData)
    const saveResult = await this.api.saveFile(
      this.currentProjectPath,
      JSON.stringify(projectData, null, 2)
    )

    console.log('Save result:', saveResult)

    if (!saveResult.success) {
      throw new Error(saveResult.error || 'Failed to save project')
    }
  }

  async loadProject(_projectId: string): Promise<Project | null> {
    console.log('ElectronStorageService.loadProject called with:', _projectId)
    // Electron版では直接ファイルから読み込む
    if (!this.currentProjectPath) {
      console.log('No current project path')
      return null
    }

    console.log('Reading from file:', this.currentProjectPath)
    const result = await this.api.readFile(this.currentProjectPath)
    console.log('Read result:', result)
    if (result.success && result.content) {
      const project = JSON.parse(result.content)
      console.log('Loaded project:', project)
      return project
    }
    return null
  }

  async getAllProjects(): Promise<Project[]> {
    // Electron版では最近のプロジェクト一覧を別途管理する必要がある
    // ここでは簡易実装として、現在開いているプロジェクトのみを返す
    if (this.currentProjectPath) {
      const project = await this.loadProject('current')
      return project ? [project] : []
    }
    return []
  }

  async deleteProject(_projectId: string): Promise<void> {
    // Electron版ではファイルの削除は別途実装
    throw new Error('Delete not implemented yet')
  }

  async exportProject(projectData: ProjectData, format: string): Promise<void> {
    let content = ''
    let extension = 'txt'

    switch (format) {
      case 'kakuyomu':
        content = this.exportToKakuyomu(projectData)
        extension = 'txt'
        break
      case 'narou':
        content = this.exportToNarou(projectData)
        extension = 'txt'
        break
      case 'text':
        content = this.exportToText(projectData)
        extension = 'txt'
        break
      case 'json':
        content = JSON.stringify(projectData, null, 2)
        extension = 'json'
        break
    }

    const result = await this.api.showSaveDialog({
      title: `${format}形式でエクスポート`,
      defaultPath: `${projectData.project.title}.${extension}`,
      filters: [
        { name: 'Text Files', extensions: [extension] },
        { name: 'All Files', extensions: ['*'] },
      ],
    })

    if (!result.canceled && result.filePath) {
      await this.api.saveFile(result.filePath, content)
    }
  }

  private exportToKakuyomu(projectData: ProjectData): string {
    let content = `${projectData.project.title}\n\n`
    content += `${projectData.project.synopsis}\n\n`

    projectData.chapters.forEach((chapter: Chapter) => {
      content += `${chapter.title}\n\n`
      content += `${chapter.content}\n\n`
    })

    return content
  }

  private exportToNarou(projectData: ProjectData): string {
    let content = `${projectData.project.title}\n\n`
    content += `${projectData.project.synopsis}\n\n`

    projectData.chapters.forEach((chapter: Chapter) => {
      content += `${chapter.title}\n\n`
      content += `${chapter.content}\n\n`
    })

    return content
  }

  private exportToText(projectData: ProjectData): string {
    let content = `# ${projectData.project.title}\n\n`
    content += `## あらすじ\n${projectData.project.synopsis}\n\n`

    if (projectData.plot) {
      content += `## プロット\n${projectData.plot}\n\n`
    }

    content += `## 本文\n\n`
    projectData.chapters.forEach((chapter: Chapter) => {
      content += `### ${chapter.title}\n\n`
      content += `${chapter.content}\n\n`
    })

    return content
  }

  setCurrentProjectPath(path: string | null) {
    this.currentProjectPath = path
    if (path) {
      this.api.updateProjectPath(path)
    }
  }
}
