/**
 * Tauri invoke ラッパー
 * 全ての Tauri コマンド呼び出しをここに集約する
 * テスト時はこのモジュールをまるごとモック可能
 */
import { invoke } from '@tauri-apps/api/core'
import type {
  ProjectMeta,
  CreateProjectInput,
  UpdateProjectInput,
  ChapterMeta,
  Chapter,
  CreateChapterInput,
  UpdateChapterMetaInput,
  Character,
  SaveCharacterInput,
  WorldSetting,
  SaveWorldSettingInput,
  Plot,
  SavePlotInput,
  ExportSettings,
} from '../types'

export const api = {
  // ============================================================
  // プロジェクト
  // ============================================================
  listProjects: (): Promise<ProjectMeta[]> =>
    invoke('list_projects'),

  createProject: (input: CreateProjectInput): Promise<ProjectMeta> =>
    invoke('create_project', { input }),

  updateProjectMeta: (projectId: string, updates: UpdateProjectInput): Promise<ProjectMeta> =>
    invoke('update_project_meta', { projectId, updates }),

  deleteProject: (projectId: string): Promise<void> =>
    invoke('delete_project', { projectId }),

  // ============================================================
  // 章
  // ============================================================
  listChapters: (projectId: string): Promise<ChapterMeta[]> =>
    invoke('list_chapters', { projectId }),

  readChapter: (projectId: string, chapterId: string): Promise<Chapter> =>
    invoke('read_chapter', { projectId, chapterId }),

  createChapter: (projectId: string, input: CreateChapterInput): Promise<ChapterMeta> =>
    invoke('create_chapter', { projectId, input }),

  saveChapterContent: (projectId: string, chapterId: string, content: string): Promise<ChapterMeta> =>
    invoke('save_chapter_content', { projectId, chapterId, content }),

  updateChapterMeta: (projectId: string, chapterId: string, updates: UpdateChapterMetaInput): Promise<ChapterMeta> =>
    invoke('update_chapter_meta', { projectId, chapterId, updates }),

  deleteChapter: (projectId: string, chapterId: string): Promise<void> =>
    invoke('delete_chapter', { projectId, chapterId }),

  reorderChapters: (projectId: string, chapterIds: string[]): Promise<void> =>
    invoke('reorder_chapters', { projectId, chapterIds }),

  // ============================================================
  // キャラクター
  // ============================================================
  listCharacters: (projectId: string): Promise<Character[]> =>
    invoke('list_characters', { projectId }),

  saveCharacter: (projectId: string, input: SaveCharacterInput): Promise<Character> =>
    invoke('save_character', { projectId, input }),

  deleteCharacter: (projectId: string, characterId: string): Promise<void> =>
    invoke('delete_character', { projectId, characterId }),

  // ============================================================
  // 世界観設定
  // ============================================================
  listWorldSettings: (projectId: string): Promise<WorldSetting[]> =>
    invoke('list_world_settings', { projectId }),

  saveWorldSetting: (projectId: string, input: SaveWorldSettingInput): Promise<WorldSetting> =>
    invoke('save_world_setting', { projectId, input }),

  deleteWorldSetting: (projectId: string, settingId: string): Promise<void> =>
    invoke('delete_world_setting', { projectId, settingId }),

  // ============================================================
  // プロット
  // ============================================================
  listPlots: (projectId: string): Promise<Plot[]> =>
    invoke('list_plots', { projectId }),

  savePlot: (projectId: string, input: SavePlotInput): Promise<Plot> =>
    invoke('save_plot', { projectId, input }),

  deletePlot: (projectId: string, plotId: string): Promise<void> =>
    invoke('delete_plot', { projectId, plotId }),

  reorderPlots: (projectId: string, plotIds: string[]): Promise<void> =>
    invoke('reorder_plots', { projectId, plotIds }),

  // ============================================================
  // エクスポート
  // ============================================================
  getExportContent: (projectId: string, settings: ExportSettings): Promise<string> =>
    invoke('get_export_content', { projectId, settings }),
} as const
