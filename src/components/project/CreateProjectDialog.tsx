import { useState, Fragment, useEffect } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { Project } from '../../types/project'
import { WritingTemplate } from '../../types/template'

interface CreateProjectDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (
    projectData: Omit<
      Project,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'chapters'
      | 'characters'
      | 'plots'
      | 'worldSettings'
      | 'memos'
      | 'exportSettings'
    >
  ) => void
  template?: WritingTemplate | null
}

export default function CreateProjectDialog({
  isOpen,
  onClose,
  onCreate,
  template,
}: CreateProjectDialogProps) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [description, setDescription] = useState('')
  const [synopsis, setSynopsis] = useState('')
  const [genre, setGenre] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')

  // テンプレートが選択されている場合、初期値を設定
  useEffect(() => {
    if (template && template.id !== 'blank' && template.projectTemplate) {
      const pt = template.projectTemplate
      if (pt.title) setTitle(pt.title)
      if (pt.genre) setGenre(pt.genre)
      if (pt.synopsis) setSynopsis(pt.synopsis)
      if (pt.keywords) setTags(pt.keywords)

      // テンプレート名から説明を生成
      if (template.name && !description) {
        setDescription(`${template.name}テンプレートを使用したプロジェクト`)
      }
    }
  }, [template, description])

  const handleSubmit = () => {
    if (title.trim() && author.trim()) {
      onCreate({
        title: title.trim(),
        author: author.trim(),
        description: description.trim(),
        synopsis: synopsis.trim(),
        genre: genre.trim(),
        tags,
        status: 'draft',
      })
      // フォームをリセット
      setTitle('')
      setAuthor('')
      setDescription('')
      setSynopsis('')
      setGenre('')
      setTags([])
      setTagInput('')
    }
  }

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim()
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="div" className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    新規プロジェクト作成
                  </h3>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      タイトル <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="作品のタイトル"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      著者名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="あなたのペンネーム"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="作品の簡単な説明"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ジャンル</label>
                    <input
                      type="text"
                      value={genre}
                      onChange={(e) => setGenre(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="ファンタジー、SF、恋愛など"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">あらすじ</label>
                    <textarea
                      value={synopsis}
                      onChange={(e) => setSynopsis(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="作品の概要を簡潔に"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="タグを入力してEnter"
                      />
                      <button
                        onClick={handleAddTag}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                      >
                        追加
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700"
                        >
                          {tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    onClick={onClose}
                  >
                    キャンセル
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSubmit}
                    disabled={!title.trim() || !author.trim()}
                  >
                    作成
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
