import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjects } from './useProjects'

interface ShortcutConfig {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  action: () => void
  description: string
}

export function useKeyboardShortcuts() {
  const navigate = useNavigate()
  const { currentProject } = useProjects()

  useEffect(() => {
    const shortcuts: ShortcutConfig[] = [
      {
        key: 'e',
        ctrl: true,
        action: () => currentProject && navigate('/editor'),
        description: 'エディタを開く',
      },
      {
        key: 'p',
        ctrl: true,
        action: () => currentProject && navigate('/plot'),
        description: 'プロット管理を開く',
      },
      {
        key: 'k',
        ctrl: true,
        action: () => currentProject && navigate('/characters'),
        description: 'キャラクター管理を開く',
      },
      {
        key: 'w',
        ctrl: true,
        action: () => currentProject && navigate('/world-building'),
        description: '世界観設定を開く',
      },
      {
        key: 's',
        ctrl: true,
        action: () => {
          // 保存はすでに自動保存されているため、保存完了の通知を表示
          const event = new CustomEvent('save-notification')
          window.dispatchEvent(event)
        },
        description: '保存',
      },
      {
        key: 'h',
        ctrl: true,
        action: () => navigate('/'),
        description: 'ホームに戻る',
      },
    ]

    const handleKeyDown = (e: KeyboardEvent) => {
      const shortcut = shortcuts.find((s) => {
        const keyMatch = e.key.toLowerCase() === s.key.toLowerCase()
        const ctrlMatch = s.ctrl ? e.ctrlKey || e.metaKey : true
        const altMatch = s.alt ? e.altKey : true
        const shiftMatch = s.shift ? e.shiftKey : true

        return keyMatch && ctrlMatch && altMatch && shiftMatch
      })

      if (shortcut) {
        e.preventDefault()
        shortcut.action()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [navigate, currentProject])

  return {
    shortcuts: [
      { keys: 'Ctrl+E', description: 'エディタを開く' },
      { keys: 'Ctrl+P', description: 'プロット管理を開く' },
      { keys: 'Ctrl+K', description: 'キャラクター管理を開く' },
      { keys: 'Ctrl+W', description: '世界観設定を開く' },
      { keys: 'Ctrl+S', description: '保存' },
      { keys: 'Ctrl+H', description: 'ホームに戻る' },
    ],
  }
}
