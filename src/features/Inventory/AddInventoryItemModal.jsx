import { useState } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { Dialog } from '@headlessui/react'
import { motion as Motion } from 'framer-motion'
import { FiX, FiBox, FiAlertCircle, FiMessageSquare } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { createInventoryItem } from '../../api/inventoryEvents'
import { getAllDevices } from '../../api/devices'

const DEVICE_CONDITIONS = {
  ok: { label: 'Исправно', color: 'emerald' },
  needs_maintenance: { label: 'Требует обслуживания', color: 'amber' },
  broken: { label: 'Неисправно', color: 'red' }
}

export default function AddInventoryItemModal({ isOpen, onClose, eventId, event }) {
  const [formData, setFormData] = useState({
    device_id: '',
    found: true,
    condition: 'ok',
    comments: ''
  })

  const queryClient = useQueryClient()

  // Fetch devices for the specific location
  const { data: devices = [] } = useQuery({
    queryKey: ['devices', { location_id: event.location.id }],
    queryFn: () => getAllDevices({ current_location_id: event.location.id }),
    enabled: !!event.location.id
  })

  const createMutation = useMutation({
    mutationFn: (data) => createInventoryItem(eventId, data),
    onSuccess: () => {
      toast.success('Устройство успешно добавлено')
      queryClient.invalidateQueries(['inventory-event', eventId])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при добавлении устройства')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    createMutation.mutate(formData)
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
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
            <div>
              <h3 className="text-lg font-medium text-white">
                Добавить устройство
              </h3>
              <p className="text-sm text-gray-400">
                Локация: {event.location.name}
              </p>
            </div>
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
                  Устройство
                </label>
                <div className="relative">
                  <select
                    name="device_id"
                    value={formData.device_id}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">Выберите устройство</option>
                    {devices.map(device => (
                      <option key={device.id} value={device.id}>
                        {device.name || device.serial_number}
                      </option>
                    ))}
                  </select>
                  <FiBox className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    name="found"
                    checked={formData.found}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-violet-500/20 text-violet-500 focus:ring-violet-500/50 focus:ring-offset-0 bg-[#1f1f25]/90"
                  />
                  Устройство найдено
                </label>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Состояние
                </label>
                <div className="relative">
                  <select
                    name="condition"
                    value={formData.condition}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  >
                    {Object.entries(DEVICE_CONDITIONS).map(([value, { label }]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <FiAlertCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Комментарий
                </label>
                <div className="relative">
                  <textarea
                    name="comments"
                    value={formData.comments}
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
              {createMutation.isLoading ? 'Добавление...' : 'Добавить'}
            </button>
          </div>
        </Motion.div>
      </div>
    </Dialog>
  )
} 