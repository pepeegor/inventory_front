import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import { FaTimes } from 'react-icons/fa'
import { motion as Motion } from 'framer-motion'
import { toast } from 'react-toastify'
import { createDeviceType } from '../../api/deviceTypes'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { usePermissions } from '../../hooks/usePermissions'
import { Navigate } from 'react-router-dom'

export default function AddDeviceTypeModal({ isOpen, onClose, partTypes = [] }) {
  const { isAdmin } = usePermissions()
  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    part_type_id: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: (data) => createDeviceType(data),
    onSuccess: () => {
      toast.success('Тип устройства успешно создан')
      queryClient.invalidateQueries(['deviceTypes'])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при создании типа устройства')
    }
  })

  // If not admin, redirect to home page
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await createMutation.mutateAsync(formData)
    } finally {
      setLoading(false)
    }
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
                Создать тип устройства
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
                      Производитель *
                    </label>
                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Модель *
                    </label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Тип компонента *
                    </label>
                    <select
                      name="part_type_id"
                      value={formData.part_type_id}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    >
                      <option value="">Выберите тип</option>
                      {Array.isArray(partTypes) && partTypes.map(type => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">
                  Описание
                </label>
                <textarea
                  name="description"
                  value={formData.description}
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
                {loading ? 'Создание...' : 'Создать'}
              </button>
            </div>
          </form>
        </Motion.div>
      </div>
    </Dialog>
  )
} 