export interface Version {
  id: string
  entityId: string
  entityType: 'chapter' | 'plot' | 'character' | 'worldSetting'
  content: string
  metadata?: Record<string, unknown>
  createdAt: string
  message?: string
  tags?: string[]
  author?: string
  diff?: VersionDiff
}

export interface VersionDiff {
  additions: number
  deletions: number
  changes: Array<{
    type: 'add' | 'delete' | 'modify'
    lineNumber: number
    content: string
  }>
}

export interface VersionHistory {
  entityId: string
  entityType: Version['entityType']
  versions: Version[]
  currentVersionId?: string
}

export interface VersionSettings {
  autoSave: boolean
  autoSaveInterval: number // minutes
  maxVersions: number
  compressOldVersions: boolean
  minChangeSize: number // minimum characters changed to create a version
}

export const defaultVersionSettings: VersionSettings = {
  autoSave: true,
  autoSaveInterval: 10,
  maxVersions: 50,
  compressOldVersions: false,
  minChangeSize: 100,
}
