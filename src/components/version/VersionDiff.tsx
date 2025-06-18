import { VersionDiff as VersionDiffType } from '../../types/version'

interface VersionDiffProps {
  diff: VersionDiffType
  leftLabel?: string
  rightLabel?: string
}

export default function VersionDiff({
  diff,
  leftLabel = '前',
  rightLabel = '後',
}: VersionDiffProps) {
  const groupedChanges = diff.changes.reduce(
    (acc, change) => {
      const lastGroup = acc[acc.length - 1]
      if (lastGroup && Math.abs(lastGroup.endLine - change.lineNumber) <= 1) {
        lastGroup.endLine = change.lineNumber
        lastGroup.changes.push(change)
      } else {
        acc.push({
          startLine: change.lineNumber,
          endLine: change.lineNumber,
          changes: [change],
        })
      }
      return acc
    },
    [] as Array<{ startLine: number; endLine: number; changes: typeof diff.changes }>
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium">{leftLabel}</span>
          <span className="text-sm text-gray-500">→</span>
          <span className="text-sm font-medium">{rightLabel}</span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="text-green-600">+{diff.additions}</span>
          {' / '}
          <span className="text-red-600">-{diff.deletions}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {groupedChanges.length === 0 ? (
          <p className="text-gray-500 text-center">変更はありません</p>
        ) : (
          <div className="space-y-4">
            {groupedChanges.map((group, index) => (
              <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-100 px-3 py-1 text-xs text-gray-600">
                  @@ {group.startLine}
                  {group.startLine !== group.endLine && `,${group.endLine}`} @@
                </div>
                <div className="divide-y divide-gray-100">
                  {group.changes.map((change, changeIndex) => (
                    <div
                      key={changeIndex}
                      className={`px-3 py-1 ${
                        change.type === 'add'
                          ? 'bg-green-50 text-green-900'
                          : change.type === 'delete'
                            ? 'bg-red-50 text-red-900'
                            : 'bg-gray-50'
                      }`}
                    >
                      <span className="inline-block w-6 text-gray-400">
                        {change.type === 'add' ? '+' : change.type === 'delete' ? '-' : ' '}
                      </span>
                      <span className="whitespace-pre-wrap">{change.content}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
