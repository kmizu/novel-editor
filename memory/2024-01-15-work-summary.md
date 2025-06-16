# 2024年1月15日 作業記録 - ネット小説執筆支援エディタ

## プロジェクト概要
- **プロジェクト名**: novel-editor
- **目的**: ネット小説（カクヨム、小説家になろう等）の執筆をサポートする多機能エディタ
- **技術スタック**: React, TypeScript, Tailwind CSS, Vite

## 完了したフェーズ

### フェーズ1: プロジェクト基盤構築 ✅
- Viteプロジェクトの初期化（React + TypeScript）
- Tailwind CSSのセットアップ
- ESLint、Prettierの設定
- 基本的なディレクトリ構造の作成
- package.jsonのスクリプト設定（dev, build, lint, type-check）
- テスト環境のセットアップ（Vitest、React Testing Library、Playwright）

### フェーズ2: 基本UIとルーティング ✅
- React Routerの導入と設定
- メインレイアウトコンポーネントの作成
- ナビゲーションメニューの実装
- 各機能のための基本的なページコンポーネント作成
- 基本的なコンポーネントのユニットテスト作成

### フェーズ3: データモデルとストレージ ✅
- TypeScript型定義の作成（Project, Chapter, Character, Plot等）
- ローカルストレージ管理のフックとユーティリティ
- データの永続化とリストア機能
- プロジェクト管理機能（新規作成、切り替え、削除）
- ストレージ機能の統合テスト作成

### フェーズ4: エディタ機能 ✅
- テキストエディタコンポーネントの実装
- 自動保存機能
- 文字数カウント機能
- 章の管理（追加、編集、削除、並び替え）
- エディタ機能のE2Eテスト作成

### フェーズ5: プロット・あらすじ管理 ✅（一部）
- プロットエディタの実装 ✅
- あらすじエディタの実装 ✅
- 各話メモ機能の実装 ✅
- プロットと本文の連携機能 ❌（未実装）

## 実装済み機能の詳細

### 1. プロジェクト管理
- 複数プロジェクトの作成・切り替え・削除
- プロジェクトごとのタイトル、説明、作成日時の管理
- 現在のプロジェクトの永続化

### 2. エディタ機能
- 章ごとの本文執筆
- リアルタイムでの文字数カウント
- 自動保存機能（3秒のデバウンス）
- 章の追加・削除・並び替え

### 3. プロット管理
- プロジェクト全体のプロット編集
- 章ごとのメモ機能
- マークダウン形式での入力サポート

### 4. あらすじ管理
- プロジェクト全体のあらすじ編集
- 自動保存機能

### 5. ストレージ機能
- ローカルストレージを使用したデータ永続化
- プロジェクトデータの自動バックアップ
- データの型安全性を保証

## 主要コンポーネント構造

```
src/
├── components/
│   ├── editor/
│   │   └── ChapterList.tsx
│   ├── layout/
│   │   └── Layout.tsx
│   ├── plot/
│   │   └── PlotEditor.tsx
│   └── project/
│       ├── CreateProjectDialog.tsx
│       ├── ProjectCard.tsx
│       └── ProjectEditDialog.tsx
├── hooks/
│   ├── useAutoSave.ts
│   ├── useChapters.ts
│   ├── usePlots.ts
│   └── useProjects.ts
├── pages/
│   ├── CharactersPage.tsx
│   ├── EditorPage.tsx
│   ├── ExportPage.tsx
│   ├── HomePage.tsx
│   ├── PlotPage.tsx
│   └── WorldBuildingPage.tsx
├── types/
│   └── project.ts
└── utils/
    ├── helpers.ts
    └── storage.ts
```

## テスト実装状況
- ユニットテスト: storage.ts, useProjects.ts
- 統合テスト: App.integration.test.tsx
- E2Eテスト: editor.spec.ts（Playwright）

## 今後の実装予定

### フェーズ6: キャラクター管理
- キャラクター作成・編集フォーム
- キャラクタープロフィール表示
- キャラクター間の関係性マップ
- キャラクター検索・フィルタリング

### フェーズ7: 世界観管理
- 世界観設定の入力フォーム
- カテゴリ別管理（地理、歴史、文化等）
- 用語集機能
- 設定資料の検索機能

### フェーズ8: エクスポート機能
- カクヨム形式でのエクスポート
- なろう形式でのエクスポート
- プレーンテキストエクスポート
- バックアップ機能（JSON形式）

## 技術的な工夫点

1. **型安全性**: TypeScriptの厳格な型定義により、ランタイムエラーを最小化
2. **カスタムフック**: ロジックの再利用性を高め、コンポーネントをシンプルに保つ
3. **自動保存**: デバウンスを使用してパフォーマンスを最適化
4. **テスト戦略**: ユニット・統合・E2Eの3層構造でカバレッジを確保

## 開発環境
- Node.js環境
- Linux (WSL2)
- Vite開発サーバー

## コマンド
- `npm run dev`: 開発サーバー起動
- `npm run build`: ビルド実行
- `npm run test`: テスト実行
- `npm run lint`: リント実行
- `npm run type-check`: 型チェック実行