import { useMemo } from 'react'
import { Plot } from '../../types/project'
import { XMarkIcon, BookOpenIcon } from '@heroicons/react/24/outline'

interface PlotReferenceProps {
  plots: Plot[]
  chapterId: string
  onClose: () => void
}

export default function PlotReference({ plots, chapterId, onClose }: PlotReferenceProps) {
  const relevantPlots = useMemo(() => {
    const mainPlots = plots.filter((plot) => plot.type === 'main')
    const subPlots = plots.filter((plot) => plot.type === 'sub')
    const chapterPlots = plots.filter(
      (plot) => plot.type === 'chapter' && plot.chapterId === chapterId
    )

    return {
      main: mainPlots.sort((a, b) => a.order - b.order),
      sub: subPlots.sort((a, b) => a.order - b.order),
      chapter: chapterPlots.sort((a, b) => a.order - b.order),
    }
  }, [plots, chapterId])

  const hasPlots =
    relevantPlots.main.length > 0 ||
    relevantPlots.sub.length > 0 ||
    relevantPlots.chapter.length > 0

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <BookOpenIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">プロット参照</h3>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
        >
          <XMarkIcon className="w-4 h-4" />
        </button>
      </div>

      {!hasPlots ? (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500 dark:text-gray-400">関連するプロットがありません</p>
        </div>
      ) : (
        <div className="h-[calc(100%-3rem)] overflow-y-auto space-y-4">
          {/* 章別プロット */}
          {relevantPlots.chapter.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                この章のプロット
              </h4>
              <div className="space-y-2">
                {relevantPlots.chapter.map((plot) => (
                  <PlotItem key={plot.id} plot={plot} />
                ))}
              </div>
            </div>
          )}

          {/* メインプロット */}
          {relevantPlots.main.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                メインプロット
              </h4>
              <div className="space-y-2">
                {relevantPlots.main.map((plot) => (
                  <PlotItem key={plot.id} plot={plot} />
                ))}
              </div>
            </div>
          )}

          {/* サブプロット */}
          {relevantPlots.sub.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
                サブプロット
              </h4>
              <div className="space-y-2">
                {relevantPlots.sub.map((plot) => (
                  <PlotItem key={plot.id} plot={plot} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function PlotItem({ plot }: { plot: Plot }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded p-3 shadow-sm">
      <h5 className="font-medium text-sm text-gray-900 dark:text-gray-100 mb-1">{plot.title}</h5>
      <p className="text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-3">
        {plot.content}
      </p>
    </div>
  )
}
