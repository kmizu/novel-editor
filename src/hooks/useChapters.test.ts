import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useChapters } from './useChapters'
import { storage } from '../utils/storage'
import { Chapter } from '../types/project'

vi.mock('../utils/storage', () => ({
  storage: {
    getChapters: vi.fn(),
    saveChapters: vi.fn(),
  },
}))

describe('useChapters', () => {
  const mockProjectId = 'test-project-id'

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(storage.getChapters).mockReturnValue([])
    vi.mocked(storage.saveChapters).mockImplementation(() => {})
  })

  it('should load chapters on mount', async () => {
    const mockChapters: Chapter[] = [
      {
        id: '1',
        projectId: mockProjectId,
        title: 'Chapter 1',
        content: 'Content 1',
        order: 0,
        notes: '',
        status: 'draft' as const,
        wordCount: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        projectId: mockProjectId,
        title: 'Chapter 2',
        content: 'Content 2',
        order: 1,
        notes: '',
        status: 'draft' as const,
        wordCount: 0,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
      },
    ]
    vi.mocked(storage.getChapters).mockReturnValue(mockChapters)

    const { result } = renderHook(() => useChapters(mockProjectId))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(storage.getChapters).toHaveBeenCalledWith(mockProjectId)
    expect(result.current.chapters).toEqual(mockChapters)
    expect(result.current.error).toBeNull()
  })

  it('should return empty array when projectId is null', async () => {
    const { result } = renderHook(() => useChapters(null))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(storage.getChapters).not.toHaveBeenCalled()
    expect(result.current.chapters).toEqual([])
  })

  it('should create a new chapter', async () => {
    const { result } = renderHook(() => useChapters(mockProjectId))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const newChapterData = {
      projectId: mockProjectId,
      title: 'New Chapter',
      content: 'New content',
      notes: 'New notes',
      status: 'draft' as const,
      order: 0,
    }

    let createdChapter: Chapter | null = null
    act(() => {
      createdChapter = result.current.createChapter(newChapterData)
    })

    expect(createdChapter).toMatchObject({
      ...newChapterData,
      id: expect.any(String),
      wordCount: expect.any(Number),
    })

    expect(storage.saveChapters).toHaveBeenCalledWith(
      mockProjectId,
      expect.arrayContaining([
        expect.objectContaining({
          title: 'New Chapter',
          content: 'New content',
          notes: 'New notes',
          status: 'draft' as const,
        }),
      ])
    )
  })

  it('should update an existing chapter', async () => {
    const mockChapters: Chapter[] = [
      {
        id: '1',
        projectId: mockProjectId,
        title: 'Original Title',
        content: 'Original content',
        order: 0,
        notes: '',
        status: 'draft' as const,
        wordCount: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]
    vi.mocked(storage.getChapters).mockReturnValue(mockChapters)

    const { result } = renderHook(() => useChapters(mockProjectId))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.updateChapter('1', {
        title: 'Updated Title',
        content: 'Updated content',
      })
    })

    expect(storage.saveChapters).toHaveBeenCalledWith(
      mockProjectId,
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          title: 'Updated Title',
          content: 'Updated content',
        }),
      ])
    )
  })

  it('should delete a chapter', async () => {
    const mockChapters: Chapter[] = [
      {
        id: '1',
        projectId: mockProjectId,
        title: 'Chapter 1',
        content: 'Content 1',
        order: 0,
        notes: '',
        status: 'draft' as const,
        wordCount: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        projectId: mockProjectId,
        title: 'Chapter 2',
        content: 'Content 2',
        order: 1,
        notes: '',
        status: 'draft' as const,
        wordCount: 0,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
      },
    ]
    vi.mocked(storage.getChapters).mockReturnValue(mockChapters)

    const { result } = renderHook(() => useChapters(mockProjectId))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.deleteChapter('1')
    })

    expect(storage.saveChapters).toHaveBeenCalledWith(
      mockProjectId,
      expect.arrayContaining([expect.objectContaining({ id: '2' })])
    )
    expect(storage.saveChapters).toHaveBeenCalledWith(
      mockProjectId,
      expect.not.arrayContaining([expect.objectContaining({ id: '1' })])
    )
  })

  it('should reorder chapters', async () => {
    const mockChapters: Chapter[] = [
      {
        id: '1',
        projectId: mockProjectId,
        title: 'Chapter 1',
        content: 'Content 1',
        order: 0,
        notes: '',
        status: 'draft' as const,
        wordCount: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
      {
        id: '2',
        projectId: mockProjectId,
        title: 'Chapter 2',
        content: 'Content 2',
        order: 1,
        notes: '',
        status: 'draft' as const,
        wordCount: 0,
        createdAt: '2024-01-02',
        updatedAt: '2024-01-02',
      },
      {
        id: '3',
        projectId: mockProjectId,
        title: 'Chapter 3',
        content: 'Content 3',
        order: 2,
        notes: '',
        status: 'draft' as const,
        wordCount: 0,
        createdAt: '2024-01-03',
        updatedAt: '2024-01-03',
      },
    ]
    vi.mocked(storage.getChapters).mockReturnValue(mockChapters)

    const { result } = renderHook(() => useChapters(mockProjectId))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    act(() => {
      result.current.reorderChapters(['2', '1', '3'])
    })

    expect(storage.saveChapters).toHaveBeenCalledWith(
      mockProjectId,
      expect.arrayContaining([
        expect.objectContaining({ id: '2', order: 0 }),
        expect.objectContaining({ id: '1', order: 1 }),
        expect.objectContaining({ id: '3', order: 2 }),
      ])
    )
  })

  it('should handle errors gracefully', async () => {
    const errorMessage = 'Failed to load chapters'
    vi.mocked(storage.getChapters).mockImplementation(() => {
      throw new Error(errorMessage)
    })

    const { result } = renderHook(() => useChapters(mockProjectId))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('章の読み込みに失敗しました')
    expect(result.current.chapters).toEqual([])
  })

  it('should clear error when operation succeeds', async () => {
    // 最初のマウントでエラーを発生させる
    vi.mocked(storage.getChapters).mockImplementationOnce(() => {
      throw new Error('Failed to load')
    })

    const { result } = renderHook(() => useChapters(mockProjectId))

    await waitFor(() => {
      expect(result.current.error).toBe('章の読み込みに失敗しました')
    })

    // 次の操作を成功させる
    vi.mocked(storage.getChapters).mockReturnValue([])

    act(() => {
      result.current.createChapter({
        projectId: mockProjectId,
        title: 'New Chapter',
        content: '',
        notes: '',
        status: 'draft' as const,
        order: 0,
      })
    })

    expect(result.current.error).toBeNull()
  })

  it('should use storage.getChapters and storage.saveChapters', async () => {
    const mockChapters: Chapter[] = [
      {
        id: '1',
        projectId: mockProjectId,
        title: 'Chapter 1',
        content: 'Content with text',
        order: 0,
        notes: '',
        status: 'draft' as const,
        wordCount: 0,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      },
    ]
    vi.mocked(storage.getChapters).mockReturnValue(mockChapters)

    const { result } = renderHook(() => useChapters(mockProjectId))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    // storage.getChapters が呼ばれたことを確認
    expect(storage.getChapters).toHaveBeenCalledWith(mockProjectId)

    // 章を更新
    act(() => {
      result.current.updateChapter('1', { content: 'Updated content' })
    })

    // storage.saveChapters が呼ばれたことを確認
    expect(storage.saveChapters).toHaveBeenCalledWith(
      mockProjectId,
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          content: 'Updated content',
        }),
      ])
    )
  })
})
