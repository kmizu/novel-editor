import { test, expect } from '@playwright/test'

test.describe('Novel Editor App', () => {
  test('has title', async ({ page }) => {
    await page.goto('/')

    // タイトルが表示されているか確認
    await expect(page.getByRole('heading', { name: 'ネット小説執筆支援エディタ' })).toBeVisible()
  })

  test('shows setup message', async ({ page }) => {
    await page.goto('/')

    // セットアップメッセージが表示されているか確認
    await expect(page.getByText('プロジェクトが正常にセットアップされました。')).toBeVisible()
  })

  test('has correct styling', async ({ page }) => {
    await page.goto('/')

    // 背景色の確認
    const body = page.locator('body')
    await expect(body).toHaveCSS('background-color', 'rgb(243, 244, 246)')
  })
})
