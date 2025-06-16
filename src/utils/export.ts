import { Project, Chapter, ExportSettings, Character, WorldSetting } from '../types/project'

export class ExportManager {
  static exportToKakuyomu(project: Project, chapters: Chapter[], settings: ExportSettings): string {
    let output = ''

    // タイトルとあらすじ
    output += `【タイトル】\n${project.title}\n\n`
    output += `【あらすじ】\n${project.synopsis}\n\n`
    output += `【ジャンル】\n${project.genre}\n\n`
    output += `【タグ】\n${project.tags.join('、')}\n\n`
    output += '='.repeat(50) + '\n\n'

    // 各話のエクスポート
    const sortedChapters = [...chapters].sort((a, b) => a.order - b.order)

    sortedChapters.forEach((chapter, index) => {
      if (settings.includeChapterNumbers) {
        output += `第${index + 1}話 ${chapter.title}\n\n`
      } else {
        output += `${chapter.title}\n\n`
      }

      // カクヨムではルビ記法は《》で表現
      let content = chapter.content
      if (settings.rubyFormat === 'html') {
        content = content.replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, '|$1《$2》')
      }

      // 改行の調整
      if (settings.lineBreakType === 'web') {
        content = content.replace(/\n/g, '\n\n')
      }

      output += content + '\n\n'

      if (settings.includeAuthorNotes && chapter.notes) {
        output += `【作者メモ】\n${chapter.notes}\n\n`
      }

      output += '='.repeat(50) + '\n\n'
    })

    return output
  }

  static exportToNarou(project: Project, chapters: Chapter[], settings: ExportSettings): string {
    let output = ''

    // タイトル
    output += `${project.title}\n\n`

    // あらすじ
    output += `【あらすじ】\n${project.synopsis}\n\n`
    output += '-'.repeat(50) + '\n\n'

    // 各話のエクスポート
    const sortedChapters = [...chapters].sort((a, b) => a.order - b.order)

    sortedChapters.forEach((chapter, index) => {
      if (settings.includeChapterNumbers) {
        output += `第${index + 1}話 ${chapter.title}\n\n`
      } else {
        output += `${chapter.title}\n\n`
      }

      // なろうではルビ記法は|で表現
      let content = chapter.content
      if (settings.rubyFormat === 'html') {
        content = content.replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, '|$1《$2》')
      }

      // 改行の調整
      if (settings.lineBreakType === 'web') {
        content = content.replace(/\n/g, '\n\n')
      }

      output += content + '\n\n'

      if (settings.includeAuthorNotes && chapter.notes) {
        output += `※${chapter.notes}\n\n`
      }

      output += '-'.repeat(50) + '\n\n'
    })

    return output
  }

  static exportToText(project: Project, chapters: Chapter[], settings: ExportSettings): string {
    let output = ''

    // プロジェクト情報
    output += `タイトル: ${project.title}\n`
    output += `作者: ${project.author}\n`
    output += `ジャンル: ${project.genre}\n`
    output += `タグ: ${project.tags.join('、')}\n`
    output += `ステータス: ${project.status === 'completed' ? '完結' : project.status === 'writing' ? '執筆中' : '下書き'}\n\n`

    output += `あらすじ:\n${project.synopsis}\n\n`
    output += '='.repeat(70) + '\n\n'

    // 各話のエクスポート
    const sortedChapters = [...chapters].sort((a, b) => a.order - b.order)

    sortedChapters.forEach((chapter, index) => {
      if (settings.includeChapterNumbers) {
        output += `第${index + 1}話 ${chapter.title}\n`
      } else {
        output += `${chapter.title}\n`
      }
      output += '-'.repeat(50) + '\n\n'

      // ルビの処理
      let content = chapter.content
      if (settings.rubyFormat === 'text') {
        content = content.replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, '$1（$2）')
      } else if (settings.rubyFormat === 'none') {
        content = content.replace(/<ruby>(.*?)<rt>(.*?)<\/rt><\/ruby>/g, '$1')
      }

      output += content + '\n\n'

      if (settings.includeAuthorNotes && chapter.notes) {
        output += `【メモ】\n${chapter.notes}\n\n`
      }

      output += `文字数: ${chapter.wordCount}文字\n`
      output += '='.repeat(70) + '\n\n'
    })

    // 総文字数
    const totalWordCount = sortedChapters.reduce((sum, chapter) => sum + chapter.wordCount, 0)
    output += `総文字数: ${totalWordCount}文字\n`

    return output
  }

  static exportToJSON(
    project: Project,
    chapters: Chapter[],
    characters: Character[],
    worldSettings: WorldSetting[]
  ): string {
    const exportData = {
      project,
      chapters: chapters.sort((a, b) => a.order - b.order),
      characters,
      worldSettings,
      exportDate: new Date().toISOString(),
      version: '1.0.0',
    }

    return JSON.stringify(exportData, null, 2)
  }

  static downloadFile(filename: string, content: string, mimeType: string = 'text/plain') {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }
}
