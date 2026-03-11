import { describe, it, expect } from 'vitest'
import { parseRuby, stripRuby, countCharacters } from './ruby'

// ============================================================
// TDD: RED フェーズ — テストを先に書く
// ============================================================

describe('parseRuby', () => {
  it('ルビ記法を<ruby>タグに変換する', () => {
    const input = '|漢字《かんじ》'
    const result = parseRuby(input)
    expect(result).toBe('<ruby>漢字<rp>(</rp><rt>かんじ</rt><rp>)</rp></ruby>')
  })

  it('複数のルビを正しく変換する', () => {
    const input = '|山田《やまだ》は|東京《とうきょう》に住んでいる。'
    const result = parseRuby(input)
    expect(result).toContain('<ruby>山田<rp>(</rp><rt>やまだ</rt><rp>)</rp></ruby>')
    expect(result).toContain('<ruby>東京<rp>(</rp><rt>とうきょう</rt><rp>)</rp></ruby>')
  })

  it('ルビがない場合はそのまま返す', () => {
    const input = 'ルビなしのテキスト。'
    expect(parseRuby(input)).toBe('ルビなしのテキスト。')
  })

  it('空文字列を処理できる', () => {
    expect(parseRuby('')).toBe('')
  })

  it('改行を含むテキストを正しく処理する', () => {
    const input = '|魔法《まほう》を使った。\n|勇者《ゆうしゃ》は驚いた。'
    const result = parseRuby(input)
    expect(result).toContain('<ruby>魔法<rp>(</rp><rt>まほう</rt><rp>)</rp></ruby>')
    expect(result).toContain('<ruby>勇者<rp>(</rp><rt>ゆうしゃ</rt><rp>)</rp></ruby>')
  })

  it('XSSを防ぐ（スクリプトタグはエスケープされる）', () => {
    const input = '|test《<script>alert(1)</script>》'
    const result = parseRuby(input)
    expect(result).not.toContain('<script>')
    expect(result).toContain('&lt;script&gt;')
  })
})

describe('stripRuby', () => {
  it('ルビ記法を除去して本文テキストのみ返す', () => {
    expect(stripRuby('|漢字《かんじ》')).toBe('漢字')
  })

  it('複数のルビを除去する', () => {
    expect(stripRuby('|山田《やまだ》は元気です。')).toBe('山田は元気です。')
  })

  it('ルビがない場合はそのまま返す', () => {
    expect(stripRuby('普通のテキスト')).toBe('普通のテキスト')
  })
})

describe('countCharacters', () => {
  it('空白と改行を除いた文字数を返す', () => {
    expect(countCharacters('あいう えお')).toBe(5) // スペース除く
  })

  it('改行を除く', () => {
    expect(countCharacters('あいう\nえお')).toBe(5)
  })

  it('ルビ記法の文字数（本文のみ）を返す', () => {
    // |漢字《かんじ》は「漢字」の2文字
    expect(countCharacters('|漢字《かんじ》')).toBe(2)
  })

  it('空文字列は0を返す', () => {
    expect(countCharacters('')).toBe(0)
  })
})
