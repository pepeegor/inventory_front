import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { motion as Motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { createDevice } from '../../api/devices'
import { flattenLocationTree } from '../../utils/locationUtils'

export default function AddDeviceModal({ isOpen, onClose, onSuccess, deviceTypes, locations }) {
  const [formData, setFormData] = useState({
    serial_number: '',
    name: '',
    type_id: '',
    current_location_id: '',
    status: 'storage',
    purchase_date: '',
    warranty_end: '',
    notes: ''
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createDevice(formData)
      toast.success('Устройство успешно добавлено')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating device:', error)
      toast.error(error.response?.data?.detail || 'Ошибка при создании устройства')
    } finally {
      setLoading(false)
    }
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
          className="bg-[#1f1f25] border border-violet-500/20 rounded-xl shadow-lg w-full max-w-2xl overflow-hidden"
        >
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="p-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-900/30 via-violet-800/20 to-violet-900/30 flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                Добавить устройство
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
              >
                <FaTimes />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Серийный номер *
                    </label>
                    <input
                      type="text"
                      name="serial_number"
                      value={formData.serial_number}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Название
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Тип устройства *
                    </label>
                    <select
                      name="type_id"
                      value={formData.type_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    >
                      <option value="">Выберите тип</option>
                      {deviceTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.manufacturer} {type.model}
                          {type.part_types?.name ? ` (${type.part_types.name})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Локация *
                    </label>
                    <select
                      name="current_location_id"
                      value={formData.current_location_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    >
                      <option value="">Выберите локацию</option>
                      {flattenLocationTree(locations).map(location => (
                        <option key={location.id} value={location.id}>
                          {location.displayName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Статус *
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    >
                      <option value="storage">На складе</option>
                      <option value="active">Активно</option>
                      <option value="maintenance">В ремонте</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Дата покупки
                    </label>
                    <input
                      type="date"
                      name="purchase_date"
                      value={formData.purchase_date}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Гарантия до
                    </label>
                    <input
                      type="date"
                      name="warranty_end"
                      value={formData.warranty_end}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Заметки
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 resize-none"
                />
              </div>
            </div>

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
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors border border-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Добавление...' : 'Добавить'}
              </button>
            </div>
          </form>
        </Motion.div>
      </div>
    </Dialog>
  )
} 