import { useNavigate } from 'react-router-dom'
import { useElectronMenu } from '../hooks/useElectron'
import { useStorage } from '../contexts/StorageContext'
import { useProjects } from '../hooks/useProjects'
import { ElectronStorageService } from '../services/storageService'
import { storage } from '../utils/storage'

export function ElectronMenuHandler() {
  const navigate = useNavigate()
  const { storageService } = useStorage()
  const { activeProject, projects, activeProjectId } = useProjects()

  console.log('ElectronMenuHandler render:', {
    activeProject,
    activeProjectId,
    projectsCount: projects.length,
    storageService: storageService.constructor.name,
  })

  useElectronMenu(async (action, data) => {
    switch (action) {
      case 'new-project':
        navigate('/projects')
        break

      case 'open-project':
        if (data && typeof data === 'object' && 'data' in data) {
          try {
            // const project = JSON.parse(data.data);
            // プロジェクトを読み込む処理
            if (storageService instanceof ElectronStorageService && 'path' in data) {
              storageService.setCurrentProjectPath(data.path as string)
            }
            // TODO: プロジェクトをインポートして開く
          } catch (error) {
            console.error('Failed to open project:', error)
          }
        }
        break

      case 'save-project': {
        console.log('Menu action: save-project')
        let projectToSave = activeProject
        if (!projectToSave && activeProjectId) {
          const project = projects.find((p) => p.id === activeProjectId)
          if (project) {
            projectToSave = project
          } else {
            const projectData = storage.getProject(activeProjectId)
            if (projectData) {
              projectToSave = projectData.project
            }
          }
        }

        if (projectToSave) {
          try {
            await storageService.saveProject(projectToSave)
          } catch (error) {
            console.error('Failed to save project:', error)
          }
        }
        break
      }

      case 'save-project-as': {
        console.log('Menu action: save-project-as')
        console.log('Active project:', activeProject)
        console.log('Active project ID:', activeProjectId)
        console.log('Projects array:', projects)
        console.log('Storage service:', storageService)

        // デバッグ: localStorageの内容を確認
        if (typeof window !== 'undefined' && window.localStorage) {
          console.log('LocalStorage keys:', Object.keys(window.localStorage))
          const projectsKey = 'novel_editor_projects'
          const projectsData = window.localStorage.getItem(projectsKey)
          console.log('Projects in localStorage:', projectsData)
        }

        // activeProjectがない場合、activeProjectIdから再取得を試みる
        let projectToSave = activeProject
        if (!projectToSave && activeProjectId) {
          // projectsから取得
          const project = projects.find((p) => p.id === activeProjectId)
          if (project) {
            projectToSave = project
            console.log('Found project by ID:', projectToSave)
          } else {
            // それでも見つからない場合はlocalStorageから直接取得
            const projectData = storage.getProject(activeProjectId)
            if (projectData) {
              projectToSave = projectData.project
              console.log('Found project in localStorage:', projectToSave)
            }
          }
        }

        if (projectToSave) {
          try {
            // 新しいパスで保存（currentProjectPathをnullにリセット）
            if (storageService instanceof ElectronStorageService) {
              console.log('Resetting current project path')
              storageService.setCurrentProjectPath(null)
            }
            console.log('Calling saveProject with:', projectToSave)
            await storageService.saveProject(projectToSave)
            console.log('Save project completed')
          } catch (error) {
            console.error('Save project error:', error)
            if (error instanceof Error && error.message !== 'Save canceled') {
              console.error('Failed to save project as:', error)
              // エラーダイアログを表示
              alert(`プロジェクトの保存に失敗しました: ${error.message}`)
            }
          }
        } else {
          console.log('No active project found')
          console.log('Projects:', projects)
          alert('保存するプロジェクトが選択されていません。')
        }
        break
      }

      case 'export':
        if (activeProject && data && typeof data === 'object' && 'format' in data) {
          try {
            // TODO: chaptersとplotデータを取得してProjectDataを作成
            // await storageService.exportProject(projectData, data.format);
          } catch (error) {
            console.error('Failed to export project:', error)
          }
        }
        break
    }
  })

  return null
}
