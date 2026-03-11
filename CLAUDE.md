# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 重要な指示

**日本語で応答してください。**

**注意深く、用心深くコーディングをしてください。**

**問題が起きたときにパニックにならないでください。**

**TypeScriptでは`any`型の使用を原則禁止してください。適切な型定義を行い、型安全性を保証してください。**

**作業完了前の確認事項：**

```bash
npm run build        # ビルドが成功すること
npm run type-check   # 型エラーがないこと
npm run lint         # リントエラーがないこと
npm run test         # 全てのテストが通ること
```

## プロジェクト概要

ネット小説（カクヨム、小説家になろう等）の執筆支援エディタ。プロット、キャラクター、世界観、各話メモを一元管理し、カクヨム/なろう形式でのエクスポートをサポートする。React 19 + TypeScript + Tailwind CSS + Vite で実装済み。

## 主要コマンド

```bash
npm run dev            # 開発サーバー起動 (Vite)
npm run build          # プロダクションビルド (tsc && vite build)
npm run type-check     # 型チェックのみ (tsc --noEmit)
npm run lint           # ESLintチェック
npm run test           # Vitestでユニットテスト実行
npm run test:watch     # ウォッチモード
npm run test:coverage  # カバレッジレポート (目標80%+)
npm run test:e2e       # Playwrightでのe2eテスト
npm run check-all      # type-check + lint + test を一括実行
```

## アーキテクチャ

### 実際のディレクトリ構造

```
src/
├── components/
│   ├── editor/         # TextEditor, ChapterList
│   ├── plot/           # PlotEditor
│   ├── character/      # CharacterForm, CharacterCard
│   ├── worldbuilding/  # WorldSettingForm, WorldSettingCard
│   ├── project/        # CreateProjectDialog, ProjectCard, ProjectEditDialog
│   └── Layout.tsx      # サイドバー付き2カラムレイアウト
├── pages/              # ルート対応のページコンポーネント
├── hooks/              # カスタムフック（ビジネスロジック）
├── utils/
│   ├── storage.ts      # StorageManagerクラス (localStorage wrapper)
│   ├── export.ts       # カクヨム/なろう/JSON形式エクスポート
│   ├── helpers.ts
│   └── performance.ts
├── types/
│   └── project.ts      # Project, Chapter, Character, Plot等の型定義
├── router.tsx          # createBrowserRouter によるルート定義
└── test/setup.ts       # Vitest セットアップ (jsdom + localStorage mock)
e2e/                    # Playwright E2Eテスト
```

### 状態管理とデータフロー

外部状態管理ライブラリ（Redux/Zustand等）は使用せず、**カスタムフック + localStorage** で完結している：

- `useProjects` — プロジェクトのCRUDとアクティブプロジェクト管理
- `useChapters` — 章の管理（追加・編集・削除・並び替え）
- `useCharacters` / `usePlots` / `useWorldSettings` — 各機能のデータ管理
- `useAutoSave` — テキスト変更を自動的にlocalStorageへ保存
- `useTheme` — ダーク/ライトモード切り替え
- `useKeyboardShortcuts` — グローバルキーボードショートカット

**StorageManager**（`src/utils/storage.ts`）がlocalStorageのI/Oを集約。キープレフィックスは `novel_editor_`。

### ルーティング

React Router DOM v7 の `createBrowserRouter` を使用：

| パス | ページ |
|------|-------|
| `/` | ホーム |
| `/projects` | プロジェクト管理 |
| `/editor` | テキストエディタ・章管理 |
| `/plot` | プロット・あらすじ・各話メモ |
| `/characters` | キャラクター管理・関係性マップ |
| `/world-building` | 世界観設定・用語集 |
| `/export` | カクヨム/なろう/JSON形式エクスポート |
| `/settings` | 設定 |

### 主要ライブラリ

- **@headlessui/react** — アクセシブルなUIコンポーネント（ダイアログ等）
- **@heroicons/react** — サイドバー等のアイコン
- **Tailwind CSS** — ダークモードは `class` ベース、カスタムアニメーション定義あり

## テスト

- **ユニット/統合**: Vitest + React Testing Library + jsdom
- **E2E**: Playwright (`/e2e` ディレクトリ)
- **カバレッジ目標**: 80%以上

単一テストファイルの実行:
```bash
npx vitest run src/hooks/useProjects.test.ts
```

## 残課題

- フェーズ5: プロットと本文の連携機能（未実装）
