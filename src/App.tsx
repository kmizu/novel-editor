import { createHashRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProjectsPage } from './pages/ProjectsPage'
import { EditorPage } from './pages/EditorPage'
import { PlaceholderPage } from './pages/PlaceholderPage'

const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <ProjectsPage /> },
      { path: 'editor', element: <EditorPage /> },
      {
        path: 'plot',
        element: <PlaceholderPage title="プロット" description="プロット・あらすじ管理" />,
      },
      {
        path: 'characters',
        element: <PlaceholderPage title="キャラクター" description="登場人物の管理" />,
      },
      {
        path: 'world',
        element: <PlaceholderPage title="世界観" description="世界観・設定資料の管理" />,
      },
      {
        path: 'export',
        element: <PlaceholderPage title="エクスポート" description="カクヨム・なろう形式でエクスポート" />,
      },
      {
        path: 'settings',
        element: <PlaceholderPage title="設定" description="アプリ設定" />,
      },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
