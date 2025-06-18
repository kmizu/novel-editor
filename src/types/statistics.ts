export interface WritingSession {
  id: string
  projectId: string
  chapterId?: string
  startTime: string
  endTime: string
  duration: number // minutes
  wordsAdded: number
  wordsDeleted: number
  finalWordCount: number
}

export interface DailyStats {
  date: string
  totalWords: number
  wordsAdded: number
  wordsDeleted: number
  sessionsCount: number
  totalDuration: number // minutes
  chapters: string[]
}

export interface WritingStats {
  totalWords: number
  totalChapters: number
  totalDays: number
  averageWordsPerDay: number
  longestStreak: number
  currentStreak: number
  mostProductiveHour: number
  mostProductiveDay: string // 曜日
  dailyStats: DailyStats[]
}

export interface TextAnalysis {
  totalCharacters: number
  kanjiRatio: number
  hiraganaRatio: number
  katakanaRatio: number
  averageSentenceLength: number
  dialogueRatio: number
  frequentWords: Array<{ word: string; count: number }>
  frequentKanji: Array<{ kanji: string; count: number }>
  readabilityScore: number
}

export interface CharacterAppearance {
  characterId: string
  characterName: string
  totalAppearances: number
  chapterAppearances: Array<{ chapterId: string; count: number }>
  firstAppearance?: { chapterId: string; chapterTitle: string }
  lastAppearance?: { chapterId: string; chapterTitle: string }
}

export interface PlotProgress {
  totalPlots: number
  completedPlots: number
  averageProgress: number
  plotsByType: {
    main: { total: number; completed: number; avgProgress: number }
    sub: { total: number; completed: number; avgProgress: number }
    chapter: { total: number; completed: number; avgProgress: number }
  }
}

export interface ProjectStatistics {
  projectId: string
  writingStats: WritingStats
  textAnalysis: TextAnalysis
  characterAppearances: CharacterAppearance[]
  plotProgress: PlotProgress
  lastUpdated: string
}
