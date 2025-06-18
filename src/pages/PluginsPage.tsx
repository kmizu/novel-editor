import { useState } from 'react'
import { usePlugins } from '../hooks/usePlugins'
import PluginList from '../components/plugins/PluginList'
import PluginInstaller from '../components/plugins/PluginInstaller'
import PluginMarketplace from '../components/plugins/PluginMarketplace'
import { PuzzlePieceIcon, CloudArrowDownIcon, CogIcon } from '@heroicons/react/24/outline'

export default function PluginsPage() {
  const [activeTab, setActiveTab] = useState<'installed' | 'marketplace' | 'developer'>('installed')
  const {
    plugins,
    loading,
    error,
    installPlugin,
    uninstallPlugin,
    enablePlugin,
    disablePlugin,
    updatePluginSettings,
  } = usePlugins()

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">プラグインを読み込み中...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">プラグイン管理</h1>
          <p className="text-gray-600 mt-2">エディタの機能を拡張するプラグインを管理します</p>
        </div>

        {/* タブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('installed')}
                className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'installed'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <PuzzlePieceIcon className="w-5 h-5 mr-2" />
                インストール済み
              </button>
              <button
                onClick={() => setActiveTab('marketplace')}
                className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'marketplace'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CloudArrowDownIcon className="w-5 h-5 mr-2" />
                マーケットプレイス
              </button>
              <button
                onClick={() => setActiveTab('developer')}
                className={`py-4 px-6 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === 'developer'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <CogIcon className="w-5 h-5 mr-2" />
                開発者向け
              </button>
            </nav>
          </div>
        </div>

        {/* コンテンツ */}
        {activeTab === 'installed' && (
          <PluginList
            plugins={plugins}
            onEnable={enablePlugin}
            onDisable={disablePlugin}
            onUninstall={uninstallPlugin}
            onUpdateSettings={updatePluginSettings}
          />
        )}

        {activeTab === 'marketplace' && <PluginMarketplace onInstall={installPlugin} />}

        {activeTab === 'developer' && <PluginInstaller onInstall={installPlugin} />}
      </div>
    </div>
  )
}
