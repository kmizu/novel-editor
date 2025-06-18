import { useState } from 'react'
import { Plugin, MarketplacePlugin } from '../../types/plugin'
import { StarIcon, CloudArrowDownIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'

interface PluginMarketplaceProps {
  onInstall: (
    pluginCode: string,
    manifest: Plugin['manifest']
  ) => Promise<{ success: boolean; error?: string }>
}

// サンプルプラグインデータ（実際はAPIから取得）
const samplePlugins: MarketplacePlugin[] = [
  {
    id: 'word-counter-plus',
    name: 'Word Counter Plus',
    version: '2.1.0',
    description: '高度な文字数カウント機能。原稿用紙換算、読了時間推定など',
    author: 'Novel Tools Inc.',
    category: 'analyzer',
    downloads: 5420,
    rating: 4.5,
    ratingCount: 128,
    lastUpdated: '2024-12-25',
    size: 125000,
    tags: ['文字数', '統計', '分析'],
  },
  {
    id: 'auto-ruby',
    name: '自動ルビ振り',
    version: '1.3.2',
    description: '難読漢字に自動でルビを振る機能。カスタム辞書対応',
    author: 'Japanese Writing Lab',
    category: 'editor',
    downloads: 3210,
    rating: 4.2,
    ratingCount: 89,
    lastUpdated: '2024-12-20',
    size: 210000,
    tags: ['日本語', 'ルビ', '漢字'],
  },
  {
    id: 'epub-exporter',
    name: 'EPUB エクスポーター',
    version: '3.0.0',
    description: 'プロフェッショナルなEPUB形式でのエクスポート。目次、メタデータ完全対応',
    author: 'Digital Publishing Co.',
    category: 'export',
    downloads: 8930,
    rating: 4.8,
    ratingCount: 234,
    lastUpdated: '2024-12-28',
    size: 340000,
    tags: ['EPUB', 'エクスポート', '電子書籍'],
  },
  {
    id: 'writing-prompts',
    name: 'ライティングプロンプト',
    version: '1.0.5',
    description: '執筆のアイデアに困ったときのプロンプト生成器',
    author: 'Creative Writers Guild',
    category: 'utility',
    downloads: 2150,
    rating: 3.9,
    ratingCount: 67,
    lastUpdated: '2024-12-15',
    size: 98000,
    tags: ['アイデア', 'プロンプト', '創作支援'],
  },
]

export default function PluginMarketplace({ onInstall }: PluginMarketplaceProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [installing, setInstalling] = useState<string | null>(null)

  const filteredPlugins = samplePlugins.filter((plugin) => {
    const matchesSearch =
      plugin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plugin.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === 'all' || plugin.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleInstall = async (plugin: MarketplacePlugin) => {
    setInstalling(plugin.id)

    try {
      // 実際の実装では、サーバーからプラグインコードとマニフェストを取得
      const mockManifest: Plugin['manifest'] = {
        main: plugin.name.replace(/\s+/g, ''),
        permissions: ['read:chapters', 'write:chapters'],
        settings: [],
        commands: [],
        hooks: [],
      }

      const mockCode = `
const ${plugin.name.replace(/\s+/g, '')} = {
  async activate(api) {
    console.log('${plugin.name} activated!');
  },
  async deactivate() {
    console.log('${plugin.name} deactivated!');
  }
};`

      const result = await onInstall(mockCode, mockManifest)

      if (result.success) {
        alert(`${plugin.name} のインストールが完了しました`)
      } else {
        alert(`インストールに失敗しました: ${result.error}`)
      }
    } catch {
      alert('インストール中にエラーが発生しました')
    } finally {
      setInstalling(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star}>
            {star <= Math.floor(rating) ? (
              <StarSolidIcon className="w-4 h-4 text-yellow-400" />
            ) : (
              <StarIcon className="w-4 h-4 text-gray-300" />
            )}
          </span>
        ))}
        <span className="ml-1 text-sm text-gray-600">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 検索とフィルター */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="プラグインを検索..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">すべてのカテゴリ</option>
            <option value="editor">エディタ拡張</option>
            <option value="export">エクスポート</option>
            <option value="analyzer">分析ツール</option>
            <option value="utility">ユーティリティ</option>
          </select>
        </div>
      </div>

      {/* プラグイン一覧 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPlugins.map((plugin) => (
          <div key={plugin.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-lg font-semibold">{plugin.name}</h3>
                <p className="text-sm text-gray-600">by {plugin.author}</p>
              </div>
              <span className="text-sm text-gray-500">v{plugin.version}</span>
            </div>

            <p className="text-gray-700 mb-4">{plugin.description}</p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <CloudArrowDownIcon className="w-4 h-4 mr-1" />
                  {plugin.downloads.toLocaleString()}
                </div>
                {renderStars(plugin.rating)}
                <span>({plugin.ratingCount})</span>
              </div>
            </div>

            {plugin.tags && (
              <div className="flex flex-wrap gap-2 mb-4">
                {plugin.tags.map((tag) => (
                  <span key={tag} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                <span>{formatFileSize(plugin.size)}</span>
                <span className="mx-2">•</span>
                <span>更新: {new Date(plugin.lastUpdated).toLocaleDateString('ja-JP')}</span>
              </div>
              <button
                onClick={() => handleInstall(plugin)}
                disabled={installing === plugin.id}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
              >
                {installing === plugin.id ? 'インストール中...' : 'インストール'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredPlugins.length === 0 && (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-600">該当するプラグインが見つかりませんでした</p>
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">マーケットプレイスについて</h4>
        <p className="text-sm text-blue-700">
          現在、マーケットプレイスは開発中です。表示されているプラグインはサンプルデータです。
          実際のマーケットプレイスでは、コミュニティによって開発された様々なプラグインを
          簡単にインストールできるようになります。
        </p>
      </div>
    </div>
  )
}
