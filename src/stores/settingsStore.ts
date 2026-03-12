import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EditorSettings } from '../types'
import { DEFAULT_EDITOR_SETTINGS } from '../types'

type Theme = 'light' | 'dark'

interface SettingsStore {
  theme: Theme
  editorSettings: EditorSettings
  focusMode: boolean
  toggleTheme: () => void
  setEditorSettings: (settings: Partial<EditorSettings>) => void
  toggleFocusMode: () => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      editorSettings: DEFAULT_EDITOR_SETTINGS,
      focusMode: false,

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(next)
        set({ theme: next })
      },

      setEditorSettings: (settings) =>
        set((state) => ({
          editorSettings: { ...state.editorSettings, ...settings },
        })),

      toggleFocusMode: () =>
        set((state) => ({ focusMode: !state.focusMode })),
    }),
    {
      name: 'novel-editor-settings',
      partialize: (state) => ({
        theme: state.theme,
        editorSettings: state.editorSettings,
        // focusMode は永続化しない（起動時は常に通常モード）
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.theme) {
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(state.theme)
        }
      },
    }
  )
)
