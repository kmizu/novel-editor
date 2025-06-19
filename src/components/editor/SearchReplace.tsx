import { useState, useEffect, useRef } from 'react'
import { XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

interface SearchReplaceProps {
  text: string
  onReplace: (newText: string) => void
  isOpen: boolean
  onClose: () => void
  mode: 'search' | 'replace'
}

export function SearchReplace({ text, onReplace, isOpen, onClose, mode }: SearchReplaceProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [replaceTerm, setReplaceTerm] = useState('')
  const [caseSensitive, setCaseSensitive] = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const [currentMatch] = useState(0) // 将来的な実装のための変数
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (searchTerm) {
      const flags = caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
      const matches = text.match(regex)
      setMatchCount(matches ? matches.length : 0)
    } else {
      setMatchCount(0)
    }
  }, [searchTerm, text, caseSensitive])

  const handleReplace = () => {
    if (searchTerm && mode === 'replace') {
      const flags = caseSensitive ? 'g' : 'gi'
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
      const newText = text.replace(regex, replaceTerm)
      onReplace(newText)
      setMatchCount(0)
    }
  }

  const handleReplaceOne = () => {
    if (searchTerm && mode === 'replace') {
      const flags = caseSensitive ? '' : 'i'
      const regex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), flags)
      const newText = text.replace(regex, replaceTerm)
      onReplace(newText)
      
      // 再計算
      const newFlags = caseSensitive ? 'g' : 'gi'
      const newRegex = new RegExp(searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), newFlags)
      const matches = newText.match(newRegex)
      setMatchCount(matches ? matches.length : 0)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    } else if (e.key === 'Enter' && mode === 'search') {
      // 次の検索結果へ（将来的に実装）
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed top-20 right-4 z-40 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center">
            <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
            {mode === 'search' ? '検索' : '検索と置換'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            aria-label="閉じる"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="検索する文字列"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {matchCount > 0 && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {matchCount} 件の一致
              </p>
            )}
          </div>

          {mode === 'replace' && (
            <div>
              <input
                type="text"
                value={replaceTerm}
                onChange={(e) => setReplaceTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="置換する文字列"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          )}

          <div className="flex items-center space-x-4">
            <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="mr-2 rounded text-blue-600 focus:ring-blue-500"
              />
              大文字と小文字を区別
            </label>
          </div>

          {mode === 'replace' && (
            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={handleReplaceOne}
                disabled={!searchTerm || matchCount === 0}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                置換
              </button>
              <button
                onClick={handleReplace}
                disabled={!searchTerm || matchCount === 0}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                すべて置換
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}