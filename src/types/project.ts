export interface Project {
  id: string
  title: string
  author: string
  description: string
  createdAt: string
  updatedAt: string
  synopsis: string
  genre: string
  tags: string[]
  status: 'draft' | 'writing' | 'completed'
  currentChapterId?: string
}

export interface Chapter {
  id: string
  projectId: string
  title: string
  content: string
  order: number
  createdAt: string
  updatedAt: string
  wordCount: number
  notes: string
  status: 'draft' | 'writing' | 'review' | 'completed'
}

export interface Plot {
  id: string
  projectId: string
  title: string
  content: string
  type: 'main' | 'sub' | 'chapter'
  chapterId?: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Character {
  id: string
  projectId: string
  name: string
  furigana?: string
  age?: number
  gender?: string
  role: 'protagonist' | 'antagonist' | 'main' | 'support' | 'other'
  appearance: string
  personality: string
  background: string
  relationships: CharacterRelationship[]
  notes: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

export interface CharacterRelationship {
  characterId: string
  relationshipType: string
  description: string
}

export interface WorldSetting {
  id: string
  projectId: string
  category: 'geography' | 'history' | 'culture' | 'politics' | 'magic' | 'technology' | 'other'
  title: string
  content: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Memo {
  id: string
  projectId: string
  chapterId?: string
  title: string
  content: string
  type: 'idea' | 'todo' | 'research' | 'other'
  createdAt: string
  updatedAt: string
}

export interface ExportSettings {
  format: 'kakuyomu' | 'narou' | 'text' | 'epub'
  includeChapterNumbers: boolean
  includeAuthorNotes: boolean
  lineBreakType: 'web' | 'print'
  rubyFormat: 'html' | 'text' | 'none'
}
