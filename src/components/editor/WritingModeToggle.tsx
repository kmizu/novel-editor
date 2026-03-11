import type { WritingMode, FontStyle } from '../../types'
import { useSettingsStore } from '../../stores/settingsStore'

/**
 * 縦書き/横書き切り替えボタン
 */
export function WritingModeToggle() {
  const { editorSettings, setEditorSettings } = useSettingsStore()
  const { writingMode, fontStyle } = editorSettings

  const toggleMode = () => {
    setEditorSettings({
      writingMode: (writingMode === 'horizontal' ? 'vertical' : 'horizontal') satisfies WritingMode,
    })
  }

  const toggleFont = () => {
    setEditorSettings({
      fontStyle: (fontStyle === 'mincho' ? 'gothic' : 'mincho') satisfies FontStyle,
    })
  }

  return (
    <div className="flex items-center gap-1">
      {/* 縦書き/横書き */}
      <button
        onClick={toggleMode}
        className="
          btn-ghost px-2 py-1 text-xs gap-1.5
          border border-paper-darker dark:border-night-border
        "
        title={writingMode === 'horizontal' ? '縦書きに切り替え' : '横書きに切り替え'}
        aria-label={writingMode === 'horizontal' ? '縦書きに切り替え' : '横書きに切り替え'}
      >
        {writingMode === 'horizontal' ? (
          // 横書きアイコン（横線）
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-current">
            <line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="2" y1="12" x2="10" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        ) : (
          // 縦書きアイコン（縦線）
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-current">
            <line x1="12" y1="2" x2="12" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="8" y1="2" x2="8" y2="14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="4" y1="2" x2="4" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        )}
        <span className="font-gothic hidden sm:inline">
          {writingMode === 'horizontal' ? '縦書き' : '横書き'}
        </span>
      </button>

      {/* フォント切り替え */}
      <button
        onClick={toggleFont}
        className="
          btn-ghost px-2 py-1 text-xs
          border border-paper-darker dark:border-night-border
        "
        title={fontStyle === 'mincho' ? 'ゴシック体に切り替え' : '明朝体に切り替え'}
      >
        <span className={fontStyle === 'mincho' ? 'font-mincho' : 'font-gothic'}>
          {fontStyle === 'mincho' ? '明朝' : 'ゴシック'}
        </span>
      </button>
    </div>
  )
}
