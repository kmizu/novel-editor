import { useState } from 'react'
import { useProjects } from '../hooks/useProjects'
import ProjectCard from '../components/project/ProjectCard'
import CreateProjectDialog from '../components/project/CreateProjectDialog'
import ProjectEditDialog from '../components/project/ProjectEditDialog'
import { PlusIcon, FolderOpenIcon } from '@heroicons/react/24/outline'
import { Project } from '../types/project'

export default function ProjectsPage() {
  const { projects, activeProject, createProject, updateProject, deleteProject, setActiveProject } =
    useProjects()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredProjects = projects.filter(
    (project) =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProject = (
    projectData: Omit<
      Project,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'chapters'
      | 'characters'
      | 'plots'
      | 'worldSettings'
      | 'memos'
      | 'exportSettings'
    >
  ) => {
    const newProject = createProject(projectData)
    if (newProject) {
      setActiveProject(newProject.id)
      setIsCreateDialogOpen(false)
    }
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
  }

  const handleDeleteProject = (projectId: string) => {
    if (
      window.confirm(
        'このプロジェクトを削除してもよろしいですか？\n関連するすべてのデータが削除されます。'
      )
    ) {
      deleteProject(projectId)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">プロジェクト管理</h2>
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          新規プロジェクト
        </button>
      </div>

      <div className="mb-6">
        <input
          type="text"
          placeholder="プロジェクトを検索..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {filteredProjects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <FolderOpenIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {searchTerm ? '検索結果がありません' : 'プロジェクトがまだありません'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              最初のプロジェクトを作成
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isActive={activeProject?.id === project.id}
              onSelect={() => setActiveProject(project.id)}
              onEdit={() => handleEditProject(project)}
              onDelete={() => handleDeleteProject(project.id)}
            />
          ))}
        </div>
      )}

      <CreateProjectDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreate={handleCreateProject}
      />

      <ProjectEditDialog
        isOpen={editingProject !== null}
        onClose={() => setEditingProject(null)}
        project={editingProject}
        onUpdate={updateProject}
      />
    </div>
  )
}
