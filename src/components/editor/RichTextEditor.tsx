import { useState, useRef, useEffect } from 'react'
import {
  LinkIcon,
  ListBulletIcon,
  ArrowUturnLeftIcon,
  ArrowUturnRightIcon,
  CodeBracketIcon,
} from '@heroicons/react/24/outline'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  className?: string
}

export function RichTextEditor({
  content,
  onChange,
  className = '',
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [selection, setSelection] = useState<Range | null>(null)
  const [history, setHistory] = useState<string[]>([content])
  const [historyIndex, setHistoryIndex] = useState(0)

  // コンテンツの初期設定
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content
    }
  }, [content])

  // フォーマットコマンドの実行
  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    handleContentChange()
  }

  // コンテンツ変更のハンドリング
  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML
      onChange(newContent)
      
      // 履歴に追加
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push(newContent)
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    }
  }

  // リンクの挿入
  const insertLink = () => {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      setSelection(sel.getRangeAt(0))
      setIsLinkDialogOpen(true)
    }
  }

  // リンクの適用
  const applyLink = () => {
    if (selection && linkUrl) {
      const sel = window.getSelection()
      if (sel) {
        sel.removeAllRanges()
        sel.addRange(selection)
        execCommand('createLink', linkUrl)
      }
    }
    setIsLinkDialogOpen(false)
    setLinkUrl('')
    setSelection(null)
  }

  // 元に戻す
  const undo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1
      setHistoryIndex(newIndex)
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex]
        onChange(history[newIndex])
      }
    }
  }

  // やり直す
  const redo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1
      setHistoryIndex(newIndex)
      if (editorRef.current) {
        editorRef.current.innerHTML = history[newIndex]
        onChange(history[newIndex])
      }
    }
  }

  // ツールバーボタン
  const ToolbarButton = ({
    onClick,
    children,
    title,
    active = false,
  }: {
    onClick: () => void
    children: React.ReactNode
    title: string
    active?: boolean
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
        active ? 'bg-gray-200 dark:bg-gray-600' : ''
      }`}
      type="button"
    >
      {children}
    </button>
  )

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden ${className}`}>
      {/* ツールバー */}
      <div className="flex items-center flex-wrap gap-1 p-2 border-b border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={undo} title="元に戻す (Ctrl+Z)">
            <ArrowUturnLeftIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton onClick={redo} title="やり直す (Ctrl+Y)">
            <ArrowUturnRightIcon className="h-5 w-5" />
          </ToolbarButton>
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={() => execCommand('bold')} title="太字 (Ctrl+B)">
            <BoldIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('italic')} title="斜体 (Ctrl+I)">
            <ItalicIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('underline')} title="下線 (Ctrl+U)">
            <UnderlineIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('strikeThrough')} title="取り消し線">
            <StrikethroughIcon className="h-5 w-5" />
          </ToolbarButton>
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <div className="flex items-center gap-1">
          <ToolbarButton onClick={insertLink} title="リンク">
            <LinkIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('insertUnorderedList')} title="箇条書き">
            <ListBulletIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('insertOrderedList')} title="番号付きリスト">
            <ListNumberedIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('formatBlock', '<blockquote>')} title="引用">
            <QuoteIcon className="h-5 w-5" />
          </ToolbarButton>
          <ToolbarButton onClick={() => execCommand('formatBlock', '<pre>')} title="コード">
            <CodeBracketIcon className="h-5 w-5" />
          </ToolbarButton>
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
        
        <div className="flex items-center gap-2">
          <select
            onChange={(e) => execCommand('formatBlock', e.target.value)}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-700"
            defaultValue=""
          >
            <option value="" disabled>段落スタイル</option>
            <option value="<p>">本文</option>
            <option value="<h1>">見出し1</option>
            <option value="<h2>">見出し2</option>
            <option value="<h3>">見出し3</option>
          </select>
        </div>
      </div>

      {/* エディタ本体 */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        className="min-h-[400px] p-4 focus:outline-none prose prose-sm dark:prose-invert max-w-none"
        style={{ minHeight: '400px' }}
        dangerouslySetInnerHTML={{ __html: content }}
      />

      {/* リンクダイアログ */}
      {isLinkDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-lg font-medium mb-4">リンクを挿入</h3>
            <input
              type="url"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              placeholder="URLを入力"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md mb-4 dark:bg-gray-700"
              autoFocus
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsLinkDialogOpen(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              >
                キャンセル
              </button>
              <button
                onClick={applyLink}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                挿入
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// カスタムアイコンコンポーネント
function BoldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6v0m0 0h8a4 4 0 014 4 4 4 0 01-4 4H6v0m0-16v16" />
    </svg>
  )
}

function ItalicIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4m0 16h-4m4-16l-4 16" />
    </svg>
  )
}

function UnderlineIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v8a5 5 0 0010 0V4M5 20h14" />
    </svg>
  )
}

function StrikethroughIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12h12M12 12H0m12 0c-2.5 0-4.5 1.5-4.5 3.5S9.5 19 12 19s4.5-1.5 4.5-3.5S14.5 12 12 12zm0 0c2.5 0 4.5-1.5 4.5-3.5S14.5 5 12 5 7.5 6.5 7.5 8.5 9.5 12 12 12z" />
    </svg>
  )
}

function ListNumberedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 6h13M7 12h13m-13 6h13M3 6h.01M3 12h.01M3 18h.01" />
    </svg>
  )
}

function QuoteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}