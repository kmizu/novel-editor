// 執筆テンプレートの型定義

export interface WritingTemplate {
  id: string
  name: string
  description?: string
  genre: TemplateGenre
  category: TemplateCategory
  isBuiltIn: boolean // 組み込みテンプレートかカスタムテンプレートか
  createdAt: string
  updatedAt: string
  author?: string
  tags?: string[]

  // テンプレートの内容
  projectTemplate?: ProjectTemplate
  plotTemplates?: PlotTemplate[]
  chapterTemplates?: ChapterTemplate[]
  characterTemplates?: CharacterTemplate[]
  worldSettingTemplates?: WorldSettingTemplate[]
}

export type TemplateGenre =
  | 'fantasy'
  | 'scifi'
  | 'mystery'
  | 'romance'
  | 'horror'
  | 'historical'
  | 'contemporary'
  | 'lightnovel'
  | 'general'

export type TemplateCategory =
  | 'project' // プロジェクト全体のテンプレート
  | 'plot' // プロット用テンプレート
  | 'chapter' // 章構成テンプレート
  | 'character' // キャラクター設定テンプレート
  | 'world' // 世界観設定テンプレート
  | 'complete' // 全要素を含む完全テンプレート

export interface ProjectTemplate {
  title?: string
  genre?: string
  synopsis?: string
  targetAudience?: string
  estimatedLength?: number // 予定文字数
  themes?: string[]
  keywords?: string[]
}

export interface PlotTemplate {
  name: string
  description?: string
  type: 'main' | 'sub'
  structure?: PlotStructure
  keyPoints?: string[]
  conflictType?: string
}

export interface PlotStructure {
  exposition?: string // 導入
  risingAction?: string // 展開
  climax?: string // クライマックス
  fallingAction?: string // 結末への展開
  resolution?: string // 結末
}

export interface ChapterTemplate {
  order: number
  title?: string
  purpose?: string // この章の目的
  keyEvents?: string[]
  requiredElements?: string[] // 必須要素
  suggestedLength?: number // 推奨文字数
  notes?: string
}

export interface CharacterTemplate {
  name?: string
  role: CharacterRole
  archetype?: string // キャラクターアーキタイプ
  requiredTraits?: CharacterTrait[]
  backstoryPrompts?: string[]
  relationshipPrompts?: string[]
  developmentArc?: string
}

export type CharacterRole =
  | 'protagonist'
  | 'antagonist'
  | 'supporting'
  | 'mentor'
  | 'loveInterest'
  | 'comic'
  | 'other'

export interface CharacterTrait {
  category: 'personality' | 'physical' | 'background' | 'skill'
  prompt: string
  required: boolean
}

export interface WorldSettingTemplate {
  category: WorldSettingCategory
  name: string
  prompts: string[]
  requiredElements?: string[]
  exampleContent?: string
}

export type WorldSettingCategory =
  | 'geography'
  | 'history'
  | 'culture'
  | 'technology'
  | 'magic'
  | 'politics'
  | 'economy'
  | 'religion'
  | 'other'

// 組み込みテンプレートのID
export const BUILT_IN_TEMPLATE_IDS = {
  FANTASY_HERO_JOURNEY: 'fantasy-hero-journey',
  MYSTERY_DETECTIVE: 'mystery-detective',
  ROMANCE_MODERN: 'romance-modern',
  SCIFI_SPACE_OPERA: 'scifi-space-opera',
  HORROR_PSYCHOLOGICAL: 'horror-psychological',
  LIGHTNOVEL_ISEKAI: 'lightnovel-isekai',
} as const
