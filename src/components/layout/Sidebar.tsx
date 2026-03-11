import { NavLink } from 'react-router-dom'
import {
  BookOpenIcon,
  FolderIcon,
  PencilSquareIcon,
  MapIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline'
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'
import { useProjectStore } from '../../stores/projectStore'
import { useSettingsStore } from '../../stores/settingsStore'

const NAV_ITEMS = [
  { to: '/',            icon: FolderIcon,         label: 'プロジェクト' },
  { to: '/editor',     icon: PencilSquareIcon,    label: 'エディタ' },
  { to: '/plot',       icon: MapIcon,             label: 'プロット' },
  { to: '/characters', icon: UserGroupIcon,        label: 'キャラクター' },
  { to: '/world',      icon: GlobeAltIcon,        label: '世界観' },
  { to: '/export',     icon: ArrowDownTrayIcon,   label: 'エクスポート' },
  { to: '/settings',   icon: Cog6ToothIcon,       label: '設定' },
]

export function Sidebar() {
  const { activeProject } = useProjectStore()
  const { theme, toggleTheme } = useSettingsStore()

  return (
    <aside className="
      w-56 flex-none flex flex-col
      bg-paper-dark dark:bg-night-surface
      border-r border-paper-darker dark:border-night-border
      select-none
    ">
      {/* ロゴ / タイトル */}
      <div className="px-4 py-5 border-b border-paper-darker dark:border-night-border">
        <div className="flex items-center gap-2">
          <BookOpenIcon className="w-5 h-5 text-vermillion flex-none" />
          <span className="font-mincho font-semibold text-sm text-ink dark:text-paper tracking-widest">
            小説工房
          </span>
        </div>
        {activeProject && (
          <p className="mt-2 text-xs text-ash truncate font-gothic">
            {activeProject.title}
          </p>
        )}
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 py-2 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-4 h-4 flex-none" />
            <span className="font-gothic text-xs tracking-wide">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* テーマトグル */}
      <div className="px-4 py-3 border-t border-paper-darker dark:border-night-border">
        <button
          onClick={toggleTheme}
          className="btn-ghost w-full justify-start text-xs gap-2 px-0"
          aria-label={theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
        >
          {theme === 'dark'
            ? <SunIcon className="w-4 h-4 text-amber-400" />
            : <MoonIcon className="w-4 h-4 text-ink-muted" />
          }
          <span className="font-gothic text-xs">
            {theme === 'dark' ? 'ライトモード' : 'ダークモード'}
          </span>
        </button>
      </div>
    </aside>
  )
}
