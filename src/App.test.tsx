import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />)
    // ヘッダーのタイトルが表示されているか確認
    expect(screen.getByText('小説エディタ')).toBeInTheDocument()
  })

  it('shows navigation menu', () => {
    render(<App />)
    // ナビゲーションメニューの項目が表示されているか確認
    expect(screen.getByText('ホーム')).toBeInTheDocument()
    expect(screen.getByText('エディタ')).toBeInTheDocument()
    expect(screen.getByText('プロット')).toBeInTheDocument()
    expect(screen.getByText('キャラクター')).toBeInTheDocument()
    expect(screen.getByText('世界観')).toBeInTheDocument()
    expect(screen.getByText('エクスポート')).toBeInTheDocument()
  })
})
