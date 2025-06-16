import { memo } from 'react'

interface TextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export const TextEditor = memo(function TextEditor({
  content,
  onChange,
  placeholder = '本文を入力してください...',
  className = '',
}: TextEditorProps) {
  return (
    <div className="relative h-full">
      <textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`
          w-full h-full p-4 resize-none 
          text-gray-900 dark:text-white
          bg-white dark:bg-gray-800
          border border-gray-300 dark:border-gray-600 
          rounded-lg focus:ring-2 focus:ring-indigo-500 
          focus:border-transparent
          scrollbar-thin
          ${className}
        `}
        style={{ minHeight: '500px' }}
      />
    </div>
  )
})
