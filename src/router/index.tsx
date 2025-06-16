import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import HomePage from '../pages/HomePage'
import EditorPage from '../pages/EditorPage'
import PlotPage from '../pages/PlotPage'
import CharactersPage from '../pages/CharactersPage'
import WorldBuildingPage from '../pages/WorldBuildingPage'
import ExportPage from '../pages/ExportPage'

// ルーティング設定
// createBrowserRouterを使用することで、より型安全で最新のルーティング機能を利用できます
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />, // 共通レイアウトでラップ
    children: [
      {
        index: true,
        element: <HomePage />, // ホーム（プロジェクト一覧）
      },
      {
        path: 'editor',
        element: <EditorPage />, // 本文エディタ
      },
      {
        path: 'plot',
        element: <PlotPage />, // プロット管理
      },
      {
        path: 'characters',
        element: <CharactersPage />, // キャラクター管理
      },
      {
        path: 'world',
        element: <WorldBuildingPage />, // 世界観設定
      },
      {
        path: 'export',
        element: <ExportPage />, // エクスポート
      },
    ],
  },
])
