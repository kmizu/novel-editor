import { useState } from 'react'
import { Plugin } from '../../types/plugin'
import { CodeBracketIcon } from '@heroicons/react/24/outline'

interface PluginInstallerProps {
  onInstall: (
    pluginCode: string,
    manifest: Plugin['manifest']
  ) => Promise<{ success: boolean; error?: string }>
}

export default function PluginInstaller({ onInstall }: PluginInstallerProps) {
  const [pluginCode, setPluginCode] = useState('')
  const [manifestJson, setManifestJson] = useState('')
  const [installing, setInstalling] = useState(false)
  const [error, setError] = useState('')

  const handleInstall = async () => {
    setError('')
    setInstalling(true)

    try {
      // マニフェストのパース
      const manifest = JSON.parse(manifestJson) as Plugin['manifest']

      // 必須フィールドのチェック
      if (!manifest.main || !manifest.permissions) {
        throw new Error('マニフェストに必須フィールドが不足しています')
      }

      // プラグインのインストール
      const result = await onInstall(pluginCode, manifest)

      if (result.success) {
        alert('プラグインのインストールが完了しました')
        setPluginCode('')
        setManifestJson('')
      } else {
        setError(result.error || 'インストールに失敗しました')
      }
    } catch (err) {
      if (err instanceof SyntaxError) {
        setError('マニフェストのJSONが無効です')
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('予期しないエラーが発生しました')
      }
    } finally {
      setInstalling(false)
    }
  }

  // サンプルプラグインの生成
  const generateSamplePlugin = () => {
    const sampleManifest = {
      main: 'MyPlugin',
      permissions: ['read:chapters', 'ui:toolbar'],
      settings: [
        {
          key: 'highlightColor',
          type: 'color',
          label: 'ハイライト色',
          defaultValue: '#ffeb3b',
        },
      ],
      commands: [
        {
          id: 'highlight-selection',
          name: 'テキストをハイライト',
          description: '選択したテキストをハイライトします',
          handler: 'highlightSelection',
        },
      ],
      hooks: [
        {
          event: 'editor:selectionChange',
          handler: 'onSelectionChange',
        },
      ],
    }

    const sampleCode = `
const MyPlugin = {
  // プラグインの初期化
  async activate(api) {
    this.api = api;
    console.log('MyPlugin activated!');
    
    // ツールバーアクションを登録
    api.registerToolbarAction({
      id: 'highlight-button',
      title: 'ハイライト',
      onClick: () => this.highlightSelection()
    });
  },
  
  // プラグインの終了処理
  async deactivate() {
    console.log('MyPlugin deactivated!');
  },
  
  // 選択テキストのハイライト
  highlightSelection() {
    const selection = window.getSelection();
    if (selection && selection.toString()) {
      const color = this.api.getPluginStorage('highlightColor') || '#ffeb3b';
      // ハイライト処理（実際の実装では、エディタAPIを使用）
      this.api.showNotification('テキストをハイライトしました', 'success');
    }
  },
  
  // 選択変更時のハンドラ
  onSelectionChange(data) {
    console.log('Selection changed:', data);
  }
};
`.trim()

    setManifestJson(JSON.stringify(sampleManifest, null, 2))
    setPluginCode(sampleCode)
  }

  return (
    <div className="space-y-6">
      {/* 説明 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">カスタムプラグインの開発</h3>
        <p className="text-gray-600 mb-4">
          独自のプラグインを作成して、エディタの機能を拡張できます。
          プラグインコードとマニフェストファイルを入力してインストールしてください。
        </p>
        <button onClick={generateSamplePlugin} className="text-blue-600 hover:text-blue-800">
          サンプルプラグインを生成
        </button>
      </div>

      {/* マニフェスト入力 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="font-semibold mb-2 flex items-center">
          <CodeBracketIcon className="w-5 h-5 mr-2" />
          プラグインマニフェスト (manifest.json)
        </h4>
        <textarea
          className="w-full h-48 p-3 border border-gray-300 rounded font-mono text-sm"
          placeholder={`{
  "main": "MyPlugin",
  "permissions": ["read:chapters", "ui:toolbar"],
  "settings": [],
  "commands": [],
  "hooks": []
}`}
          value={manifestJson}
          onChange={(e) => setManifestJson(e.target.value)}
        />
      </div>

      {/* プラグインコード入力 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h4 className="font-semibold mb-2 flex items-center">
          <CodeBracketIcon className="w-5 h-5 mr-2" />
          プラグインコード (JavaScript)
        </h4>
        <textarea
          className="w-full h-64 p-3 border border-gray-300 rounded font-mono text-sm"
          placeholder={`const MyPlugin = {
  async activate(api) {
    // プラグインの初期化コード
  },
  
  async deactivate() {
    // プラグインの終了処理
  }
};`}
          value={pluginCode}
          onChange={(e) => setPluginCode(e.target.value)}
        />
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* インストールボタン */}
      <div className="flex justify-end">
        <button
          onClick={handleInstall}
          disabled={!pluginCode.trim() || !manifestJson.trim() || installing}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-300"
        >
          {installing ? 'インストール中...' : 'プラグインをインストール'}
        </button>
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-amber-800 mb-2">プラグイン開発時の注意事項</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• プラグインは信頼できるソースからのみインストールしてください</li>
          <li>• 権限設定を適切に行い、必要最小限の権限のみを要求してください</li>
          <li>• エラーハンドリングを適切に実装してください</li>
          <li>• プラグインAPIの仕様に従って実装してください</li>
        </ul>
      </div>
    </div>
  )
}
