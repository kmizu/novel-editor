// 型定義のエクスポート

export * from './project'
export * from './statistics'
export * from './version'

// 統合されたプロジェクト型（統計機能を含む）
import {
  Project as BaseProject,
  Chapter as BaseChapter,
  Character,
  Plot,
  WorldSetting,
  ExportSettings,
  Memo,
} from './project'

export interface Project extends Omit<BaseProject, 'synopsis'> {
  chapters: Chapter[]
  characters: Character[]
  plots?: Plot[]
  worldSettings?: {
    items: WorldSetting[]
  }
  plot?: string
  synopsis?: string
  exportSettings?: ExportSettings
  memos?: Memo[]
}

export type Chapter = BaseChapter
