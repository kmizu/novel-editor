import { useState, useCallback, useEffect } from 'react'
import { Character } from '../types/project'
import { storage } from '../utils/storage'
import { useProjects } from './useProjects'

export function useCharacters() {
  const { currentProject, updateProject } = useProjects()
  const [characters, setCharacters] = useState<Character[]>([])

  useEffect(() => {
    if (currentProject) {
      const projectData = storage.getProject(currentProject.id)
      setCharacters(projectData?.characters || [])
    }
  }, [currentProject])

  const addCharacter = useCallback(
    (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!currentProject) return

      const newCharacter: Character = {
        ...character,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const updatedCharacters = [...characters, newCharacter]
      setCharacters(updatedCharacters)

      const projectData = storage.getProject(currentProject.id)
      if (projectData) {
        storage.saveProject({
          ...projectData,
          characters: updatedCharacters,
          project: {
            ...projectData.project,
            updatedAt: new Date().toISOString(),
          },
        })
        updateProject(currentProject.id, { updatedAt: new Date().toISOString() })
      }

      return newCharacter
    },
    [characters, currentProject, updateProject]
  )

  const updateCharacter = useCallback(
    (id: string, updates: Partial<Character>) => {
      if (!currentProject) return

      const updatedCharacters = characters.map((char) =>
        char.id === id ? { ...char, ...updates, updatedAt: new Date().toISOString() } : char
      )
      setCharacters(updatedCharacters)

      const projectData = storage.getProject(currentProject.id)
      if (projectData) {
        storage.saveProject({
          ...projectData,
          characters: updatedCharacters,
          project: {
            ...projectData.project,
            updatedAt: new Date().toISOString(),
          },
        })
        updateProject(currentProject.id, { updatedAt: new Date().toISOString() })
      }
    },
    [characters, currentProject, updateProject]
  )

  const deleteCharacter = useCallback(
    (id: string) => {
      if (!currentProject) return

      const updatedCharacters = characters.filter((char) => char.id !== id)
      setCharacters(updatedCharacters)

      const projectData = storage.getProject(currentProject.id)
      if (projectData) {
        storage.saveProject({
          ...projectData,
          characters: updatedCharacters,
          project: {
            ...projectData.project,
            updatedAt: new Date().toISOString(),
          },
        })
        updateProject(currentProject.id, { updatedAt: new Date().toISOString() })
      }
    },
    [characters, currentProject, updateProject]
  )

  const getCharacter = useCallback(
    (id: string) => {
      return characters.find((char) => char.id === id)
    },
    [characters]
  )

  return {
    characters,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    getCharacter,
  }
}
