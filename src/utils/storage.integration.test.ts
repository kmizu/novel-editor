import { describe, it, expect, beforeEach, vi } from 'vitest'
import { storage } from './storage'
import { Project, Chapter } from '../types/project'

// localStorageの実装をテスト用に作成
const createLocalStorageMock = () => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
    get length() {
      return Object.keys(store).length
    },
    key: (index: number) => {
      const keys = Object.keys(store)
      return keys[index] || null
    },
  }
}

describe('Storage Integration Tests', () => {
  beforeEach(() => {
    // localStorageのモックを実際の動作に近いものに置き換え
    const localStorageMock = createLocalStorageMock()
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    vi.clearAllMocks()
  })

  describe('Project and Chapter Integration', () => {
    const mockProject: Project = {
      id: 'test-project-id',
      title: 'Test Project',
      author: 'Test Author',
      description: 'Test Description',
      synopsis: 'Test Synopsis',
      genre: 'Fantasy',
      tags: ['tag1', 'tag2'],
      status: 'draft',
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }

    const mockChapter: Chapter = {
      id: 'chapter-1',
      projectId: 'test-project-id',
      title: 'Chapter 1',
      content: 'This is the content of chapter 1.',
      order: 0,
      notes: 'Chapter notes',
      status: 'draft' as const,
      wordCount: 30,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    }

    it('should save and retrieve project data', () => {
      // Save project
      storage.saveProjects([mockProject])

      // Verify project is saved
      const projects = storage.getProjects()
      expect(projects).toHaveLength(1)
      expect(projects[0]).toEqual(mockProject)
    })

    it('should save and retrieve chapters for a project', () => {
      // Save chapters
      storage.saveChapters(mockProject.id, [mockChapter])

      // Verify chapters are saved
      const chapters = storage.getChapters(mockProject.id)
      expect(chapters).toHaveLength(1)
      expect(chapters[0]).toEqual(mockChapter)
    })

    it('should handle complete project data workflow', () => {
      // Save project
      storage.saveProjects([mockProject])
      storage.setActiveProjectId(mockProject.id)

      // Save chapters
      const chapters = [
        { ...mockChapter, id: 'chapter-1', order: 0, title: 'Chapter 1' },
        { ...mockChapter, id: 'chapter-2', order: 1, title: 'Chapter 2' },
        { ...mockChapter, id: 'chapter-3', order: 2, title: 'Chapter 3' },
      ]
      storage.saveChapters(mockProject.id, chapters)

      // Verify everything is saved correctly
      expect(storage.getProjects()).toHaveLength(1)
      expect(storage.getActiveProjectId()).toBe(mockProject.id)
      expect(storage.getChapters(mockProject.id)).toHaveLength(3)

      // Verify chapter order
      const savedChapters = storage.getChapters(mockProject.id)
      expect(savedChapters[0].title).toBe('Chapter 1')
      expect(savedChapters[1].title).toBe('Chapter 2')
      expect(savedChapters[2].title).toBe('Chapter 3')
    })

    it('should handle multiple projects with their own chapters', () => {
      const project1 = { ...mockProject, id: 'project-1', title: 'Project 1' }
      const project2 = { ...mockProject, id: 'project-2', title: 'Project 2' }

      // Save projects
      storage.saveProjects([project1, project2])

      // Save chapters for each project
      storage.saveChapters('project-1', [
        { ...mockChapter, id: 'p1-c1', projectId: 'project-1', title: 'P1 Chapter 1' },
        { ...mockChapter, id: 'p1-c2', projectId: 'project-1', title: 'P1 Chapter 2' },
      ])

      storage.saveChapters('project-2', [
        { ...mockChapter, id: 'p2-c1', projectId: 'project-2', title: 'P2 Chapter 1' },
      ])

      // Verify each project has its own chapters
      expect(storage.getChapters('project-1')).toHaveLength(2)
      expect(storage.getChapters('project-2')).toHaveLength(1)

      // Verify chapters are correctly associated
      const p1Chapters = storage.getChapters('project-1')
      expect(p1Chapters.every((c) => c.projectId === 'project-1')).toBe(true)

      const p2Chapters = storage.getChapters('project-2')
      expect(p2Chapters.every((c) => c.projectId === 'project-2')).toBe(true)
    })

    it('should return empty array for non-existent project chapters', () => {
      const chapters = storage.getChapters('non-existent-project')
      expect(chapters).toEqual([])
    })

    it('should handle project deletion', () => {
      // Save project and chapters
      storage.saveProjects([mockProject])
      storage.saveChapters(mockProject.id, [mockChapter])

      // Delete project
      storage.deleteProject(mockProject.id)

      // Note: This test assumes deleteProject only removes project data
      // Chapters might need separate deletion in real implementation
      const projectData = storage.getProject(mockProject.id)
      expect(projectData).toBeNull()
    })

    it('should handle active project switching', () => {
      const project1 = { ...mockProject, id: 'project-1' }
      const project2 = { ...mockProject, id: 'project-2' }

      storage.saveProjects([project1, project2])

      // Set project 1 as active
      storage.setActiveProjectId('project-1')
      expect(storage.getActiveProjectId()).toBe('project-1')

      // Switch to project 2
      storage.setActiveProjectId('project-2')
      expect(storage.getActiveProjectId()).toBe('project-2')

      // Clear active project
      storage.setActiveProjectId(null)
      expect(storage.getActiveProjectId()).toBeNull()
    })

    it('should handle getAllChapters for multiple projects', () => {
      const project1 = { ...mockProject, id: 'project-1' }
      const project2 = { ...mockProject, id: 'project-2' }

      storage.saveProjects([project1, project2])

      storage.saveChapters('project-1', [{ ...mockChapter, id: 'p1-c1', projectId: 'project-1' }])

      storage.saveChapters('project-2', [
        { ...mockChapter, id: 'p2-c1', projectId: 'project-2' },
        { ...mockChapter, id: 'p2-c2', projectId: 'project-2' },
      ])

      const allChapters = storage.getAllChapters()

      expect(Object.keys(allChapters)).toHaveLength(2)
      expect(allChapters['project-1']).toHaveLength(1)
      expect(allChapters['project-2']).toHaveLength(2)
    })
  })

  describe('Storage key consistency', () => {
    it('should use consistent keys for chapter storage and retrieval', () => {
      const projectId = 'test-project'
      const chapters = [
        {
          id: 'chapter-1',
          projectId,
          title: 'Test Chapter',
          content: 'Test content',
          order: 0,
          notes: '',
          status: 'draft' as const,
          wordCount: 12,
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ]

      // Save chapters
      storage.saveChapters(projectId, chapters)

      // Verify the key used
      const expectedKey = `novel_editor_chapters_${projectId}`
      const storedData = localStorage.getItem(expectedKey)
      expect(storedData).toBeTruthy()

      // Verify retrieval uses the same key
      const retrievedChapters = storage.getChapters(projectId)
      expect(retrievedChapters).toEqual(chapters)
    })
  })
})
