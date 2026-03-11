import { useMemo } from 'react'
import { parseRuby } from '../../utils/ruby'

interface NovelPreviewProps {
  content: string
  title?: string
  className?: string
}

/**
 * 縦書きプレビューパネル
 * ルビ記法を <ruby> タグに変換してレンダリング
 * XSS対策: parseRuby 内でルビ部分をエスケープ済み、本文は textContent で扱う
 */
export function NovelPreview({ content, title, className = '' }: NovelPreviewProps) {
  const html = useMemo(() => {
    if (!content) return ''
    // 段落ごとに分割してレンダリング
    const paragraphs = content.split('\n')
    return paragraphs
      .map((para) => {
        if (para.trim() === '') return '<p class="empty-line">\u3000</p>'
        // ルビ変換後の本文は textContent ではなく parse済みHTMLなので
        // 本文テキスト部分のエスケープが必要
        const escaped = para
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
        // ルビ記法を変換（ルビ部分のみ <ruby> タグを挿入）
        const withRuby = parseRuby(escaped)
        return `<p>${withRuby}</p>`
      })
      .join('')
  }, [content])

  return (
    <div
      className={`
        flex flex-col h-full
        bg-paper dark:bg-night-surface
        border-l border-paper-darker dark:border-night-border
        ${className}
      `}
    >
      {/* プレビューヘッダー */}
      <div className="
        px-4 py-2 flex items-center gap-2
        border-b border-paper-darker dark:border-night-border
        shrink-0
      ">
        <span className="text-xs text-ash font-gothic">縦書きプレビュー</span>
        {title && (
          <span className="text-xs text-ink-muted font-mincho truncate">
            — {title}
          </span>
        )}
      </div>

      {/* プレビュー本文 */}
      <div className="flex-1 overflow-hidden p-8">
        {content ? (
          <div
            className="
              preview-vertical
              h-full
              text-ink dark:text-paper
              font-mincho
            "
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: html }}
            style={{
              fontSize: '16px',
              lineHeight: 2.2,
              letterSpacing: '0.08em',
            }}
          />
        ) : (
          <div className="
            h-full flex items-center justify-center
            text-ash text-sm font-gothic
          ">
            本文を入力するとプレビューが表示されます
          </div>
        )}
      </div>

      <style>{`
        .preview-vertical p {
          margin: 0;
          display: block;
        }
        .preview-vertical .empty-line {
          opacity: 0.01;
        }
        .preview-vertical ruby rt {
          font-size: 0.5em;
        }
      `}</style>
    </div>
  )
}
