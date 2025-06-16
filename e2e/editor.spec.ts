import { test, expect } from '@playwright/test'

test.describe('エディタ機能', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')

    // プロジェクトを作成
    await page.click('text=新規プロジェクト')
    await page.fill('input[placeholder="プロジェクト名を入力"]', 'テスト小説')
    await page.fill('textarea[placeholder="あらすじを入力"]', 'これはテスト用の小説です')
    await page.click('button:has-text("作成")')

    // エディタページに移動
    await page.click('a:has-text("エディタ")')
  })

  test('章を作成して本文を執筆できる', async ({ page }) => {
    // 章がない状態の確認
    await expect(page.locator('text=章を選択または作成して執筆を始めましょう')).toBeVisible()

    // 新しい章を作成
    await page.click('button:has-text("新しい章を作成")')
    await page.fill('input[placeholder="章のタイトルを入力"]', '第1章 始まり')
    await page.click('button:has-text("作成")')

    // 章が作成されたことを確認
    await expect(page.locator('h2:has-text("第1章: 第1章 始まり")')).toBeVisible()

    // 本文を入力
    const textarea = page.locator('textarea[placeholder="ここに本文を入力してください..."]')
    await textarea.fill('これは物語の始まりです。')

    // 文字数が表示されることを確認
    await expect(page.locator('text=文字数: 12')).toBeVisible()

    // 自動保存が実行されることを確認
    await expect(page.locator('text=保存中...')).toBeVisible()
    await expect(page.locator('text=保存済み')).toBeVisible({ timeout: 5000 })
  })

  test('複数の章を管理できる', async ({ page }) => {
    // 複数の章を作成
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("新しい章を作成")')
      await page.fill('input[placeholder="章のタイトルを入力"]', `第${i}章`)
      await page.click('button:has-text("作成")')
    }

    // 章一覧に3つの章が表示されることを確認
    await expect(page.locator('text=第1章: 第1章')).toBeVisible()
    await expect(page.locator('text=第2章: 第2章')).toBeVisible()
    await expect(page.locator('text=第3章: 第3章')).toBeVisible()

    // 章を切り替える
    await page.click('text=第1章: 第1章')
    await expect(page.locator('h2:has-text("第1章: 第1章")')).toBeVisible()

    // 章ごとに異なる内容を入力
    await page.locator('textarea').fill('第1章の内容です。')

    await page.click('text=第2章: 第2章')
    await expect(page.locator('h2:has-text("第2章: 第2章")')).toBeVisible()
    await page.locator('textarea').fill('第2章の内容です。')

    // 章を切り替えても内容が保持されることを確認
    await page.click('text=第1章: 第1章')
    await expect(page.locator('textarea')).toHaveValue('第1章の内容です。')
  })

  test('章のタイトルを編集できる', async ({ page }) => {
    // 章を作成
    await page.click('button:has-text("新しい章を作成")')
    await page.fill('input[placeholder="章のタイトルを入力"]', '元のタイトル')
    await page.click('button:has-text("作成")')

    // 編集ボタンを表示（ホバー）
    const chapterItem = page.locator('text=第1章: 元のタイトル').locator('..')
    await chapterItem.hover()

    // 編集ボタンをクリック
    await chapterItem.locator('button[title*="編集"]').click()

    // タイトルを変更
    const editInput = chapterItem.locator('input[type="text"]')
    await editInput.clear()
    await editInput.fill('新しいタイトル')
    await editInput.press('Enter')

    // タイトルが変更されたことを確認
    await expect(page.locator('text=第1章: 新しいタイトル')).toBeVisible()
    await expect(page.locator('h2:has-text("第1章: 新しいタイトル")')).toBeVisible()
  })

  test('章を削除できる', async ({ page }) => {
    // 2つの章を作成
    await page.click('button:has-text("新しい章を作成")')
    await page.fill('input[placeholder="章のタイトルを入力"]', '削除する章')
    await page.click('button:has-text("作成")')

    await page.click('button:has-text("新しい章を作成")')
    await page.fill('input[placeholder="章のタイトルを入力"]', '残す章')
    await page.click('button:has-text("作成")')

    // 最初の章を削除
    const firstChapter = page.locator('text=第1章: 削除する章').locator('..')
    await firstChapter.hover()

    page.on('dialog', (dialog) => dialog.accept())
    await firstChapter.locator('button[title*="削除"]').click()

    // 章が削除されたことを確認
    await expect(page.locator('text=第1章: 削除する章')).not.toBeVisible()
    await expect(page.locator('text=第1章: 残す章')).toBeVisible()
  })

  test('章の並び順を変更できる', async ({ page }) => {
    // 3つの章を作成
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("新しい章を作成")')
      await page.fill('input[placeholder="章のタイトルを入力"]', `章${i}`)
      await page.click('button:has-text("作成")')
    }

    // ドラッグ&ドロップで並び替え（第3章を第1章の位置に移動）
    const chapter3 = page.locator('text=第3章: 章3').locator('..')
    const chapter1 = page.locator('text=第1章: 章1').locator('..')

    await chapter3.dragTo(chapter1)

    // 並び順が変更されたことを確認
    const chapters = page.locator('div').filter({ hasText: /^第\d+章:/ })
    await expect(chapters.nth(0)).toContainText('第1章: 章3')
    await expect(chapters.nth(1)).toContainText('第2章: 章1')
    await expect(chapters.nth(2)).toContainText('第3章: 章2')
  })

  test('サイドバーの表示/非表示を切り替えられる', async ({ page }) => {
    // 章を作成
    await page.click('button:has-text("新しい章を作成")')
    await page.fill('input[placeholder="章のタイトルを入力"]', 'テスト章')
    await page.click('button:has-text("作成")')

    // サイドバーが表示されていることを確認
    await expect(page.locator('h3:has-text("章一覧")')).toBeVisible()

    // サイドバーを非表示にする
    await page.click('button[aria-label="サイドバーを閉じる"]')
    await expect(page.locator('h3:has-text("章一覧")')).not.toBeVisible()

    // サイドバーを再表示する
    await page.click('button[title="サイドバーを表示"]')
    await expect(page.locator('h3:has-text("章一覧")')).toBeVisible()
  })

  test('総文字数が正しく表示される', async ({ page }) => {
    // 複数の章を作成して内容を入力
    await page.click('button:has-text("新しい章を作成")')
    await page.fill('input[placeholder="章のタイトルを入力"]', '第1章')
    await page.click('button:has-text("作成")')
    await page.locator('textarea').fill('あいうえお') // 5文字
    await page.waitForTimeout(1500) // 自動保存を待つ

    await page.click('button:has-text("新しい章を作成")')
    await page.fill('input[placeholder="章のタイトルを入力"]', '第2章')
    await page.click('button:has-text("作成")')
    await page.locator('textarea').fill('かきくけこさしすせそ') // 10文字
    await page.waitForTimeout(1500) // 自動保存を待つ

    // 総文字数が正しく表示されることを確認
    await expect(page.locator('text=総文字数: 15')).toBeVisible()
  })
})
