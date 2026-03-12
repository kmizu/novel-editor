import { useState } from 'react'
import { ArrowDownTrayIcon, DocumentTextIcon } from '@heroicons/react/24/outline'
import { useProjectStore } from '../stores/projectStore'
import { api } from '../api/tauri'
import type { ExportSettings, ExportFormat } from '../types'

const DEFAULT_SETTINGS: ExportSettings = {
  format: 'kakuyomu',
  includeChapterNumbers: true,
  includeAuthorNotes: false,
  lineBreakType: 'web',
  rubyFormat: 'html',
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; desc: string; color: string }[] = [
  { value: 'kakuyomu', label: 'カクヨム', desc: '|漢字《ルビ》形式・===区切り', color: 'border-green-400 dark:border-green-600' },
  { value: 'narou',    label: 'なろう',   desc: '|漢字《ルビ》形式・---区切り', color: 'border-orange-400 dark:border-orange-600' },
  { value: 'text',     label: 'テキスト', desc: 'プレーンテキスト',             color: 'border-ash dark:border-ash-dark' },
  { value: 'json',     label: 'バックアップ', desc: '全データJSON（復元可能）', color: 'border-blue-400 dark:border-blue-600' },
]

export function ExportPage() {
  const { activeProject } = useProjectStore()
  const [settings, setSettings] = useState<ExportSettings>(DEFAULT_SETTINGS)
  const [isExporting, setIsExporting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleExport = async () => {
    if (!activeProject) return
    setIsExporting(true)
    setMessage(null)

    try {
      const content = await api.getExportContent(activeProject.id, settings)

      // ダウンロード（Tauri環境ではブラウザのダウンロード機能を使用）
      const ext = settings.format === 'json' ? 'json' : 'txt'
      const filename = `${activeProject.title}_${settings.format}.${ext}`
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)

      setMessage({ type: 'success', text: `「${filename}」をエクスポートしました` })
    } catch (err) {
      setMessage({ type: 'error', text: String(err) })
    } finally {
      setIsExporting(false)
    }
  }

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-ash font-gothic text-sm">プロジェクトを選択してください</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-8 py-8 space-y-8 animate-fade-in">

        {/* ヘッダー */}
        <div>
          <h1 className="font-mincho text-2xl text-ink dark:text-paper tracking-wide">エクスポート</h1>
          <p className="text-sm text-ash font-gothic mt-1">{activeProject.title}</p>
        </div>

        {/* フォーマット選択 */}
        <div className="space-y-3">
          <h2 className="text-xs text-ash font-gothic uppercase tracking-widest">出力形式</h2>
          <div className="grid grid-cols-2 gap-3">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSettings({ ...settings, format: opt.value })}
                className={`
                  card-sumi p-4 text-left border-l-4 transition-all duration-150
                  ${settings.format === opt.value
                    ? `${opt.color} bg-paper-dark dark:bg-night-raised`
                    : 'border-l-transparent hover:bg-paper-dark/50 dark:hover:bg-night-raised/50'
                  }
                `}
              >
                <p className="font-mincho text-sm font-semibold text-ink dark:text-paper">{opt.label}</p>
                <p className="text-xs text-ash font-gothic mt-1">{opt.desc}</p>
              </button>
            ))}
          </div>
        </div>

        {/* オプション */}
        {settings.format !== 'json' && (
          <div className="space-y-3">
            <h2 className="text-xs text-ash font-gothic uppercase tracking-widest">オプション</h2>
            <div className="card-sumi p-4 space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeChapterNumbers}
                  onChange={(e) => setSettings({ ...settings, includeChapterNumbers: e.target.checked })}
                  className="w-4 h-4 accent-vermillion"
                />
                <div>
                  <p className="text-sm text-ink dark:text-paper font-gothic">話数を含める</p>
                  <p className="text-xs text-ash">「第1話　タイトル」形式</p>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.includeAuthorNotes}
                  onChange={(e) => setSettings({ ...settings, includeAuthorNotes: e.target.checked })}
                  className="w-4 h-4 accent-vermillion"
                />
                <div>
                  <p className="text-sm text-ink dark:text-paper font-gothic">各話メモを含める</p>
                  <p className="text-xs text-ash">執筆メモをエクスポートに含める</p>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* エクスポートボタン */}
        <div className="space-y-3">
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="btn-primary w-full py-3 gap-2 font-gothic text-base"
          >
            {isExporting ? (
              <span className="animate-pulse">エクスポート中…</span>
            ) : (
              <>
                <ArrowDownTrayIcon className="w-5 h-5" />
                <span>エクスポート</span>
              </>
            )}
          </button>

          {message && (
            <div className={`
              flex items-start gap-2 p-3 text-sm font-gothic animate-fade-in
              ${message.type === 'success'
                ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                : 'text-vermillion bg-vermillion/5'
              }
            `}>
              <DocumentTextIcon className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{message.text}</span>
            </div>
          )}
        </div>

        {/* プロジェクト概要 */}
        <div className="card-sumi p-4 space-y-2">
          <h2 className="text-xs text-ash font-gothic uppercase tracking-widest">概要</h2>
          <div className="grid grid-cols-2 gap-2 text-sm font-gothic">
            <div>
              <p className="text-ash text-xs">章数</p>
              <p className="text-ink dark:text-paper font-mincho">{activeProject.chapterCount} 話</p>
            </div>
            <div>
              <p className="text-ash text-xs">総文字数</p>
              <p className="text-ink dark:text-paper font-mincho">{activeProject.totalWordCount.toLocaleString()} 字</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
