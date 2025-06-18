import { Plot } from '../../types/project'
import { CheckCircleIcon } from '@heroicons/react/24/solid'
import { CheckCircleIcon as CheckCircleOutlineIcon } from '@heroicons/react/24/outline'

interface PlotProgressProps {
  plot: Plot
  onToggleComplete: (plotId: string, completed: boolean) => void
  onUpdateProgress: (plotId: string, progress: number) => void
}

export default function PlotProgress({
  plot,
  onToggleComplete,
  onUpdateProgress,
}: PlotProgressProps) {
  const progress = plot.progress || 0
  const isCompleted = plot.completed || false

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <button
          onClick={() => onToggleComplete(plot.id, !isCompleted)}
          className="flex items-center space-x-2 text-sm font-medium"
        >
          {isCompleted ? (
            <CheckCircleIcon className="w-5 h-5 text-green-600" />
          ) : (
            <CheckCircleOutlineIcon className="w-5 h-5 text-gray-400" />
          )}
          <span className={isCompleted ? 'text-green-600' : 'text-gray-700'}>
            {isCompleted ? '完了' : '未完了'}
          </span>
        </button>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>

      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isCompleted ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          value={progress}
          onChange={(e) => onUpdateProgress(plot.id, parseInt(e.target.value))}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          title="進行状況を調整"
        />
      </div>
    </div>
  )
}
