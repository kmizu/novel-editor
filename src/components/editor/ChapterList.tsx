import React, { useState } from 'react'
import { Chapter } from '../../types/project'
import { Bars3Icon, PencilIcon, TrashIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ChapterListProps {
  chapters: Chapter[]
  selectedChapterId: string
  onSelectChapter: (chapterId: string) => void
  onUpdateChapter: (chapterId: string, updates: Partial<Chapter>) => void
  onDeleteChapter: (chapterId: string) => void
  onReorderChapters: (chapters: Chapter[]) => void
}

export default function ChapterList({
  chapters,
  selectedChapterId,
  onSelectChapter,
  onUpdateChapter,
  onDeleteChapter,
  onReorderChapters,
}: ChapterListProps) {
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [draggedChapter, setDraggedChapter] = useState<Chapter | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const handleStartEdit = (chapter: Chapter) => {
    setEditingChapterId(chapter.id)
    setEditingTitle(chapter.title)
  }

  const handleSaveEdit = (chapterId: string) => {
    if (editingTitle.trim()) {
      onUpdateChapter(chapterId, { title: editingTitle.trim() })
      setEditingChapterId(null)
      setEditingTitle('')
    }
  }

  const handleCancelEdit = () => {
    setEditingChapterId(null)
    setEditingTitle('')
  }

  const handleDragStart = (e: React.DragEvent, chapter: Chapter) => {
    setDraggedChapter(chapter)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverIndex(index)
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()

    if (!draggedChapter) return

    const newChapters = [...chapters]
    const draggedIndex = chapters.findIndex((ch) => ch.id === draggedChapter.id)

    if (draggedIndex === dropIndex) {
      setDraggedChapter(null)
      setDragOverIndex(null)
      return
    }

    // Remove dragged chapter
    newChapters.splice(draggedIndex, 1)

    // Insert at new position
    newChapters.splice(dropIndex, 0, draggedChapter)

    // Update order numbers
    const reorderedChapters = newChapters.map((chapter, index) => ({
      ...chapter,
      order: index,
    }))

    onReorderChapters(reorderedChapters)
    setDraggedChapter(null)
    setDragOverIndex(null)
  }

  const handleDelete = (chapterId: string) => {
    if (window.confirm('この章を削除してもよろしいですか？')) {
      onDeleteChapter(chapterId)
    }
  }

  return (
    <div className="space-y-2">
      {chapters.map((chapter, index) => (
        <div
          key={chapter.id}
          className={`
            flex items-center space-x-2 p-2 rounded cursor-pointer group
            ${selectedChapterId === chapter.id ? 'bg-blue-50 border border-blue-300' : 'bg-gray-50 hover:bg-gray-100'}
            ${dragOverIndex === index ? 'border-t-2 border-blue-500' : ''}
          `}
          onClick={() => onSelectChapter(chapter.id)}
          draggable
          onDragStart={(e) => handleDragStart(e, chapter)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
        >
          <Bars3Icon className="w-4 h-4 text-gray-400 cursor-move" />

          <div className="flex-1">
            {editingChapterId === chapter.id ? (
              <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={editingTitle}
                  onChange={(e) => setEditingTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(chapter.id)}
                  className="flex-1 px-2 py-1 border rounded text-sm"
                  autoFocus
                />
                <button
                  onClick={() => handleSaveEdit(chapter.id)}
                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                >
                  <CheckIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  第{chapter.order + 1}章: {chapter.title}
                </span>
                <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => handleStartEdit(chapter)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(chapter.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {chapter.wordCount > 0 && (
            <span className="text-xs text-gray-500">{chapter.wordCount.toLocaleString()}文字</span>
          )}
        </div>
      ))}
    </div>
  )
}
