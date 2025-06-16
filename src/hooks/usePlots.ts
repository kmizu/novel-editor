import { useState, useEffect, useCallback } from 'react'
import { Plot } from '../types/project'
import { StorageManager, StorageKeys } from '../utils/storage'
import { generateId } from '../utils/helpers'

export const usePlots = (projectId: string | null) => {
  const [plots, setPlots] = useState<Plot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // プロットを読み込む
  const loadPlots = useCallback(() => {
    if (!projectId) {
      setPlots([])
      setLoading(false)
      return
    }

    try {
      const allPlots = StorageManager.get<Plot[]>(StorageKeys.PLOTS) || []
      const projectPlots = allPlots.filter((plot) => plot.projectId === projectId)
      setPlots(projectPlots)
      setError(null)
    } catch (err) {
      setError('プロットの読み込みに失敗しました')
      console.error('Failed to load plots:', err)
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadPlots()
  }, [loadPlots])

  // プロットを作成
  const createPlot = useCallback(
    (plotData: Omit<Plot, 'id' | 'createdAt' | 'updatedAt'>): Plot | null => {
      if (!projectId) return null

      try {
        const now = new Date().toISOString()
        const newPlot: Plot = {
          ...plotData,
          id: generateId(),
          projectId,
          createdAt: now,
          updatedAt: now,
        }

        const allPlots = StorageManager.get<Plot[]>(StorageKeys.PLOTS) || []
        allPlots.push(newPlot)
        StorageManager.set(StorageKeys.PLOTS, allPlots)

        setPlots((prev) => [...prev, newPlot])
        return newPlot
      } catch (err) {
        setError('プロットの作成に失敗しました')
        console.error('Failed to create plot:', err)
        return null
      }
    },
    [projectId]
  )

  // プロットを更新
  const updatePlot = useCallback((plotId: string, updates: Partial<Plot>): boolean => {
    try {
      const allPlots = StorageManager.get<Plot[]>(StorageKeys.PLOTS) || []
      const plotIndex = allPlots.findIndex((p) => p.id === plotId)

      if (plotIndex === -1) return false

      allPlots[plotIndex] = {
        ...allPlots[plotIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      StorageManager.set(StorageKeys.PLOTS, allPlots)

      setPlots((prev) =>
        prev.map((p) =>
          p.id === plotId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
        )
      )

      return true
    } catch (err) {
      setError('プロットの更新に失敗しました')
      console.error('Failed to update plot:', err)
      return false
    }
  }, [])

  // プロットを削除
  const deletePlot = useCallback((plotId: string): boolean => {
    try {
      const allPlots = StorageManager.get<Plot[]>(StorageKeys.PLOTS) || []
      const filteredPlots = allPlots.filter((p) => p.id !== plotId)

      StorageManager.set(StorageKeys.PLOTS, filteredPlots)
      setPlots((prev) => prev.filter((p) => p.id !== plotId))

      return true
    } catch (err) {
      setError('プロットの削除に失敗しました')
      console.error('Failed to delete plot:', err)
      return false
    }
  }, [])

  // プロットの順序を変更
  const reorderPlots = useCallback(
    (plotIds: string[]): boolean => {
      try {
        const allPlots = StorageManager.get<Plot[]>(StorageKeys.PLOTS) || []
        const reorderedProjectPlots = plotIds
          .map((id, index) => {
            const plot = plots.find((p) => p.id === id)
            return plot ? { ...plot, order: index } : null
          })
          .filter((p): p is Plot => p !== null)

        // プロジェクト外のプロットを保持
        const otherPlots = allPlots.filter((p) => p.projectId !== projectId)
        const updatedAllPlots = [...otherPlots, ...reorderedProjectPlots]

        StorageManager.set(StorageKeys.PLOTS, updatedAllPlots)
        setPlots(reorderedProjectPlots)

        return true
      } catch (err) {
        setError('プロットの並び替えに失敗しました')
        console.error('Failed to reorder plots:', err)
        return false
      }
    },
    [plots, projectId]
  )

  // データを再読み込み
  const reloadPlots = useCallback(() => {
    setLoading(true)
    loadPlots()
  }, [loadPlots])

  return {
    plots,
    loading,
    error,
    createPlot,
    updatePlot,
    deletePlot,
    reorderPlots,
    reloadPlots,
  }
}
