import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'

describe('App Integration Tests', () => {
  it('navigates between pages', async () => {
    const user = userEvent.setup()
    render(<App />)

    // 初期表示はホームページ
    expect(screen.getByText('プロジェクト一覧')).toBeInTheDocument()
    expect(screen.getByText('新規プロジェクト')).toBeInTheDocument()

    // エディタページへ遷移
    const editorLink = screen.getByRole('link', { name: 'エディタ' })
    await user.click(editorLink)
    await waitFor(() => {
      expect(screen.getByText('プロジェクトを選択してください')).toBeInTheDocument()
    })

    // プロットページへ遷移
    const plotLink = screen.getByRole('link', { name: 'プロット' })
    await user.click(plotLink)
    await waitFor(() => {
      expect(screen.getByText('プロジェクトを選択してください')).toBeInTheDocument()
    })

    // キャラクターページへ遷移
    const charactersLink = screen.getByRole('link', { name: 'キャラクター' })
    await user.click(charactersLink)
    await waitFor(() => {
      expect(screen.getByText('プロジェクトを選択してください')).toBeInTheDocument()
    })

    // 世界観ページへ遷移
    const worldLink = screen.getByRole('link', { name: '世界観' })
    await user.click(worldLink)
    await waitFor(() => {
      expect(screen.getByText('プロジェクトを選択してください')).toBeInTheDocument()
    })

    // エクスポートページへ遷移
    const exportLink = screen.getByRole('link', { name: 'エクスポート' })
    await user.click(exportLink)
    await waitFor(() => {
      expect(screen.getByText('プロジェクトを選択してください')).toBeInTheDocument()
    })

    // ホームへ戻る
    const homeLink = screen.getByRole('link', { name: 'ホーム' })
    await user.click(homeLink)
    expect(screen.getByText('プロジェクト一覧')).toBeInTheDocument()
  })

  it('highlights active navigation item', async () => {
    const user = userEvent.setup()
    render(<App />)

    // 初期状態でホームがアクティブ
    const homeLink = screen.getByRole('link', { name: 'ホーム' })
    const editorLink = screen.getByRole('link', { name: 'エディタ' })

    // 初期状態を確認
    await waitFor(() => {
      expect(homeLink.className).toMatch(/bg-indigo-50/)
      expect(homeLink.className).toMatch(/text-indigo-700/)
    })

    // エディタをクリックすると、エディタがアクティブになる
    await user.click(editorLink)

    // ページ遷移後、エディタがアクティブになっているか確認
    await waitFor(() => {
      expect(editorLink.className).toMatch(/bg-indigo-50/)
      expect(editorLink.className).toMatch(/text-indigo-700/)
      expect(homeLink.className).not.toMatch(/bg-indigo-50/)
    })
  })
})
