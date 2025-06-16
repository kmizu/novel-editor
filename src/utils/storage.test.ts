import { describe, it, expect, beforeEach, vi } from 'vitest'
import { StorageManager, StorageKeys } from './storage'

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

describe('StorageManager', () => {
  beforeEach(() => {
    // localStorageのモックを実際の動作に近いものに置き換え
    const localStorageMock = createLocalStorageMock()
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
      writable: true,
    })
    vi.clearAllMocks()
  })

  describe('get', () => {
    it('should return parsed data from localStorage', () => {
      const testData = { id: '1', name: 'Test' }
      localStorage.setItem('test_key', JSON.stringify(testData))

      const result = StorageManager.get('test_key')
      expect(result).toEqual(testData)
    })

    it('should return null if key does not exist', () => {
      const result = StorageManager.get('non_existent_key')
      expect(result).toBeNull()
    })

    it('should return null if data is invalid JSON', () => {
      localStorage.setItem('invalid_key', 'invalid json')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      const result = StorageManager.get('invalid_key')
      expect(result).toBeNull()
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('set', () => {
    it('should save data to localStorage', () => {
      const testData = { id: '1', name: 'Test' }
      const result = StorageManager.set('test_key', testData)

      expect(result).toBe(true)
      expect(localStorage.getItem('test_key')).toBe(JSON.stringify(testData))
    })

    it('should handle circular references gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      const circularObj: Record<string, unknown> = { a: 1 }
      circularObj.circular = circularObj

      const result = StorageManager.set('circular_key', circularObj)
      expect(result).toBe(false)
      expect(consoleSpy).toHaveBeenCalled()

      consoleSpy.mockRestore()
    })
  })

  describe('remove', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('test_key', 'test_value')
      const result = StorageManager.remove('test_key')

      expect(result).toBe(true)
      expect(localStorage.getItem('test_key')).toBeNull()
    })
  })

  describe('clear', () => {
    it('should clear all app-specific keys from localStorage', () => {
      Object.values(StorageKeys).forEach((key) => {
        localStorage.setItem(key, 'test_value')
      })
      localStorage.setItem('other_key', 'should_remain')

      const result = StorageManager.clear()

      expect(result).toBe(true)
      Object.values(StorageKeys).forEach((key) => {
        expect(localStorage.getItem(key)).toBeNull()
      })
      expect(localStorage.getItem('other_key')).toBe('should_remain')
    })
  })

  describe('getStorageSize', () => {
    it('should calculate total size of app data', () => {
      StorageManager.set(StorageKeys.PROJECTS, { test: 'data' })
      StorageManager.set(StorageKeys.CHAPTERS, ['chapter1', 'chapter2'])

      const size = StorageManager.getStorageSize()
      expect(size).toBeGreaterThan(0)
    })
  })

  describe('exportAllData', () => {
    it('should export all app data', () => {
      const projectsData = [{ id: '1', title: 'Test Project' }]
      const chaptersData = [{ id: '1', content: 'Test Chapter' }]

      StorageManager.set(StorageKeys.PROJECTS, projectsData)
      StorageManager.set(StorageKeys.CHAPTERS, chaptersData)

      const exportedData = StorageManager.exportAllData()

      expect(exportedData.PROJECTS).toEqual(projectsData)
      expect(exportedData.CHAPTERS).toEqual(chaptersData)
    })
  })

  describe('importAllData', () => {
    it('should import all data correctly', () => {
      const dataToImport = {
        PROJECTS: [{ id: '1', title: 'Imported Project' }],
        CHAPTERS: [{ id: '1', content: 'Imported Chapter' }],
      }

      const result = StorageManager.importAllData(dataToImport)

      expect(result).toBe(true)
      expect(StorageManager.get(StorageKeys.PROJECTS)).toEqual(dataToImport.PROJECTS)
      expect(StorageManager.get(StorageKeys.CHAPTERS)).toEqual(dataToImport.CHAPTERS)
    })
  })
})
