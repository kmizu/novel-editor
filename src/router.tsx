import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ProjectsPage from './pages/ProjectsPage'
import EditorPage from './pages/EditorPage'
import PlotPage from './pages/PlotPage'
import CharactersPage from './pages/CharactersPage'
import WorldBuildingPage from './pages/WorldBuildingPage'
import ExportPage from './pages/ExportPage'
import SettingsPage from './pages/SettingsPage'
import StatisticsPage from './pages/StatisticsPage'
import PluginsPage from './pages/PluginsPage'
import CollaborationPage from './pages/CollaborationPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'projects',
        element: <ProjectsPage />,
      },
      {
        path: 'editor',
        element: <EditorPage />,
      },
      {
        path: 'plot',
        element: <PlotPage />,
      },
      {
        path: 'characters',
        element: <CharactersPage />,
      },
      {
        path: 'world-building',
        element: <WorldBuildingPage />,
      },
      {
        path: 'export',
        element: <ExportPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: 'statistics',
        element: <StatisticsPage />,
      },
      {
        path: 'plugins',
        element: <PluginsPage />,
      },
      {
        path: 'collaboration',
        element: <CollaborationPage />,
      },
    ],
  },
])
