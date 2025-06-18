import { VersionDiff } from '../types/version'

export function calculateDiff(oldContent: string, newContent: string): VersionDiff {
  const oldLines = oldContent.split('\n')
  const newLines = newContent.split('\n')

  const changes: VersionDiff['changes'] = []
  let additions = 0
  let deletions = 0

  // Simple line-by-line diff (実際のプロダクションではより高度なアルゴリズムを使用)
  const maxLength = Math.max(oldLines.length, newLines.length)

  for (let i = 0; i < maxLength; i++) {
    const oldLine = oldLines[i]
    const newLine = newLines[i]

    if (oldLine === undefined && newLine !== undefined) {
      // 追加された行
      changes.push({
        type: 'add',
        lineNumber: i + 1,
        content: newLine,
      })
      additions++
    } else if (oldLine !== undefined && newLine === undefined) {
      // 削除された行
      changes.push({
        type: 'delete',
        lineNumber: i + 1,
        content: oldLine,
      })
      deletions++
    } else if (oldLine !== newLine) {
      // 変更された行
      changes.push({
        type: 'delete',
        lineNumber: i + 1,
        content: oldLine || '',
      })
      changes.push({
        type: 'add',
        lineNumber: i + 1,
        content: newLine || '',
      })
      additions++
      deletions++
    }
  }

  return { additions, deletions, changes }
}

export function applyDiff(content: string, diff: VersionDiff): string {
  const lines = content.split('\n')
  const result: string[] = [...lines]

  // 逆順で処理することで行番号のズレを防ぐ
  const sortedChanges = [...diff.changes].sort((a, b) => b.lineNumber - a.lineNumber)

  for (const change of sortedChanges) {
    const lineIndex = change.lineNumber - 1

    if (change.type === 'add') {
      result.splice(lineIndex, 0, change.content)
    } else if (change.type === 'delete') {
      result.splice(lineIndex, 1)
    }
  }

  return result.join('\n')
}

export function formatDiff(diff: VersionDiff): string {
  let output = `変更統計: +${diff.additions} -${diff.deletions}\n\n`

  for (const change of diff.changes) {
    const prefix = change.type === 'add' ? '+' : '-'
    output += `${prefix} ${change.lineNumber}: ${change.content}\n`
  }

  return output
}
