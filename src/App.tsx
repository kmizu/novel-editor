import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { StorageProvider } from './contexts/StorageContext'

function App() {
  return (
    <StorageProvider>
      <RouterProvider router={router} />
    </StorageProvider>
  )
}

export default App
