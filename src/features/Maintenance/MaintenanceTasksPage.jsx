import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaTools, FaSearch, FaPlus, FaEdit, FaTrash, FaFilter, FaSync, FaTimes } from 'react-icons/fa'
import { motion as Motion } from 'framer-motion'
import { Dialog } from '@headlessui/react'
import AnimatedSection from '../../components/AnimatedSection'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import { format } from 'date-fns'
import { usePermissions } from '../../hooks/usePermissions'
import { toast } from 'react-toastify'
import { getAllMaintenanceTasks, deleteMaintenanceTask, MAINTENANCE_STATUSES } from '../../api/maintenance'
import { getAllUsers } from '../../api/users'
import { getAllDevices } from '../../api/devices'
import AddMaintenanceTaskModal from './AddMaintenanceTaskModal'
import EditMaintenanceTaskModal from './EditMaintenanceTaskModal'
import ConfirmModal from '../../components/common/ConfirmModal'

export default function MaintenanceTasksPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    device_id: '',
    assigned_to: '',
    status: '',
    scheduled_from: '',
    scheduled_to: ''
  })

  const { isAdmin, currentUser } = usePermissions()
  const queryClient = useQueryClient()

  // Fetch tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['maintenanceTasks', filters],
    queryFn: () => getAllMaintenanceTasks(filters)
  })

  // Filter tasks locally based on search term
  const filteredTasks = tasks.filter(task => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      task.device?.serial_number?.toLowerCase().includes(searchLower) ||
      task.task_type?.toLowerCase().includes(searchLower) ||
      task.notes?.toLowerCase().includes(searchLower) ||
      task.assigned_user?.full_name?.toLowerCase().includes(searchLower)
    );
  });

  // Fetch users for filtering
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000
  })

  // Fetch devices for filtering
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => getAllDevices(),
    staleTime: 5 * 60 * 1000
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deleteMaintenanceTask,
    onSuccess: () => {
      toast.success('Задача успешно удалена')
      queryClient.invalidateQueries(['maintenanceTasks'])
      handleCloseDeleteModal()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении задачи')
    }
  })

  // Calculate task stats with null checks
  const taskStats = {
    total: tasks?.length || 0,
    pending: tasks?.filter(t => t?.status === 'pending').length || 0,
    in_progress: tasks?.filter(t => t?.status === 'in_progress').length || 0,
    completed: tasks?.filter(t => t?.status === 'completed').length || 0
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      device_id: '',
      assigned_to: '',
      status: '',
      scheduled_from: '',
      scheduled_to: ''
    })
  }

  const handleOpenAddModal = () => setShowAddModal(true)
  const handleCloseAddModal = () => setShowAddModal(false)

  const handleOpenEditModal = (task) => {
    setSelectedTask(task)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setSelectedTask(null)
    setShowEditModal(false)
  }

  const handleOpenDeleteModal = (task) => {
    setSelectedTask(task)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setSelectedTask(null)
    setShowDeleteModal(false)
  }

  const handleDelete = () => {
    if (selectedTask) {
      deleteMutation.mutate(selectedTask.id)
    }
  }

  // Get status badge class
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-900/50 text-blue-300 border border-blue-500/30';
      case 'in_progress':
        return 'bg-yellow-900/50 text-yellow-300 border border-yellow-500/30';
      case 'completed':
        return 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30';
      default:
        return 'bg-gray-900/50 text-gray-300 border border-gray-500/30';
    }
  }

  return (
    <AnimatedSection className="p-6">
      {/* Header Section */}
      <Motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaTools className="mr-2 text-violet-400" />
            Регламентные работы
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по задачам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <FaPlus /> Создать задачу
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6"
        >
          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-violet-800/20 backdrop-blur-sm border border-violet-500/20"
          >
            <div className="text-sm text-violet-300 mb-1">Всего задач</div>
            <div className="text-2xl font-bold text-white">{taskStats.total}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm border border-blue-500/20"
          >
            <div className="text-sm text-blue-300 mb-1">Запланировано</div>
            <div className="text-2xl font-bold text-white">{taskStats.pending}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 backdrop-blur-sm border border-yellow-500/20"
          >
            <div className="text-sm text-yellow-300 mb-1">В процессе</div>
            <div className="text-2xl font-bold text-white">{taskStats.in_progress}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 backdrop-blur-sm border border-emerald-500/20"
          >
            <div className="text-sm text-emerald-300 mb-1">Завершено</div>
            <div className="text-2xl font-bold text-white">{taskStats.completed}</div>
          </Motion.div>
        </Motion.div>

        {/* Filters */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6"
        >
          <select
            value={filters.device_id}
            onChange={(e) => handleFilterChange('device_id', e.target.value)}
            className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="">Все устройства</option>
            {devices.map(device => (
              <option key={device.id} value={device.id}>
                {device.serial_number}
              </option>
            ))}
          </select>

          {isAdmin && (
            <select
              value={filters.assigned_to}
              onChange={(e) => handleFilterChange('assigned_to', e.target.value)}
              className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="">Все исполнители</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.username}
                </option>
              ))}
            </select>
          )}

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="">Все статусы</option>
            {Object.entries(MAINTENANCE_STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={filters.scheduled_from}
            onChange={(e) => handleFilterChange('scheduled_from', e.target.value)}
            className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />

          <input
            type="date"
            value={filters.scheduled_to}
            onChange={(e) => handleFilterChange('scheduled_to', e.target.value)}
            className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />

          <div className="md:col-span-5 flex justify-end gap-2">
            <Button
              onClick={resetFilters}
              className="flex items-center gap-2 px-4 py-2 bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 rounded-lg transition-colors border border-violet-500/20"
            >
              <FaSync className="text-sm" /> Сбросить
            </Button>
          </div>
        </Motion.div>
      </Motion.div>

      {/* Main Content */}
      <Motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glassmorphism rounded-xl border border-violet-500/20 relative overflow-hidden"
      >
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-5 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-white/20"></div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader />
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            {searchTerm ? 'Задачи не найдены' : 'Нет задач'}
          </div>
        ) : (
          <div className="relative z-10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-violet-500/20">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[180px]">
                    Устройство
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[200px]">
                    Тип работы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[120px]">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[160px]">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[180px]">
                    Исполнитель
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Примечания
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider w-[120px]">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/20">
                {filteredTasks.map((task) => (
                  <Motion.tr
                    key={task.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    className="transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {task.device?.serial_number}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {task.task_type}
                    </td>
                    <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                      {format(new Date(task.scheduled_date), 'dd.MM.yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center justify-center min-w-[120px] px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(task.status)}`}>
                        {MAINTENANCE_STATUSES[task.status] || 'Неизвестно'}
              </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {task.assigned_user?.full_name || 'Не назначен'}
                    </td>
                    <td className="px-6 py-4 text-gray-300 break-words">
                      {task.notes || '-'}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => handleOpenEditModal(task)}
                            className="p-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors"
                            title="Редактировать"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleOpenDeleteModal(task)}
                            className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
                            title="Удалить"
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                      {!isAdmin && task.assigned_to === currentUser?.id && (
                        <button
                          onClick={() => handleOpenEditModal(task)}
                          className="p-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors"
                          title="Обновить статус"
                        >
                          <FaEdit />
                        </button>
                      )}
                    </td>
                  </Motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Motion.div>

      {/* Modals */}
      {showAddModal && (
        <AddMaintenanceTaskModal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
          devices={devices}
          users={users}
        />
      )}

      {showEditModal && selectedTask && (
        <EditMaintenanceTaskModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          task={selectedTask}
          devices={devices}
          users={users}
        />
      )}

      {showDeleteModal && selectedTask && (
        <Dialog
          open={showDeleteModal}
          onClose={handleCloseDeleteModal}
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
                  Удаление задачи
                </h3>
                <button
                  onClick={handleCloseDeleteModal}
                  className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-300">
                  Вы уверены, что хотите удалить задачу регламентной работы для устройства <span className="text-white font-medium">'{selectedTask.device?.serial_number}'</span>?
                </p>
                <p className="mt-2 text-red-400 text-sm">
                  Это действие нельзя отменить.
                </p>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-violet-500/20 bg-black/20 flex justify-end gap-3">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors border border-red-500/20"
                >
                  Удалить
                </button>
            </div>
            </Motion.div>
    </div>
        </Dialog>
      )}
    </AnimatedSection>
  )
}
