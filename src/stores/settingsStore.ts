import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { EditorSettings } from '../types'
import { DEFAULT_EDITOR_SETTINGS } from '../types'

type Theme = 'light' | 'dark'

interface SettingsStore {
  theme: Theme
  editorSettings: EditorSettings
  toggleTheme: () => void
  setEditorSettings: (settings: Partial<EditorSettings>) => void
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      theme: 'light',
      editorSettings: DEFAULT_EDITOR_SETTINGS,

      toggleTheme: () => {
        const next = get().theme === 'light' ? 'dark' : 'light'
        // html 要素にクラスを付与（Tailwind の class-based dark mode）
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(next)
        set({ theme: next })
      },

      setEditorSettings: (settings) =>
        set((state) => ({
          editorSettings: { ...state.editorSettings, ...settings },
        })),
    }),
    {
      name: 'novel-editor-settings',
      onRehydrateStorage: () => (state) => {
        // 起動時にテーマを復元
        if (state?.theme) {
          document.documentElement.classList.remove('light', 'dark')
          document.documentElement.classList.add(state.theme)
        }
      },
    }
  )
)
