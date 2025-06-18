import { Chapter, Character } from '../types/project'
import { WritingSession, DailyStats, TextAnalysis, CharacterAppearance } from '../types/statistics'

// 文字数をカウント（スペースを除く）
export const countCharacters = (text: string): number => {
  return text.replace(/\s/g, '').length
}

// 単語数をカウント
export const countWords = (text: string): number => {
  // 日本語の場合、形態素解析が必要ですが、簡易的に実装
  const japaneseWords = text.match(/[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]+/g) || []
  const englishWords = text.match(/[a-zA-Z]+/g) || []
  return japaneseWords.length + englishWords.length
}

// 文字種別の割合を計算
export const analyzeCharacterTypes = (
  text: string
): {
  kanji: number
  hiragana: number
  katakana: number
  other: number
} => {
  const chars = text.replace(/\s/g, '')
  const total = chars.length
  if (total === 0) return { kanji: 0, hiragana: 0, katakana: 0, other: 0 }

  const kanjiCount = (chars.match(/[\u4e00-\u9faf]/g) || []).length
  const hiraganaCount = (chars.match(/[\u3040-\u309f]/g) || []).length
  const katakanaCount = (chars.match(/[\u30a0-\u30ff]/g) || []).length

  return {
    kanji: kanjiCount / total,
    hiragana: hiraganaCount / total,
    katakana: katakanaCount / total,
    other: (total - kanjiCount - hiraganaCount - katakanaCount) / total,
  }
}

// 会話文の割合を計算
export const analyzeDialogueRatio = (text: string): number => {
  const dialogues = text.match(/「[^」]*」/g) || []
  const dialogueLength = dialogues.join('').length
  const totalLength = text.length
  return totalLength > 0 ? dialogueLength / totalLength : 0
}

// 頻出単語を分析
export const analyzeFrequentWords = (
  text: string,
  limit: number = 10
): Array<{ word: string; count: number }> => {
  const words = text.match(/[\u4e00-\u9faf\u3040-\u309f\u30a0-\u30ff]{2,}/g) || []
  const wordCount = new Map<string, number>()

  // 除外する一般的な単語
  const excludedWords = new Set(['する', 'いる', 'ある', 'なる', 'それ', 'これ', 'その', 'この'])

  words.forEach((word) => {
    if (!excludedWords.has(word)) {
      wordCount.set(word, (wordCount.get(word) || 0) + 1)
    }
  })

  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([word, count]) => ({ word, count }))
}

// 頻出漢字を分析
export const analyzeFrequentKanji = (
  text: string,
  limit: number = 10
): Array<{ kanji: string; count: number }> => {
  const kanjis = text.match(/[\u4e00-\u9faf]/g) || []
  const kanjiCount = new Map<string, number>()

  kanjis.forEach((kanji) => {
    kanjiCount.set(kanji, (kanjiCount.get(kanji) || 0) + 1)
  })

  return Array.from(kanjiCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([kanji, count]) => ({ kanji, count }))
}

// テキスト分析を実行
export const analyzeText = (text: string): TextAnalysis => {
  const charTypes = analyzeCharacterTypes(text)
  const sentences = text.split(/[。！？]/).filter((s) => s.trim().length > 0)
  const averageSentenceLength =
    sentences.length > 0 ? sentences.reduce((sum, s) => sum + s.length, 0) / sentences.length : 0

  return {
    totalCharacters: countCharacters(text),
    kanjiRatio: charTypes.kanji,
    hiraganaRatio: charTypes.hiragana,
    katakanaRatio: charTypes.katakana,
    averageSentenceLength,
    dialogueRatio: analyzeDialogueRatio(text),
    frequentWords: analyzeFrequentWords(text),
    frequentKanji: analyzeFrequentKanji(text),
    readabilityScore: calculateReadabilityScore(charTypes.kanji, averageSentenceLength),
  }
}

// 読みやすさスコアを計算（簡易版）
const calculateReadabilityScore = (kanjiRatio: number, avgSentenceLength: number): number => {
  // 漢字率が低く、文長が適度な場合に高スコア
  const kanjiScore = Math.max(0, 100 - kanjiRatio * 200) // 漢字率50%で0点
  const lengthScore = Math.max(0, 100 - Math.abs(avgSentenceLength - 40) * 2) // 40文字が理想
  return Math.round((kanjiScore + lengthScore) / 2)
}

// キャラクターの登場回数を分析
export const analyzeCharacterAppearances = (
  chapters: Chapter[],
  characters: Character[]
): CharacterAppearance[] => {
  return characters.map((character) => {
    const appearances: Array<{ chapterId: string; count: number }> = []
    let firstAppearance: { chapterId: string; chapterTitle: string } | undefined
    let lastAppearance: { chapterId: string; chapterTitle: string } | undefined

    chapters.forEach((chapter) => {
      const count = (chapter.content.match(new RegExp(character.name, 'g')) || []).length
      if (count > 0) {
        appearances.push({ chapterId: chapter.id, count })
        if (!firstAppearance) {
          firstAppearance = { chapterId: chapter.id, chapterTitle: chapter.title }
        }
        lastAppearance = { chapterId: chapter.id, chapterTitle: chapter.title }
      }
    })

    return {
      characterId: character.id,
      characterName: character.name,
      totalAppearances: appearances.reduce((sum, a) => sum + a.count, 0),
      chapterAppearances: appearances,
      firstAppearance,
      lastAppearance,
    }
  })
}

// 日次統計を集計
export const aggregateDailyStats = (sessions: WritingSession[]): DailyStats[] => {
  const dailyMap = new Map<string, DailyStats>()

  sessions.forEach((session) => {
    const date = new Date(session.startTime).toISOString().split('T')[0]
    const existing = dailyMap.get(date) || {
      date,
      totalWords: 0,
      wordsAdded: 0,
      wordsDeleted: 0,
      sessionsCount: 0,
      totalDuration: 0,
      chapters: [],
    }

    existing.wordsAdded += session.wordsAdded
    existing.wordsDeleted += session.wordsDeleted
    existing.sessionsCount += 1
    existing.totalDuration += session.duration
    existing.totalWords = session.finalWordCount
    if (session.chapterId && !existing.chapters.includes(session.chapterId)) {
      existing.chapters.push(session.chapterId)
    }

    dailyMap.set(date, existing)
  })

  return Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date))
}

// 執筆ストリークを計算
export const calculateStreaks = (
  dailyStats: DailyStats[]
): { current: number; longest: number } => {
  if (dailyStats.length === 0) return { current: 0, longest: 0 }

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 1

  for (let i = 1; i < dailyStats.length; i++) {
    const prevDate = new Date(dailyStats[i - 1].date)
    const currDate = new Date(dailyStats[i].date)
    const diffDays = Math.round((currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      tempStreak++
    } else {
      longestStreak = Math.max(longestStreak, tempStreak)
      tempStreak = 1
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak)

  // 現在のストリークを計算
  const today = new Date().toISOString().split('T')[0]
  const lastDate = dailyStats[dailyStats.length - 1].date
  if (lastDate === today) {
    currentStreak = tempStreak
  }

  return { current: currentStreak, longest: longestStreak }
}

// 最も生産的な時間帯を計算
export const findMostProductiveHour = (sessions: WritingSession[]): number => {
  const hourCounts = new Array(24).fill(0)

  sessions.forEach((session) => {
    const hour = new Date(session.startTime).getHours()
    hourCounts[hour] += session.wordsAdded
  })

  let maxHour = 0
  let maxCount = 0
  hourCounts.forEach((count, hour) => {
    if (count > maxCount) {
      maxCount = count
      maxHour = hour
    }
  })

  return maxHour
}

// 最も生産的な曜日を計算
export const findMostProductiveDay = (dailyStats: DailyStats[]): string => {
  const days = ['日', '月', '火', '水', '木', '金', '土']
  const dayCounts = new Array(7).fill(0)

  dailyStats.forEach((stat) => {
    const dayIndex = new Date(stat.date).getDay()
    dayCounts[dayIndex] += stat.wordsAdded
  })

  let maxDay = 0
  let maxCount = 0
  dayCounts.forEach((count, day) => {
    if (count > maxCount) {
      maxCount = count
      maxDay = day
    }
  })

  return days[maxDay]
}
