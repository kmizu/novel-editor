// ============================================================
// データモデル — Rust の models/ と 1:1 対応
// ============================================================

export type ProjectStatus = 'draft' | 'writing' | 'completed'
export type ChapterStatus = 'draft' | 'writing' | 'review' | 'completed'
export type CharacterRole = 'protagonist' | 'antagonist' | 'main' | 'support' | 'other'
export type WorldCategory = 'geography' | 'history' | 'culture' | 'politics' | 'magic' | 'technology' | 'other'
export type PlotType = 'main' | 'sub' | 'chapter'
export type WritingMode = 'horizontal' | 'vertical'
export type FontStyle = 'mincho' | 'gothic'
export type ExportFormat = 'kakuyomu' | 'narou' | 'text' | 'json'

// ============================================================
// プロジェクト
// ============================================================
export interface ProjectMeta {
  id: string
  title: string
  author: string
  description: string
  synopsis: string
  genre: string
  tags: string[]
  status: ProjectStatus
  totalWordCount: number
  chapterCount: number
  createdAt: string
  updatedAt: string
}

export interface CreateProjectInput {
  title: string
  author: string
  description?: string
  synopsis?: string
  genre?: string
  tags?: string[]
}

export interface UpdateProjectInput {
  title?: string
  author?: string
  description?: string
  synopsis?: string
  genre?: string
  tags?: string[]
  status?: ProjectStatus
}

// ============================================================
// 章
// ============================================================
export interface ChapterMeta {
  id: string
  projectId: string
  title: string
  order: number
  wordCount: number
  status: ChapterStatus
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Chapter extends ChapterMeta {
  content: string
}

export interface CreateChapterInput {
  title: string
}

export interface UpdateChapterMetaInput {
  title?: string
  status?: ChapterStatus
  notes?: string
}

// ============================================================
// キャラクター
// ============================================================
export interface CharacterRelationship {
  characterId: string
  relationshipType: string
  description: string
}

export interface Character {
  id: string
  projectId: string
  name: string
  furigana: string
  age: string
  gender: string
  role: CharacterRole
  appearance: string
  personality: string
  background: string
  relationships: CharacterRelationship[]
  notes: string
  createdAt: string
  updatedAt: string
}

export interface SaveCharacterInput {
  id?: string
  name: string
  furigana?: string
  age?: string
  gender?: string
  role: CharacterRole
  appearance?: string
  personality?: string
  background?: string
  relationships?: CharacterRelationship[]
  notes?: string
}

// ============================================================
// 世界観設定
// ============================================================
export interface WorldSetting {
  id: string
  projectId: string
  category: WorldCategory
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface SaveWorldSettingInput {
  id?: string
  category: WorldCategory
  title: string
  content: string
  tags?: string[]
}

// ============================================================
// プロット
// ============================================================
export interface Plot {
  id: string
  projectId: string
  title: string
  content: string
  plotType: PlotType
  chapterId: string | null
  order: number
  createdAt: string
  updatedAt: string
}

export interface SavePlotInput {
  id?: string
  title: string
  content?: string
  plotType: PlotType
  chapterId?: string | null
}

// ============================================================
// エクスポート設定
// ============================================================
export interface ExportSettings {
  format: ExportFormat
  includeChapterNumbers: boolean
  includeAuthorNotes: boolean
  lineBreakType: 'web' | 'print'
  rubyFormat: 'html' | 'text' | 'none'
}

// ============================================================
// エディタ設定
// ============================================================
export interface EditorSettings {
  writingMode: WritingMode
  fontStyle: FontStyle
  fontSize: number
  lineHeight: number
}

export const DEFAULT_EDITOR_SETTINGS: EditorSettings = {
  writingMode: 'horizontal',
  fontStyle: 'mincho',
  fontSize: 18,
  lineHeight: 2.0,
}
