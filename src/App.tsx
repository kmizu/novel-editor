import { createHashRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { ProjectsPage } from './pages/ProjectsPage'
import { EditorPage } from './pages/EditorPage'
import { PlotPage } from './pages/PlotPage'
import { CharactersPage } from './pages/CharactersPage'
import { WorldBuildingPage } from './pages/WorldBuildingPage'
import { ExportPage } from './pages/ExportPage'
import { SettingsPage } from './pages/SettingsPage'

const router = createHashRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <ProjectsPage /> },
      { path: 'editor', element: <EditorPage /> },
      { path: 'plot', element: <PlotPage /> },
      { path: 'characters', element: <CharactersPage /> },
      { path: 'world', element: <WorldBuildingPage /> },
      { path: 'export', element: <ExportPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
