// テンプレート管理用のフック

import { useState, useEffect, useCallback } from 'react'
import { WritingTemplate } from '../types/template'
import { StorageManager } from '../utils/storage'
import { builtInTemplates } from '../data/builtInTemplates'

const CUSTOM_TEMPLATES_KEY = 'novel_editor_custom_templates'

export const useTemplates = () => {
  const [customTemplates, setCustomTemplates] = useState<WritingTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // カスタムテンプレートの読み込み
  const loadCustomTemplates = useCallback(() => {
    try {
      setLoading(true)
      const saved = StorageManager.get<WritingTemplate[]>(CUSTOM_TEMPLATES_KEY) || []
      setCustomTemplates(saved)
      setError(null)
    } catch (err) {
      setError('テンプレートの読み込みに失敗しました')
      console.error('Failed to load templates:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCustomTemplates()
  }, [loadCustomTemplates])

  // カスタムテンプレートの保存
  const saveCustomTemplates = useCallback((templates: WritingTemplate[]) => {
    try {
      StorageManager.set(CUSTOM_TEMPLATES_KEY, templates)
      setCustomTemplates(templates)
      return true
    } catch (err) {
      setError('テンプレートの保存に失敗しました')
      console.error('Failed to save templates:', err)
      return false
    }
  }, [])

  // 全てのテンプレートを取得
  const getAllTemplates = useCallback((): WritingTemplate[] => {
    return [...builtInTemplates, ...customTemplates]
  }, [customTemplates])

  // テンプレートをIDで取得
  const getTemplateById = useCallback(
    (id: string): WritingTemplate | undefined => {
      return getAllTemplates().find((template) => template.id === id)
    },
    [getAllTemplates]
  )

  // カスタムテンプレートの作成
  const createCustomTemplate = useCallback(
    (template: Omit<WritingTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'>) => {
      const newTemplate: WritingTemplate = {
        ...template,
        id: crypto.randomUUID(),
        isBuiltIn: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updated = [...customTemplates, newTemplate]
      if (saveCustomTemplates(updated)) {
        return newTemplate
      }
      return null
    },
    [customTemplates, saveCustomTemplates]
  )

  // カスタムテンプレートの更新
  const updateCustomTemplate = useCallback(
    (id: string, updates: Partial<WritingTemplate>) => {
      const template = customTemplates.find((t) => t.id === id)
      if (!template || template.isBuiltIn) {
        setError('テンプレートの更新に失敗しました')
        return false
      }

      const updated = customTemplates.map((t) =>
        t.id === id
          ? {
              ...t,
              ...updates,
              id: t.id,
              isBuiltIn: false,
              createdAt: t.createdAt,
              updatedAt: new Date().toISOString(),
            }
          : t
      )

      return saveCustomTemplates(updated)
    },
    [customTemplates, saveCustomTemplates]
  )

  // カスタムテンプレートの削除
  const deleteCustomTemplate = useCallback(
    (id: string) => {
      const template = customTemplates.find((t) => t.id === id)
      if (!template || template.isBuiltIn) {
        setError('テンプレートの削除に失敗しました')
        return false
      }

      const updated = customTemplates.filter((t) => t.id !== id)
      return saveCustomTemplates(updated)
    },
    [customTemplates, saveCustomTemplates]
  )

  // プロジェクトからテンプレートを作成
  const createTemplateFromProject = useCallback(
    (
      _projectData: {
        project: unknown
        chapters: unknown[]
        characters: unknown[]
        plots: unknown[]
        worldSettings: unknown[]
      },
      name: string,
      description?: string
    ) => {
      // プロジェクトデータからテンプレートを生成
      const template: Omit<WritingTemplate, 'id' | 'createdAt' | 'updatedAt' | 'isBuiltIn'> = {
        name,
        description,
        genre: 'general',
        category: 'complete',
        // TODO: プロジェクトデータからテンプレートの内容を生成
        projectTemplate: {},
        plotTemplates: [],
        chapterTemplates: [],
        characterTemplates: [],
        worldSettingTemplates: [],
      }

      return createCustomTemplate(template)
    },
    [createCustomTemplate]
  )

  return {
    builtInTemplates,
    customTemplates,
    allTemplates: getAllTemplates(),
    loading,
    error,
    getTemplateById,
    createCustomTemplate,
    updateCustomTemplate,
    deleteCustomTemplate,
    createTemplateFromProject,
    reloadTemplates: loadCustomTemplates,
  }
}
