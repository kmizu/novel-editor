import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import { useChapters } from '../hooks/useChapters'
import { useCharacters } from '../hooks/useCharacters'
import { useWorldSettings } from '../hooks/useWorldSettings'
import { ExportManager } from '../utils/export'
import { ExportSettings } from '../types/project'
import { storage } from '../utils/storage'

export default function ExportPage() {
  const { currentProject } = useProjects()
  const { chapters } = useChapters(currentProject?.id || null)
  const { characters } = useCharacters()
  const { worldSettings } = useWorldSettings()

  const [exportSettings, setExportSettings] = useState<ExportSettings>({
    format: 'kakuyomu',
    includeChapterNumbers: true,
    includeAuthorNotes: false,
    lineBreakType: 'web',
    rubyFormat: 'html',
  })

  if (!currentProject) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">プロジェクトを選択してください</p>
      </div>
    )
  }

  const handleExport = (format: ExportSettings['format']) => {
    const settings = { ...exportSettings, format }
    let content = ''
    let filename = ''

    const projectData = storage.getProject(currentProject.id)
    if (!projectData) return

    switch (format) {
      case 'kakuyomu':
        content = ExportManager.exportToKakuyomu(currentProject, chapters, settings)
        filename = `${currentProject.title}_kakuyomu.txt`
        break
      case 'narou':
        content = ExportManager.exportToNarou(currentProject, chapters, settings)
        filename = `${currentProject.title}_narou.txt`
        break
      case 'text':
        content = ExportManager.exportToText(currentProject, chapters, settings)
        filename = `${currentProject.title}.txt`
        break
      case 'epub':
        // EPUB形式は将来実装
        alert('EPUB形式のエクスポートは現在開発中です')
        return
    }

    ExportManager.downloadFile(filename, content)
  }

  const handleBackup = () => {
    const projectData = storage.getProject(currentProject.id)
    if (!projectData) return

    const content = ExportManager.exportToJSON(currentProject, chapters, characters, worldSettings)
    const filename = `${currentProject.title}_backup_${new Date().toISOString().split('T')[0]}.json`
    ExportManager.downloadFile(filename, content, 'application/json')
  }

  const totalWordCount = chapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">エクスポート</h1>
        <p className="mt-1 text-sm text-gray-600">
          プロジェクト「{currentProject.title}」をエクスポートします
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">エクスポート設定</h2>

        <div className="space-y-4">
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportSettings.includeChapterNumbers}
                onChange={(e) =>
                  setExportSettings({ ...exportSettings, includeChapterNumbers: e.target.checked })
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2">話数を含める</span>
            </label>
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={exportSettings.includeAuthorNotes}
                onChange={(e) =>
                  setExportSettings({ ...exportSettings, includeAuthorNotes: e.target.checked })
                }
                className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="ml-2">作者メモを含める</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">改行タイプ</label>
            <select
              value={exportSettings.lineBreakType}
              onChange={(e) =>
                setExportSettings({
                  ...exportSettings,
                  lineBreakType: e.target.value as 'web' | 'print',
                })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="web">Web投稿用（段落間に空行）</option>
              <option value="print">印刷用（段落間に空行なし）</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ルビ形式</label>
            <select
              value={exportSettings.rubyFormat}
              onChange={(e) =>
                setExportSettings({
                  ...exportSettings,
                  rubyFormat: e.target.value as 'html' | 'text' | 'none',
                })
              }
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="html">投稿サイト用（|漢字《かんじ》）</option>
              <option value="text">テキスト用（漢字（かんじ））</option>
              <option value="none">ルビなし</option>
            </select>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-600">
            総話数: {chapters.length}話 / 総文字数: {totalWordCount.toLocaleString()}文字
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">カクヨム形式</h3>
          <p className="text-gray-600 mb-4">カクヨムに投稿できる形式でエクスポートします。</p>
          <button
            onClick={() => handleExport('kakuyomu')}
            className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
          >
            カクヨム形式でダウンロード
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">小説家になろう形式</h3>
          <p className="text-gray-600 mb-4">小説家になろうに投稿できる形式でエクスポートします。</p>
          <button
            onClick={() => handleExport('narou')}
            className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors"
          >
            なろう形式でダウンロード
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">プレーンテキスト</h3>
          <p className="text-gray-600 mb-4">シンプルなテキストファイルとしてエクスポートします。</p>
          <button
            onClick={() => handleExport('text')}
            className="w-full bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            テキストでダウンロード
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-2">バックアップ</h3>
          <p className="text-gray-600 mb-4">プロジェクト全体をJSON形式でバックアップします。</p>
          <button
            onClick={handleBackup}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            バックアップをダウンロード
          </button>
        </div>
      </div>
    </div>
  )
}
