import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import { StorageProvider } from './contexts/StorageContext'
import { ToastContainer, useToast } from './components/Toast'
import { createContext, useContext } from 'react'

// Toast Context
const ToastContext = createContext<ReturnType<typeof useToast> | null>(null)

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within ToastProvider')
  }
  return context
}

function App() {
  const toast = useToast()

  return (
    <StorageProvider>
      <ToastContext.Provider value={toast}>
        <RouterProvider router={router} />
        <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} />
      </ToastContext.Provider>
    </StorageProvider>
  )
}

export default App
