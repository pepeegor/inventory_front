import { useState, useEffect } from 'react'
import { FaEdit } from 'react-icons/fa'
import { motion as Motion } from 'framer-motion'
import { updateLocation } from '../../api/locations'
import { toast } from 'react-toastify'
import Button from '../../components/ui/Button'

export default function EditLocationModal({ isOpen, onClose, onSuccess, location, parentLocations }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parent_id: ''
  })

  useEffect(() => {
    if (location) {
      setFormData({
        name: location.name || '',
        description: location.description || '',
        parent_id: location.parent_id || ''
      })
    }
  }, [location])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateLocation(location.id, formData)
      toast.success('Локация успешно обновлена')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating location:', error)
      toast.error('Ошибка при обновлении локации')
    }
  }

  if (!isOpen || !location) return null

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <Motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-lg p-6 rounded-xl bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-lg border border-violet-500/20 shadow-xl"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <FaEdit className="text-violet-400" />
            Редактировать локацию
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Название
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              placeholder="Введите название локации"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Описание
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              placeholder="Введите описание локации"
              rows="3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Родительская локация
            </label>
            <select
              value={formData.parent_id}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value })}
              className="w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
            >
              <option value="">Нет (корневая локация)</option>
              {parentLocations
                .filter(loc => loc.id !== location.id) // Prevent self-reference
                .map(loc => (
                  <option key={loc.id} value={loc.id}>
                    {loc.displayName}
                  </option>
                ))
              }
            </select>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Отмена
            </Button>
            <Button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <FaEdit className="text-sm" />
              Сохранить
            </Button>
          </div>
        </form>
      </Motion.div>
    </Motion.div>
  )
} 