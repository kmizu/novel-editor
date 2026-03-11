import { memo, useRef, useCallback } from 'react'
import { useSettingsStore } from '../../stores/settingsStore'

interface WritingEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

/**
 * 縦書き/横書き切り替え対応のメインエディタ
 * textarea ベースで IME 互換性を最大化
 */
export const WritingEditor = memo(function WritingEditor({
  content,
  onChange,
  placeholder = '本文を入力してください…',
}: WritingEditorProps) {
  const { editorSettings } = useSettingsStore()
  const { writingMode, fontStyle, fontSize, lineHeight } = editorSettings
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value)
    },
    [onChange]
  )

  // ルビ入力ショートカット: 選択テキストを |text《》 に変換 (Ctrl+R / Cmd+R)
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault()
        const el = textareaRef.current
        if (!el) return

        const { selectionStart, selectionEnd, value } = el
        const selected = value.slice(selectionStart, selectionEnd)

        if (selected.length === 0) return

        const rubyTemplate = `|${selected}《》`
        const newValue =
          value.slice(0, selectionStart) + rubyTemplate + value.slice(selectionEnd)
        onChange(newValue)

        // カーソルを《》の内側に配置
        const cursorPos = selectionStart + selected.length + 2 // |text《 の後
        requestAnimationFrame(() => {
          el.setSelectionRange(cursorPos, cursorPos)
          el.focus()
        })
      }
    },
    [onChange]
  )

  const fontClass = fontStyle === 'mincho' ? 'font-mincho' : 'font-gothic'

  const verticalStyle: React.CSSProperties =
    writingMode === 'vertical'
      ? {
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
            WebkitTextOrientation: 'mixed',
          fontFeatureSettings: '"vert" 1, "vrt2" 1',
          overflowX: 'auto',
          overflowY: 'hidden',
          height: '100%',
          minWidth: '100%',
          lineHeight,
          fontSize: `${fontSize}px`,
          letterSpacing: '0.08em',
        }
      : {
          writingMode: 'horizontal-tb',
          overflowY: 'auto',
          overflowX: 'hidden',
          width: '100%',
          lineHeight,
          fontSize: `${fontSize}px`,
          letterSpacing: '0.02em',
        }

  return (
    <div
      className={`
        relative flex-1 overflow-hidden
        ${writingMode === 'vertical' ? 'h-full' : 'h-full flex flex-col'}
      `}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`
          writing-area ${fontClass}
          p-8 md:p-12
          text-ink dark:text-paper
          placeholder-ash/40 dark:placeholder-ash-dark/40
        `}
        style={verticalStyle}
        aria-label="本文エディタ"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    </div>
  )
})
