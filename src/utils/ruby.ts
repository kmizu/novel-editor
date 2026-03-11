/**
 * ルビ記法ユーティリティ
 * カクヨム・なろう共通の |漢字《ルビ》 記法を処理する
 */

const RUBY_PATTERN = /\|(.+?)《(.+?)》/g

/**
 * HTMLエスケープ（XSS対策）
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/**
 * |漢字《ルビ》 → <ruby>漢字<rp>(</rp><rt>ルビ</rt><rp>)</rp></ruby>
 * ルビの内容はXSSエスケープする
 */
export function parseRuby(text: string): string {
  return text.replace(RUBY_PATTERN, (_match, base: string, ruby: string) => {
    const safeRuby = escapeHtml(ruby)
    return `<ruby>${base}<rp>(</rp><rt>${safeRuby}</rt><rp>)</rp></ruby>`
  })
}

/**
 * ルビ記法を除去して本文テキストのみ返す
 * （文字数カウントなどの用途）
 */
export function stripRuby(text: string): string {
  return text.replace(RUBY_PATTERN, (_match, base: string) => base)
}

/**
 * 執筆文字数カウント（空白・改行・ルビ記法を除く）
 * ネット小説の文字数は「本文の文字数のみ」が慣例
 */
export function countCharacters(text: string): number {
  const stripped = stripRuby(text)
  return stripped.replace(/[\s\n\r\t]/g, '').length
}
