import { create } from 'zustand'
import { api } from '../api/tauri'
import type { ChapterMeta, Chapter, CreateChapterInput, UpdateChapterMetaInput } from '../types'

interface EditorStore {
  chapters: ChapterMeta[]
  activeChapter: Chapter | null
  isSaving: boolean
  lastSaved: Date | null
  saveError: string | null
  isLoadingChapter: boolean

  loadChapters: (projectId: string) => Promise<void>
  selectChapter: (projectId: string, chapterId: string) => Promise<void>
  createChapter: (projectId: string, input: CreateChapterInput) => Promise<ChapterMeta>
  saveContent: (projectId: string, chapterId: string, content: string) => Promise<void>
  updateChapterMeta: (projectId: string, chapterId: string, updates: UpdateChapterMetaInput) => Promise<void>
  deleteChapter: (projectId: string, chapterId: string) => Promise<void>
  reorderChapters: (projectId: string, chapterIds: string[]) => Promise<void>
  clearEditor: () => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  chapters: [],
  activeChapter: null,
  isSaving: false,
  lastSaved: null,
  saveError: null,
  isLoadingChapter: false,

  loadChapters: async (projectId) => {
    const chapters = await api.listChapters(projectId)
    set({ chapters })
  },

  selectChapter: async (projectId, chapterId) => {
    set({ isLoadingChapter: true })
    try {
      const chapter = await api.readChapter(projectId, chapterId)
      set({ activeChapter: chapter, isLoadingChapter: false })
    } catch {
      set({ isLoadingChapter: false })
    }
  },

  createChapter: async (projectId, input) => {
    const chapter = await api.createChapter(projectId, input)
    set((state) => ({ chapters: [...state.chapters, chapter] }))
    return chapter
  },

  saveContent: async (projectId, chapterId, content) => {
    set({ isSaving: true, saveError: null })
    try {
      const updated = await api.saveChapterContent(projectId, chapterId, content)
      set((state) => ({
        isSaving: false,
        lastSaved: new Date(),
        chapters: state.chapters.map((c) => (c.id === chapterId ? updated : c)),
        activeChapter: state.activeChapter?.id === chapterId
          ? { ...state.activeChapter, ...updated, content }
          : state.activeChapter,
      }))
    } catch (err) {
      set({ isSaving: false, saveError: String(err) })
    }
  },

  updateChapterMeta: async (projectId, chapterId, updates) => {
    const updated = await api.updateChapterMeta(projectId, chapterId, updates)
    set((state) => ({
      chapters: state.chapters.map((c) => (c.id === chapterId ? updated : c)),
    }))
  },

  deleteChapter: async (projectId, chapterId) => {
    await api.deleteChapter(projectId, chapterId)
    set((state) => ({
      chapters: state.chapters.filter((c) => c.id !== chapterId),
      activeChapter: state.activeChapter?.id === chapterId ? null : state.activeChapter,
    }))
  },

  reorderChapters: async (projectId, chapterIds) => {
    await api.reorderChapters(projectId, chapterIds)
    set((state) => {
      const chapterMap = new Map(state.chapters.map((c) => [c.id, c]))
      const ordered = chapterIds
        .map((id, index) => {
          const chapter = chapterMap.get(id)
          return chapter ? { ...chapter, order: index } : null
        })
        .filter((c): c is ChapterMeta => c !== null)
      return { chapters: ordered }
    })
  },

  clearEditor: () => {
    set({ chapters: [], activeChapter: null, lastSaved: null, saveError: null })
  },
}))
