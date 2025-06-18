import { useState, useCallback } from 'react'
import { Project, Chapter, Character, Plot, WorldSetting } from '../../types/project'
import { ShareIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline'
import { useProjects } from '../../hooks/useProjects'
import { useNavigate } from 'react-router-dom'

interface ProjectShareProps {
  project: Project
  chapters: Chapter[]
  characters: Character[]
  plots: Plot[]
  worldSettings: WorldSetting[]
}

export default function ProjectShare({
  project,
  chapters,
  characters,
  plots,
  worldSettings,
}: ProjectShareProps) {
  const [copied, setCopied] = useState(false)
  const [showImport, setShowImport] = useState(false)
  const [importData, setImportData] = useState('')
  const [importError, setImportError] = useState('')
  const [importing, setImporting] = useState(false)
  const { importProject } = useProjects()
  const navigate = useNavigate()

  // プロジェクトデータを生成
  const generateShareData = useCallback(() => {
    const shareData = {
      version: '1.0',
      project,
      chapters,
      characters,
      plots,
      worldSettings,
      exportedAt: new Date().toISOString(),
    }
    return JSON.stringify(shareData, null, 2)
  }, [project, chapters, characters, plots, worldSettings])

  // クリップボードにコピー
  const copyToClipboard = useCallback(async () => {
    try {
      const data = generateShareData()
      await navigator.clipboard.writeText(data)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    } catch (error) {
      console.error('Failed to copy:', error)
      alert('クリップボードへのコピーに失敗しました')
    }
  }, [generateShareData])

  // ファイルとして保存
  const saveAsFile = useCallback(() => {
    const data = generateShareData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.title}_share_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [generateShareData, project.title])

  return (
    <div className="space-y-6">
      {/* 共有セクション */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <ShareIcon className="w-5 h-5 mr-2" />
          プロジェクトを共有
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          プロジェクトデータを他のユーザーと共有できます。共有されたデータは、相手側でインポートすることで編集可能になります。
        </p>
        <div className="flex space-x-3">
          <button
            onClick={copyToClipboard}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 mr-2" />
                コピー済み
              </>
            ) : (
              <>
                <DocumentDuplicateIcon className="w-4 h-4 mr-2" />
                データをコピー
              </>
            )}
          </button>
          <button
            onClick={saveAsFile}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
          >
            ファイルとして保存
          </button>
        </div>
      </div>

      {/* インポートセクション */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">共有データをインポート</h3>
        {!showImport ? (
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowImport(true)}
              className="text-blue-600 hover:text-blue-800"
            >
              インポート画面を開く
            </button>
            <span className="text-gray-500">または</span>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  try {
                    const text = await file.text()
                    setImportData(text)
                    setShowImport(true)
                  } catch {
                    alert('ファイルの読み込みに失敗しました')
                  }
                }}
              />
              <span className="text-blue-600 hover:text-blue-800">ファイルから読み込む</span>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <textarea
              className="w-full h-40 p-3 border border-gray-300 rounded resize-none font-mono text-sm"
              placeholder="共有されたJSONデータを貼り付けてください..."
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
            />
            <div className="flex space-x-3">
              <button
                onClick={async () => {
                  setImporting(true)
                  setImportError('')

                  try {
                    // JSONデータをパース
                    const shareData = JSON.parse(importData)

                    // バージョンチェック
                    if (!shareData.version || shareData.version !== '1.0') {
                      throw new Error('共有データのバージョンが不正です')
                    }

                    // 必要なフィールドの存在チェック
                    if (
                      !shareData.project ||
                      !shareData.chapters ||
                      !shareData.characters ||
                      !shareData.plots ||
                      !shareData.worldSettings
                    ) {
                      throw new Error('共有データの形式が不正です')
                    }

                    // インポート実行
                    const result = await importProject(shareData)

                    if (result.success) {
                      alert('プロジェクトのインポートが完了しました')
                      // エディタページへ遷移
                      navigate('/editor')
                    } else {
                      setImportError(result.error || 'インポートに失敗しました')
                    }
                  } catch (error) {
                    if (error instanceof SyntaxError) {
                      setImportError('無効なJSONデータです。正しい形式のデータを貼り付けてください')
                    } else if (error instanceof Error) {
                      setImportError(error.message)
                    } else {
                      setImportError('予期しないエラーが発生しました')
                    }
                  } finally {
                    setImporting(false)
                  }
                }}
                disabled={!importData.trim() || importing}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300"
              >
                {importing ? 'インポート中...' : 'インポート'}
              </button>
              <button
                onClick={() => {
                  setShowImport(false)
                  setImportData('')
                  setImportError('')
                }}
                disabled={importing}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                キャンセル
              </button>
            </div>
            {importError && <p className="text-red-600 text-sm mt-2">{importError}</p>}
          </div>
        )}
      </div>

      {/* 注意事項 */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-amber-800 mb-2">共同執筆時の注意事項</h4>
        <ul className="text-sm text-amber-700 space-y-1">
          <li>• 同じ部分を同時に編集すると、後から保存した内容で上書きされます</li>
          <li>• 定期的にバックアップを取ることをお勧めします</li>
          <li>• 大きな変更を加える前に、他の執筆者と連絡を取り合ってください</li>
          <li>• バージョン管理機能を活用して、変更履歴を追跡してください</li>
        </ul>
      </div>
    </div>
  )
}
