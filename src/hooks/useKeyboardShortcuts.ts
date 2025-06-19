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


  const allShortcuts = [
    // ナビゲーション
    { keys: 'Ctrl+E', description: 'エディタを開く', category: 'navigation' },
    { keys: 'Ctrl+P', description: 'プロット管理を開く', category: 'navigation' },
    { keys: 'Ctrl+K', description: 'キャラクター管理を開く', category: 'navigation' },
    { keys: 'Ctrl+W', description: '世界観設定を開く', category: 'navigation' },
    { keys: 'Ctrl+H', description: 'ホームに戻る', category: 'navigation' },
    // エディタ
    { keys: 'Ctrl+F', description: '検索', category: 'editor' },
    { keys: 'Ctrl+Shift+H', description: '置換', category: 'editor' },
    { keys: 'Ctrl+↑', description: '前の章へ移動', category: 'editor' },
    { keys: 'Ctrl+↓', description: '次の章へ移動', category: 'editor' },
    // ファイル操作
    { keys: 'Ctrl+S', description: '保存', category: 'file' },
    { keys: 'Ctrl+Shift+E', description: 'エクスポート', category: 'file' },
    { keys: 'Ctrl+N', description: '新しい章を作成', category: 'file' },
    // ヘルプ
    { keys: 'Ctrl+?', description: 'ショートカット一覧を表示', category: 'help' },
    { keys: 'F1', description: 'ヘルプを表示', category: 'help' },
  ]

  return {
    shortcuts: allShortcuts,
    categories: {
      navigation: 'ナビゲーション',
      editor: 'エディタ',
      file: 'ファイル操作',
      help: 'ヘルプ',
    },
  }
}
