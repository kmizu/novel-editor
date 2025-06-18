import { useState } from 'react'
import { WritingTemplate, TemplateGenre } from '../../types/template'
import {
  DocumentTextIcon,
  SparklesIcon,
  BookOpenIcon,
  CheckIcon,
} from '@heroicons/react/24/outline'

interface TemplateSelectorProps {
  templates: WritingTemplate[]
  onSelect: (template: WritingTemplate) => void
  onCancel: () => void
}

export default function TemplateSelector({ templates, onSelect, onCancel }: TemplateSelectorProps) {
  const [selectedGenre, setSelectedGenre] = useState<TemplateGenre | 'all'>('all')
  const [selectedTemplate, setSelectedTemplate] = useState<WritingTemplate | null>(null)

  const genres: Array<{ value: TemplateGenre | 'all'; label: string }> = [
    { value: 'all', label: 'すべて' },
    { value: 'fantasy', label: 'ファンタジー' },
    { value: 'scifi', label: 'SF' },
    { value: 'mystery', label: 'ミステリー' },
    { value: 'romance', label: '恋愛' },
    { value: 'horror', label: 'ホラー' },
    { value: 'historical', label: '歴史' },
    { value: 'contemporary', label: '現代' },
    { value: 'lightnovel', label: 'ライトノベル' },
    { value: 'general', label: '一般' },
  ]

  const filteredTemplates = templates.filter(
    (template) => selectedGenre === 'all' || template.genre === selectedGenre
  )

  const getCategoryIcon = (category: WritingTemplate['category']) => {
    switch (category) {
      case 'complete':
        return <SparklesIcon className="w-5 h-5" />
      case 'plot':
        return <BookOpenIcon className="w-5 h-5" />
      default:
        return <DocumentTextIcon className="w-5 h-5" />
    }
  }

  const getCategoryLabel = (category: WritingTemplate['category']) => {
    const labels = {
      complete: '完全テンプレート',
      project: 'プロジェクト',
      plot: 'プロット',
      chapter: '章構成',
      character: 'キャラクター',
      world: '世界観',
    }
    return labels[category]
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">テンプレートを選択</h2>
          <p className="text-gray-600">プロジェクトのベースとなるテンプレートを選択してください</p>
        </div>

        <div className="p-6">
          {/* ジャンルフィルター */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">ジャンル</label>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => (
                <button
                  key={genre.value}
                  onClick={() => setSelectedGenre(genre.value)}
                  className={`px-4 py-2 rounded-lg text-sm ${
                    selectedGenre === genre.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {genre.label}
                </button>
              ))}
            </div>
          </div>

          {/* テンプレート一覧 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                onClick={() => setSelectedTemplate(template)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center">
                    {getCategoryIcon(template.category)}
                    <h3 className="ml-2 font-semibold text-gray-900">{template.name}</h3>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <CheckIcon className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                    {getCategoryLabel(template.category)}
                  </span>
                  {template.isBuiltIn && (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded">
                      組み込み
                    </span>
                  )}
                </div>
                {template.description && (
                  <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                )}
                {template.tags && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <p className="text-center text-gray-500 py-8">該当するテンプレートがありません</p>
          )}
        </div>

        {/* アクション */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={onCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            キャンセル
          </button>
          <div className="flex gap-3">
            <button
              onClick={() => onSelect({ id: 'blank' } as WritingTemplate)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              空のプロジェクト
            </button>
            <button
              onClick={() => selectedTemplate && onSelect(selectedTemplate)}
              disabled={!selectedTemplate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300"
            >
              このテンプレートを使用
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
