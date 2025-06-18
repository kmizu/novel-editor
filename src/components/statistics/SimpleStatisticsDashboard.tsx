import { useMemo } from 'react'
import { WritingSession } from '../../types/statistics'
import {
  aggregateDailyStats,
  calculateStreaks,
  findMostProductiveHour,
  findMostProductiveDay,
} from '../../utils/statistics'
import {
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

interface StatisticsDashboardProps {
  sessions: WritingSession[]
  totalWords: number
  totalChapters: number
}

export default function SimpleStatisticsDashboard({
  sessions,
  totalWords,
  totalChapters,
}: StatisticsDashboardProps) {
  const dailyStats = useMemo(() => aggregateDailyStats(sessions), [sessions])
  const streaks = useMemo(() => calculateStreaks(dailyStats), [dailyStats])
  const mostProductiveHour = useMemo(() => findMostProductiveHour(sessions), [sessions])
  const mostProductiveDay = useMemo(() => findMostProductiveDay(dailyStats), [dailyStats])

  const stats = useMemo(() => {
    const totalDays = dailyStats.length
    const averageWordsPerDay = totalDays > 0 ? Math.round(totalWords / totalDays) : 0
    return {
      totalWords,
      totalChapters,
      totalDays,
      averageWordsPerDay,
      longestStreak: streaks.longest,
      currentStreak: streaks.current,
      mostProductiveHour,
      mostProductiveDay,
    }
  }, [totalWords, totalChapters, dailyStats.length, streaks, mostProductiveHour, mostProductiveDay])

  // 最近7日間の執筆データ
  const recentDays = useMemo(() => {
    return dailyStats.slice(-7).map((stat) => ({
      date: new Date(stat.date).toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      words: stat.wordsAdded,
    }))
  }, [dailyStats])

  return (
    <div className="space-y-6">
      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<DocumentTextIcon className="w-6 h-6" />}
          label="総文字数"
          value={stats.totalWords.toLocaleString()}
          subLabel="文字"
          color="blue"
        />
        <StatCard
          icon={<CalendarIcon className="w-6 h-6" />}
          label="執筆日数"
          value={stats.totalDays.toString()}
          subLabel={`平均 ${stats.averageWordsPerDay.toLocaleString()} 文字/日`}
          color="green"
        />
        <StatCard
          icon={<ChartBarIcon className="w-6 h-6" />}
          label="連続執筆"
          value={stats.currentStreak.toString()}
          subLabel={`最長 ${stats.longestStreak} 日`}
          color="amber"
        />
        <StatCard
          icon={<ClockIcon className="w-6 h-6" />}
          label="最も生産的"
          value={`${stats.mostProductiveHour}時台`}
          subLabel={`${stats.mostProductiveDay}曜日`}
          color="purple"
        />
      </div>

      {/* 最近の執筆履歴 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">最近7日間の執筆履歴</h3>
        <div className="space-y-3">
          {recentDays.length === 0 ? (
            <p className="text-gray-500 text-center py-4">執筆データがありません</p>
          ) : (
            recentDays.map((day, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{day.date}</span>
                <div className="flex items-center">
                  <div className="w-32 bg-gray-200 rounded-full h-2 mr-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, (day.words / 2000) * 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-20 text-right">
                    {day.words.toLocaleString()}字
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 統計サマリー */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">執筆統計サマリー</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">日別統計</h4>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">総執筆日数</dt>
                <dd className="text-sm font-medium">{stats.totalDays}日</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">平均文字数/日</dt>
                <dd className="text-sm font-medium">
                  {stats.averageWordsPerDay.toLocaleString()}文字
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">最長連続執筆</dt>
                <dd className="text-sm font-medium">{stats.longestStreak}日</dd>
              </div>
            </dl>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">執筆パターン</h4>
            <dl className="space-y-1">
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">最も生産的な時間帯</dt>
                <dd className="text-sm font-medium">{stats.mostProductiveHour}時台</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">最も生産的な曜日</dt>
                <dd className="text-sm font-medium">{stats.mostProductiveDay}曜日</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-sm text-gray-600">総章数</dt>
                <dd className="text-sm font-medium">{stats.totalChapters}章</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string
  subLabel: string
  color: 'blue' | 'green' | 'amber' | 'purple'
}

function StatCard({ icon, label, value, subLabel, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    amber: 'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{subLabel}</p>
    </div>
  )
}
