import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useProjects } from './useProjects'
import { storage } from '../utils/storage'
import { Project } from '../types/project'

vi.mock('../utils/storage', () => ({
  storage: {
    getProjects: vi.fn(),
    saveProjects: vi.fn(),
    getProject: vi.fn(),
    saveProject: vi.fn(),
    deleteProject: vi.fn(),
    getActiveProjectId: vi.fn(),
    setActiveProjectId: vi.fn(),
  },
}))

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(storage.getProjects).mockReturnValue([])
    vi.mocked(storage.saveProjects).mockImplementation(() => {})
    vi.mocked(storage.saveProject).mockImplementation(() => {})
    vi.mocked(storage.getActiveProjectId).mockReturnValue(null)
    vi.mocked(storage.setActiveProjectId).mockImplementation(() => {})
  })

  it('should load projects on mount', async () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'Project 1',
        author: '',
        description: '',
        synopsis: '',
        genre: '',
        tags: [],
        status: 'draft',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        title: 'Project 2',
        author: '',
        description: '',
        synopsis: '',
        genre: '',
        tags: [],
        status: 'draft',
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
      },
    ]
    vi.mocked(storage.getProjects).mockReturnValue(mockProjects)
    vi.mocked(storage.getActiveProjectId).mockReturnValue('1')

    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.projects).toEqual(mockProjects)
    expect(result.current.activeProjectId).toBe('1')
    expect(result.current.error).toBeNull()
  })

  it('should create a new project', async () => {
    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newProjectData = {
      title: 'New Project',
      author: 'Test Author',
      description: 'Test description',
      synopsis: 'Test synopsis',
      genre: 'Fantasy',
      tags: ['tag1', 'tag2'],
      status: 'draft' as const,
    }

    let createdProject: ReturnType<typeof result.current.createProject> | undefined
    act(() => {
      createdProject = result.current.createProject(newProjectData)
    })

    expect(createdProject).toMatchObject({
      ...newProjectData,
      id: expect.any(String),
    })
    expect(storage.saveProjects).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining(newProjectData)])
    )
  })

  it('should update an existing project', async () => {
    const mockProjects = [
      {
        id: '1',
        title: 'Original Title',
        author: 'Author',
        description: 'Description',
        synopsis: 'Synopsis',
        genre: 'Fantasy',
        tags: [],
        status: 'draft' as const,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]
    vi.mocked(storage.getProjects).mockReturnValue(mockProjects)

    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.updateProject('1', { title: 'Updated Title' })
    })

    expect(storage.saveProjects).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          title: 'Updated Title',
        }),
      ])
    )
  })

  it('should delete a project', async () => {
    const mockProjects: Project[] = [
      {
        id: '1',
        title: 'Project 1',
        author: '',
        description: '',
        synopsis: '',
        genre: '',
        tags: [],
        status: 'draft',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        title: 'Project 2',
        author: '',
        description: '',
        synopsis: '',
        genre: '',
        tags: [],
        status: 'draft',
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
      },
    ]
    vi.mocked(storage.getProjects).mockReturnValue(mockProjects)

    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.deleteProject('1')
    })

    expect(storage.saveProjects).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: '2' })])
    )
    expect(storage.saveProjects).toHaveBeenCalledWith(
      expect.not.arrayContaining([expect.objectContaining({ id: '1' })])
    )
  })

  it('should set active project', async () => {
    const { result } = renderHook(() => useProjects())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.setActiveProject('project-123')
    })

    expect(storage.setActiveProjectId).toHaveBeenCalledWith('project-123')
    expect(result.current.activeProjectId).toBe('project-123')
  })
})
