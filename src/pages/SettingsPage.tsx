import { useSettingsStore } from '../stores/settingsStore'
import type { WritingMode, FontStyle } from '../types'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'

const WRITING_MODE_OPTIONS: { value: WritingMode; label: string; desc: string }[] = [
  { value: 'horizontal', label: '横書き', desc: '左から右へ、上から下へ' },
  { value: 'vertical', label: '縦書き', desc: '右から左へ（日本語伝統組版）' },
]

const FONT_STYLE_OPTIONS: { value: FontStyle; label: string; desc: string }[] = [
  { value: 'mincho', label: '明朝体', desc: 'Shippori Mincho — 小説向け' },
  { value: 'gothic', label: 'ゴシック体', desc: 'Zen Kaku Gothic — 読みやすい' },
]

function OptionCard<T extends string>({
  value,
  current,
  label,
  desc,
  onClick,
}: {
  value: T
  current: T
  label: string
  desc: string
  onClick: () => void
}) {
  const isActive = value === current
  return (
    <button
      onClick={onClick}
      className={`
        card-sumi p-4 text-left border-l-4 transition-all duration-150 w-full
        ${isActive
          ? 'border-l-vermillion bg-paper-dark dark:bg-night-raised'
          : 'border-l-transparent hover:bg-paper-dark/50 dark:hover:bg-night-raised/50'
        }
      `}
    >
      <p className="font-mincho text-sm font-semibold text-ink dark:text-paper">{label}</p>
      <p className="text-xs text-ash font-gothic mt-0.5">{desc}</p>
    </button>
  )
}

export function SettingsPage() {
  const { theme, toggleTheme, editorSettings, setEditorSettings } = useSettingsStore()

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-8 space-y-8 animate-fade-in">

        {/* ヘッダー */}
        <div>
          <h1 className="font-mincho text-2xl text-ink dark:text-paper tracking-wide">設定</h1>
          <p className="text-sm text-ash font-gothic mt-1">エディタの表示とテーマを変更できます</p>
        </div>

        {/* テーマ */}
        <div className="space-y-3">
          <h2 className="text-xs text-ash font-gothic uppercase tracking-widest">テーマ</h2>
          <button
            onClick={toggleTheme}
            className="card-sumi p-4 flex items-center justify-between w-full hover:bg-paper-dark/50 dark:hover:bg-night-raised/50 transition-colors"
          >
            <div>
              <p className="font-mincho text-sm text-ink dark:text-paper font-semibold">
                {theme === 'light' ? 'ライトモード' : 'ダークモード'}
              </p>
              <p className="text-xs text-ash font-gothic mt-0.5">
                {theme === 'light' ? '明るい背景（昼間の執筆に）' : '暗い背景（夜間の執筆に）'}
              </p>
            </div>
            <div className="w-9 h-9 flex items-center justify-center text-ash">
              {theme === 'light' ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </div>
          </button>
        </div>

        {/* 書字方向 */}
        <div className="space-y-3">
          <h2 className="text-xs text-ash font-gothic uppercase tracking-widest">デフォルト書字方向</h2>
          <div className="grid grid-cols-2 gap-3">
            {WRITING_MODE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                value={opt.value}
                current={editorSettings.writingMode}
                label={opt.label}
                desc={opt.desc}
                onClick={() => setEditorSettings({ writingMode: opt.value })}
              />
            ))}
          </div>
        </div>

        {/* フォント */}
        <div className="space-y-3">
          <h2 className="text-xs text-ash font-gothic uppercase tracking-widest">フォント</h2>
          <div className="grid grid-cols-2 gap-3">
            {FONT_STYLE_OPTIONS.map((opt) => (
              <OptionCard
                key={opt.value}
                value={opt.value}
                current={editorSettings.fontStyle}
                label={opt.label}
                desc={opt.desc}
                onClick={() => setEditorSettings({ fontStyle: opt.value })}
              />
            ))}
          </div>
        </div>

        {/* フォントサイズ */}
        <div className="space-y-3">
          <h2 className="text-xs text-ash font-gothic uppercase tracking-widest">フォントサイズ</h2>
          <div className="card-sumi p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink dark:text-paper font-gothic">
                {editorSettings.fontSize}px
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditorSettings({ fontSize: Math.max(12, editorSettings.fontSize - 2) })}
                  className="btn-ghost w-8 h-8 flex items-center justify-center text-lg"
                  disabled={editorSettings.fontSize <= 12}
                >
                  −
                </button>
                <button
                  onClick={() => setEditorSettings({ fontSize: Math.min(32, editorSettings.fontSize + 2) })}
                  className="btn-ghost w-8 h-8 flex items-center justify-center text-lg"
                  disabled={editorSettings.fontSize >= 32}
                >
                  ＋
                </button>
              </div>
            </div>
            <input
              type="range"
              min="12"
              max="32"
              step="2"
              value={editorSettings.fontSize}
              onChange={(e) => setEditorSettings({ fontSize: Number(e.target.value) })}
              className="w-full accent-vermillion"
            />
            <div className="flex justify-between text-xs text-ash font-gothic">
              <span>小 (12px)</span>
              <span>大 (32px)</span>
            </div>
          </div>
        </div>

        {/* 行間 */}
        <div className="space-y-3">
          <h2 className="text-xs text-ash font-gothic uppercase tracking-widest">行間</h2>
          <div className="card-sumi p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink dark:text-paper font-gothic">
                {editorSettings.lineHeight.toFixed(1)}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditorSettings({ lineHeight: Math.max(1.4, Number((editorSettings.lineHeight - 0.2).toFixed(1))) })}
                  className="btn-ghost w-8 h-8 flex items-center justify-center text-lg"
                  disabled={editorSettings.lineHeight <= 1.4}
                >
                  −
                </button>
                <button
                  onClick={() => setEditorSettings({ lineHeight: Math.min(3.0, Number((editorSettings.lineHeight + 0.2).toFixed(1))) })}
                  className="btn-ghost w-8 h-8 flex items-center justify-center text-lg"
                  disabled={editorSettings.lineHeight >= 3.0}
                >
                  ＋
                </button>
              </div>
            </div>
            <input
              type="range"
              min="14"
              max="30"
              step="2"
              value={Math.round(editorSettings.lineHeight * 10)}
              onChange={(e) => setEditorSettings({ lineHeight: Number(e.target.value) / 10 })}
              className="w-full accent-vermillion"
            />
            <div className="flex justify-between text-xs text-ash font-gothic">
              <span>狭い (1.4)</span>
              <span>広い (3.0)</span>
            </div>
          </div>
        </div>

        {/* プレビュー */}
        <div className="space-y-3">
          <h2 className="text-xs text-ash font-gothic uppercase tracking-widest">プレビュー</h2>
          <div
            className="card-sumi p-6 text-ink dark:text-paper"
            style={{
              fontFamily: editorSettings.fontStyle === 'mincho'
                ? "'Shippori Mincho', '游明朝', serif"
                : "'Zen Kaku Gothic New', '游ゴシック', sans-serif",
              fontSize: `${editorSettings.fontSize}px`,
              lineHeight: editorSettings.lineHeight,
            }}
          >
            <p>吾輩は猫である。名前はまだない。</p>
            <p>どこで生れたかとんと見当がつかぬ。</p>
            <p>何でも薄暗いじめじめした所でニャーニャー泣いていた事だけは記憶している。</p>
          </div>
        </div>

        {/* リセット */}
        <div className="pt-4 border-t border-paper-dark dark:border-night-raised">
          <button
            onClick={() => setEditorSettings({ writingMode: 'horizontal', fontStyle: 'mincho', fontSize: 18, lineHeight: 2.0 })}
            className="text-xs text-ash font-gothic hover:text-vermillion transition-colors"
          >
            設定をデフォルトに戻す
          </button>
        </div>

      </div>
    </div>
  )
}
