import { create } from 'zustand'
import { api } from '../api/tauri'
import type { ProjectMeta, CreateProjectInput, UpdateProjectInput } from '../types'

interface ProjectStore {
  projects: ProjectMeta[]
  activeProject: ProjectMeta | null
  isLoading: boolean
  error: string | null

  loadProjects: () => Promise<void>
  createProject: (input: CreateProjectInput) => Promise<ProjectMeta>
  updateProject: (id: string, updates: UpdateProjectInput) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  setActiveProject: (project: ProjectMeta | null) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  activeProject: null,
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const projects = await api.listProjects()
      set({ projects, isLoading: false })
    } catch (err) {
      set({ error: String(err), isLoading: false })
    }
  },

  createProject: async (input) => {
    const project = await api.createProject(input)
    set((state) => ({ projects: [project, ...state.projects] }))
    return project
  },

  updateProject: async (id, updates) => {
    const updated = await api.updateProjectMeta(id, updates)
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? updated : p)),
      activeProject: state.activeProject?.id === id ? updated : state.activeProject,
    }))
  },

  deleteProject: async (id) => {
    await api.deleteProject(id)
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      activeProject: state.activeProject?.id === id ? null : state.activeProject,
    }))
  },

  setActiveProject: (project) => {
    set({ activeProject: project })
  },
}))
