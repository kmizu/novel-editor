import { useProjects } from '../hooks/useProjects'
import { useChapters } from '../hooks/useChapters'
import { usePlots } from '../hooks/usePlots'
import PlotEditor from '../components/plot/PlotEditor'

export default function PlotPage() {
  const { activeProject } = useProjects()
  const { chapters } = useChapters(activeProject?.id || null)
  const { plots, createPlot, updatePlot, deletePlot, reorderPlots } = usePlots(
    activeProject?.id || null
  )

  if (!activeProject) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">プロジェクトを選択してください</p>
      </div>
    )
  }

  return (
    <div className="h-full">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">プロット管理</h2>

      <div className="bg-white rounded-lg shadow h-[calc(100vh-16rem)]">
        <PlotEditor
          plots={plots}
          chapters={chapters.map((ch) => ({ id: ch.id, title: ch.title, order: ch.order }))}
          onCreatePlot={createPlot}
          onUpdatePlot={updatePlot}
          onDeletePlot={deletePlot}
          onReorderPlots={reorderPlots}
        />
      </div>
    </div>
  )
}
