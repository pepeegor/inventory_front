import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@headlessui/react'
import { motion as Motion } from 'framer-motion'
import { FiX, FiCalendar, FiMapPin, FiMessageSquare } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { createInventoryEvent } from '../../api/inventoryEvents'
import { flattenLocationTree } from '../../utils/locationUtils'

export default function CreateInventoryModal({ isOpen, onClose, locations }) {
  const [formData, setFormData] = useState({
    event_date: new Date().toISOString().split('T')[0],
    location_id: '',
    notes: ''
  })

  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data) => createInventoryEvent(data),
    onSuccess: () => {
      toast.success('Инвентаризация успешно создана')
      queryClient.invalidateQueries(['inventory-events'])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при создании инвентаризации')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1f1f25] border border-violet-500/20 rounded-xl shadow-lg w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-900/30 via-violet-800/20 to-violet-900/30 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">
              Новая инвентаризация
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <FiX />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Дата инвентаризации
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  />
                  <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Локация
                </label>
                <div className="relative">
                  <select
                    name="location_id"
                    value={formData.location_id}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">Выберите локацию</option>
                    {flattenLocationTree(locations).map(location => (
                      <option key={location.id} value={location.id}>
                        {location.displayName}
                      </option>
                    ))}
                  </select>
                  <FiMapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Заметки
                </label>
                <div className="relative">
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    rows={4}
                    placeholder="Дополнительные заметки..."
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors resize-none"
                  />
                  <FiMessageSquare className="absolute left-3 top-3 text-violet-400" />
                </div>
              </div>
            </div>
          </form>

          {/* Footer */}
          <div className="p-4 border-t border-violet-500/20 bg-black/20 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={createMutation.isLoading}
              className="px-4 py-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors border border-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isLoading ? 'Создание...' : 'Создать'}
            </button>
          </div>
        </Motion.div>
      </div>
    </Dialog>
  )
} 