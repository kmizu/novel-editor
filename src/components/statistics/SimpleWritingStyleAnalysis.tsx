import { useMemo } from 'react'
import { analyzeText } from '../../utils/statistics'
import {
  BookOpenIcon,
  ChatBubbleBottomCenterTextIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline'

interface WritingStyleAnalysisProps {
  text: string
}

export default function SimpleWritingStyleAnalysis({ text }: WritingStyleAnalysisProps) {
  const analysis = useMemo(() => analyzeText(text), [text])

  const charTypeData = useMemo(
    () =>
      [
        { name: '漢字', value: Math.round(analysis.kanjiRatio * 100), color: '#EF4444' },
        { name: 'ひらがな', value: Math.round(analysis.hiraganaRatio * 100), color: '#3B82F6' },
        { name: 'カタカナ', value: Math.round(analysis.katakanaRatio * 100), color: '#10B981' },
      ].filter((item) => item.value > 0),
    [analysis]
  )

  return (
    <div className="space-y-6">
      {/* 読みやすさスコア */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <BookOpenIcon className="w-5 h-5 mr-2" />
          読みやすさ分析
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{analysis.readabilityScore}</div>
            <div className="text-sm text-gray-600">読みやすさスコア</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold">{Math.round(analysis.kanjiRatio * 100)}%</div>
            <div className="text-sm text-gray-600">漢字率</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold">
              {Math.round(analysis.averageSentenceLength)}
            </div>
            <div className="text-sm text-gray-600">平均文長</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-semibold">
              {analysis.totalCharacters.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">総文字数</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 文字種別の割合 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <LanguageIcon className="w-5 h-5 mr-2" />
            文字種別の割合
          </h3>
          <div className="space-y-3">
            {charTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{item.name}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{item.value}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 会話文と地の文の割合 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <ChatBubbleBottomCenterTextIcon className="w-5 h-5 mr-2" />
            文章構成
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">会話文</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="h-2 rounded-full bg-amber-500"
                    style={{ width: `${Math.round(analysis.dialogueRatio * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {Math.round(analysis.dialogueRatio * 100)}%
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">地の文</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                  <div
                    className="h-2 rounded-full bg-indigo-500"
                    style={{ width: `${Math.round((1 - analysis.dialogueRatio) * 100)}%` }}
                  />
                </div>
                <span className="text-sm font-medium w-12 text-right">
                  {Math.round((1 - analysis.dialogueRatio) * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 頻出単語 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">頻出単語 TOP10</h3>
          <div className="space-y-2">
            {analysis.frequentWords.length === 0 ? (
              <p className="text-gray-500 text-center py-4">分析するテキストが不足しています</p>
            ) : (
              analysis.frequentWords.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}. {item.word}
                  </span>
                  <span className="text-sm text-gray-600">{item.count}回</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 頻出漢字 */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">頻出漢字 TOP10</h3>
          <div className="space-y-2">
            {analysis.frequentKanji.length === 0 ? (
              <p className="text-gray-500 text-center py-4">分析する漢字が不足しています</p>
            ) : (
              analysis.frequentKanji.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {index + 1}. {item.kanji}
                  </span>
                  <span className="text-sm text-gray-600">{item.count}回</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
