import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@headlessui/react'
import { FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion as Motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import { createPartType } from '../../api/partTypes'

export default function AddPartTypeModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expected_failure_interval_days: ''
  })

  const queryClient = useQueryClient()

  const { mutate: addPartType, isLoading } = useMutation({
    mutationFn: createPartType,
    onSuccess: () => {
      toast.success('Тип детали успешно создан')
      queryClient.invalidateQueries(['partTypes'])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при создании типа детали')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Convert expected_failure_interval_days to number or null
    const formattedData = {
      ...formData,
      expected_failure_interval_days: formData.expected_failure_interval_days 
        ? parseInt(formData.expected_failure_interval_days) 
        : null
    }
    
    addPartType(formattedData)
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
              Создание типа детали
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Название
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="Например: Процессор"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                placeholder="Дополнительная информация о типе детали..."
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Ожидаемый интервал отказа (в днях)
              </label>
              <input
                type="number"
                name="expected_failure_interval_days"
                value={formData.expected_failure_interval_days}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                placeholder="Например: 365"
              />
            </div>

            {/* Footer */}
            <div className="pt-4 border-t border-violet-500/20 flex justify-end gap-3">
              <Button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
              >
                Отмена
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                {isLoading ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </form>
        </Motion.div>
      </div>
    </Dialog>
  )
} 