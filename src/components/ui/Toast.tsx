import { useState, useCallback, useEffect } from 'react'
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export interface ToastItem {
  id: string
  type: 'success' | 'error'
  message: string
}

interface ToastProps {
  toast: ToastItem
  onClose: (id: string) => void
}

function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 4000)
    return () => clearTimeout(timer)
  }, [toast.id, onClose])

  return (
    <div
      className={`
        flex items-start gap-2.5 px-4 py-3 shadow-lg text-sm font-gothic
        animate-slide-up max-w-sm
        ${toast.type === 'success'
          ? 'bg-white dark:bg-night-surface border border-green-200 dark:border-green-800 text-green-800 dark:text-green-300'
          : 'bg-white dark:bg-night-surface border border-vermillion/20 text-vermillion'
        }
      `}
    >
      {toast.type === 'success'
        ? <CheckCircleIcon className="w-4 h-4 mt-0.5 shrink-0 text-green-600 dark:text-green-400" />
        : <XCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
      }
      <span className="flex-1 leading-snug">{toast.message}</span>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 text-ash hover:text-ink dark:hover:text-paper transition-colors mt-0.5"
      >
        <XMarkIcon className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onClose: (id: string) => void
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <Toast toast={t} onClose={onClose} />
        </div>
      ))}
    </div>
  )
}

let _toastCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const addToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = `toast-${++_toastCounter}`
    setToasts((prev) => [...prev, { id, type, message }])
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
  }

  return { toasts, removeToast, toast }
}
