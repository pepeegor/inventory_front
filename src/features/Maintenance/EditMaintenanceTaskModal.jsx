import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@headlessui/react'
import { FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { motion as Motion } from 'framer-motion'
import Button from '../../components/ui/Button'
import { updateMaintenanceTask, MAINTENANCE_STATUSES } from '../../api/maintenance'
import { usePermissions } from '../../hooks/usePermissions'

export default function EditMaintenanceTaskModal({ isOpen, onClose, task, devices, users }) {
  const { isAdmin, currentUser } = usePermissions()
  const [formData, setFormData] = useState({
    scheduled_date: '',
    completed_date: '',
    status: '',
    assigned_to: '',
    notes: ''
  })

  useEffect(() => {
    if (task) {
      setFormData({
        scheduled_date: task.scheduled_date || '',
        completed_date: task.completed_date || '',
        status: task.status || '',
        assigned_to: task.assigned_to || '',
        notes: task.notes || ''
      })
    }
  }, [task])

  const queryClient = useQueryClient()

  const { mutate: updateTask, isLoading } = useMutation({
    mutationFn: (data) => updateMaintenanceTask(task.id, data),
    onSuccess: () => {
      toast.success('Задача успешно обновлена')
      queryClient.invalidateQueries(['maintenanceTasks'])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при обновлении задачи')
    }
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // If not admin, only allow status and notes updates
    if (!isAdmin) {
      const restrictedUpdate = {
        status: formData.status,
        notes: formData.notes
      }
      updateTask(restrictedUpdate)
      return
    }
    
    updateTask(formData)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  // Get available statuses based on current status and user role
  const getAvailableStatuses = () => {
    const currentStatus = task.status
    if (isAdmin) {
      return MAINTENANCE_STATUSES
    }

    // Regular users can only update status in a specific flow
    const statusFlow = {
      pending: ['in_progress'],
      in_progress: ['completed']
    }

    const availableStatuses = {}
    if (statusFlow[currentStatus]) {
      statusFlow[currentStatus].forEach(status => {
        availableStatuses[status] = MAINTENANCE_STATUSES[status]
      })
    }
    availableStatuses[currentStatus] = MAINTENANCE_STATUSES[currentStatus] // Always include current status
    return availableStatuses
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
              {isAdmin ? 'Редактирование задачи' : 'Обновление статуса задачи'}
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
                Устройство
              </label>
              <div className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white">
                {task?.device?.serial_number}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Тип работы
              </label>
              <div className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white">
                {task?.task_type}
              </div>
            </div>

            {isAdmin && (
              <>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Дата проведения
                  </label>
                  <input
                    type="date"
                    name="scheduled_date"
                    value={formData.scheduled_date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Дата завершения
                  </label>
                  <input
                    type="date"
                    name="completed_date"
                    value={formData.completed_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Исполнитель
                  </label>
                  <select
                    name="assigned_to"
                    value={formData.assigned_to}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  >
                    <option value="">Не назначен</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.full_name || user.username}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Статус
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              >
                {Object.entries(getAvailableStatuses()).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Примечания
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
                placeholder="Дополнительная информация о работе..."
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
                {isLoading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </form>
        </Motion.div>
      </div>
    </Dialog>
  )
} 