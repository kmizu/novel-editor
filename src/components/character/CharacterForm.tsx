import React, { useState } from 'react'
import { Character } from '../../types/project'

interface CharacterFormProps {
  character?: Character
  onSubmit: (character: Omit<Character, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}

export function CharacterForm({ character, onSubmit, onCancel }: CharacterFormProps) {
  const [formData, setFormData] = useState({
    projectId: character?.projectId || '',
    name: character?.name || '',
    furigana: character?.furigana || '',
    age: character?.age || undefined,
    gender: character?.gender || '',
    role: character?.role || ('other' as const),
    appearance: character?.appearance || '',
    personality: character?.personality || '',
    background: character?.background || '',
    relationships: character?.relationships || [],
    notes: character?.notes || '',
    imageUrl: character?.imageUrl || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' ? (value ? parseInt(value) : undefined) : value,
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            名前 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="furigana" className="block text-sm font-medium text-gray-700">
            ふりがな
          </label>
          <input
            type="text"
            id="furigana"
            name="furigana"
            value={formData.furigana}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label htmlFor="age" className="block text-sm font-medium text-gray-700">
            年齢
          </label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age || ''}
            onChange={handleChange}
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            性別
          </label>
          <input
            type="text"
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            役割
          </label>
          <select
            id="role"
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="protagonist">主人公</option>
            <option value="antagonist">敵役</option>
            <option value="main">メインキャラクター</option>
            <option value="support">サブキャラクター</option>
            <option value="other">その他</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="appearance" className="block text-sm font-medium text-gray-700">
          外見
        </label>
        <textarea
          id="appearance"
          name="appearance"
          value={formData.appearance}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="髪型、服装、体格など..."
        />
      </div>

      <div>
        <label htmlFor="personality" className="block text-sm font-medium text-gray-700">
          性格
        </label>
        <textarea
          id="personality"
          name="personality"
          value={formData.personality}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="性格、口調、癖など..."
        />
      </div>

      <div>
        <label htmlFor="background" className="block text-sm font-medium text-gray-700">
          経歴・背景
        </label>
        <textarea
          id="background"
          name="background"
          value={formData.background}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="出身、過去の経験、目的など..."
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
          メモ
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="その他の設定や注意事項..."
        />
      </div>

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          キャンセル
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
        >
          {character ? '更新' : '作成'}
        </button>
      </div>
    </form>
  )
}
