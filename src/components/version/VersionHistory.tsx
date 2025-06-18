import { useState } from 'react'
import { Version } from '../../types/version'
import {
  ClockIcon,
  TagIcon,
  TrashIcon,
  ArrowPathIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/24/outline'

interface VersionHistoryProps {
  versions: Version[]
  currentVersionId?: string
  onRestore: (versionId: string) => void
  onCompare: (versionId1: string, versionId2: string) => void
  onDelete: (versionId: string) => void
  onAddTag: (versionId: string, tag: string) => void
  onRemoveTag: (versionId: string, tag: string) => void
}

export default function VersionHistory({
  versions,
  currentVersionId,
  onRestore,
  onCompare,
  onDelete,
  onAddTag,
  onRemoveTag,
}: VersionHistoryProps) {
  const [selectedVersions, setSelectedVersions] = useState<string[]>([])
  const [tagInput, setTagInput] = useState<{ [key: string]: string }>({})

  const toggleVersionSelection = (versionId: string) => {
    setSelectedVersions(
      (prev) =>
        prev.includes(versionId)
          ? prev.filter((id) => id !== versionId)
          : [...prev, versionId].slice(-2) // 最大2つまで選択
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))

    if (hours < 1) {
      const minutes = Math.floor(diff / (1000 * 60))
      return `${minutes}分前`
    } else if (hours < 24) {
      return `${hours}時間前`
    } else {
      return date.toLocaleDateString('ja-JP', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold mb-2">バージョン履歴</h3>
        {selectedVersions.length === 2 && (
          <button
            onClick={() => onCompare(selectedVersions[0], selectedVersions[1])}
            className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center"
          >
            <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
            選択したバージョンを比較
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200">
          {versions.map((version) => (
            <div
              key={version.id}
              className={`p-4 hover:bg-gray-50 ${
                version.id === currentVersionId ? 'bg-blue-50' : ''
              } ${selectedVersions.includes(version.id) ? 'bg-yellow-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <input
                      type="checkbox"
                      checked={selectedVersions.includes(version.id)}
                      onChange={() => toggleVersionSelection(version.id)}
                      className="rounded"
                    />
                    <ClockIcon className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600">{formatDate(version.createdAt)}</span>
                    {version.id === currentVersionId && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        現在
                      </span>
                    )}
                  </div>

                  {version.message && <p className="text-sm font-medium mb-1">{version.message}</p>}

                  {version.diff && (
                    <div className="text-xs text-gray-500 mb-2">
                      <span className="text-green-600">+{version.diff.additions}</span>
                      {' / '}
                      <span className="text-red-600">-{version.diff.deletions}</span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1 mb-2">
                    {version.tags?.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded"
                      >
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => onRemoveTag(version.id, tag)}
                          className="ml-1 text-gray-500 hover:text-red-600"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      placeholder="タグを追加"
                      value={tagInput[version.id] || ''}
                      onChange={(e) => setTagInput({ ...tagInput, [version.id]: e.target.value })}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && tagInput[version.id]) {
                          onAddTag(version.id, tagInput[version.id])
                          setTagInput({ ...tagInput, [version.id]: '' })
                        }
                      }}
                      className="text-xs px-2 py-1 border rounded flex-1"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  {version.id !== currentVersionId && (
                    <button
                      onClick={() => onRestore(version.id)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="このバージョンを復元"
                    >
                      <ArrowPathIcon className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(version.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="削除"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
