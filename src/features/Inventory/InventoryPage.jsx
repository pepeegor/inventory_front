import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { FiBox, FiFilter, FiSearch, FiCalendar, FiMapPin, FiPlus, FiTrash2, FiEdit3, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { toast } from 'react-toastify'
import { useLocations } from '../../hooks/useLocations'
import { getAllInventoryEvents, deleteInventoryEvent } from '../../api/inventoryEvents'
import { flattenLocationTree } from '../../utils/locationUtils'
import CreateInventoryModal from './CreateInventoryModal'
import InventoryDetailsModal from './InventoryDetailsModal'
import ConfirmModal from '../../components/common/ConfirmModal'

const DEVICE_CONDITIONS = {
  ok: { label: 'Исправно', color: 'emerald' },
  needs_maintenance: { label: 'Требует обслуживания', color: 'amber' },
  broken: { label: 'Неисправно', color: 'red' }
}

export default function InventoryPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    location_id: '',
    offset: 0,
    limit: 100
  })
  const [searchTerm, setSearchTerm] = useState('')
  const { locations } = useLocations()
  const queryClient = useQueryClient()

  // Fetch inventory events
  const { data: events = [], isLoading } = useQuery({
    queryKey: ['inventory-events', filters],
    queryFn: () => {
      // Only include non-empty filter values
      const filterParams = {
        offset: filters.offset,
        limit: filters.limit
      }
      
      if (filters.date_from) filterParams.date_from = filters.date_from
      if (filters.date_to) filterParams.date_to = filters.date_to
      if (filters.location_id) filterParams.location_id = filters.location_id
      
      return getAllInventoryEvents(filterParams)
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteInventoryEvent(id),
    onSuccess: () => {
      toast.success('Инвентаризация успешно удалена')
      queryClient.invalidateQueries(['inventory-events'])
      handleCloseDeleteModal()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении инвентаризации')
    }
  })

  // Filter events by search term
  const filteredEvents = events.filter(event =>
    event.location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.performed_by_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate inventory stats
  const inventoryStats = {
    total: filteredEvents.length,
    totalDevices: filteredEvents.reduce((acc, event) => acc + event.items.length, 0),
    issuesFound: filteredEvents.reduce((acc, event) => 
      acc + event.items.filter(item => item.condition === 'needs_maintenance' || item.condition === 'broken').length, 0
    )
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      date_from: '',
      date_to: '',
      location_id: '',
      offset: 0,
      limit: 100
    })
  }

  const handleOpenCreateModal = () => setIsCreateModalOpen(true)
  const handleCloseCreateModal = () => setIsCreateModalOpen(false)

  const handleOpenDetailsModal = (event) => {
    setSelectedEvent(event)
    setIsDetailsModalOpen(true)
  }
  
  const handleCloseDetailsModal = () => {
    setSelectedEvent(null)
    setIsDetailsModalOpen(false)
  }

  const handleOpenDeleteModal = (event) => {
    setSelectedEvent(event)
    setIsDeleteModalOpen(true)
  }
  
  const handleCloseDeleteModal = () => {
    setSelectedEvent(null)
    setIsDeleteModalOpen(false)
  }

  const handleDelete = () => {
    if (selectedEvent) {
      deleteMutation.mutate(selectedEvent.id)
    }
  }

  return (
    <div className="p-6 animate-fadeIn">
      {/* Header Section */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiBox className="text-violet-400" />
              Инвентаризация
            </h2>
            <p className="text-gray-400">Управление инвентаризацией устройств</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по инвентаризациям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" />
            </div>
            
            <button
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <FiPlus /> Новая инвентаризация
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        >
          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-violet-800/20 backdrop-blur-sm border border-violet-500/20"
          >
            <div className="text-sm text-violet-300 mb-1">Всего инвентаризаций</div>
            <div className="text-2xl font-bold text-white">{inventoryStats.total}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 backdrop-blur-sm border border-emerald-500/20"
          >
            <div className="text-sm text-emerald-300 mb-1">Проверено устройств</div>
            <div className="text-2xl font-bold text-white">{inventoryStats.totalDevices}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-800/20 backdrop-blur-sm border border-amber-500/20"
          >
            <div className="text-sm text-amber-300 mb-1">Выявлено проблем</div>
            <div className="text-2xl font-bold text-white">{inventoryStats.issuesFound}</div>
          </Motion.div>
        </Motion.div>

        {/* Filters Section */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-[#1f1f25] border border-violet-500/20 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-900/30 via-violet-800/20 to-violet-900/30">
              <div className="flex items-center gap-2">
                <FiFilter className="text-violet-400" />
                <h3 className="text-lg font-medium text-white">Фильтры</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6 bg-gradient-to-b from-violet-900/10 to-transparent">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    С даты
                  </label>
                  <input
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    По дату
                  </label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Локация
                  </label>
                  <select
                    value={filters.location_id}
                    onChange={(e) => handleFilterChange('location_id', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">Все локации</option>
                    {flattenLocationTree(locations).map(location => (
                      <option key={location.id} value={location.id}>
                        {location.displayName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 rounded-lg transition-colors border border-violet-500/20"
                >
                  <FiFilter className="text-sm" /> Сбросить
                </button>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Main Content */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-violet-500/20 overflow-hidden backdrop-blur-sm bg-[#1f1f25]/90 relative"
        >
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-5 pointer-events-none">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border border-white/20"></div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-500/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FiBox className="w-16 h-16 mb-4 text-gray-500/50" />
              <p className="text-lg">
                {searchTerm ? 'Инвентаризации не найдены' : 'Нет инвентаризаций'}
              </p>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Попробуйте изменить параметры поиска' : 'Создайте новую инвентаризацию, нажав кнопку выше'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 relative z-10">
              <AnimatePresence>
                {filteredEvents.map((event) => (
                  <Motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.01 }}
                    onClick={() => handleOpenDetailsModal(event)}
                    className="bg-gradient-to-r from-violet-900/10 via-violet-800/5 to-violet-900/10 hover:from-violet-900/20 hover:via-violet-800/10 hover:to-violet-900/20 border border-violet-500/20 hover:border-violet-500/40 rounded-xl p-6 cursor-pointer transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="text-violet-400" />
                            {format(new Date(event.event_date), 'd MMMM yyyy', { locale: ru })}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiMapPin className="text-violet-400" />
                            {event.location?.name}
                          </span>
                        </div>
                        <div className="text-white font-medium">
                          Провел: {event.performed_by_user?.full_name}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpenDeleteModal(event)
                          }}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/20">
                        <FiCheckCircle className="text-emerald-400" />
                        <span className="text-emerald-300 text-sm">
                          Найдено: {event.items.filter(item => item.found).length}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-500/20">
                        <FiXCircle className="text-red-400" />
                        <span className="text-red-300 text-sm">
                          Не найдено: {event.items.filter(item => !item.found).length}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-900/20 border border-amber-500/20">
                        <FiAlertCircle className="text-amber-400" />
                        <span className="text-amber-300 text-sm">
                          Проблем: {event.items.filter(item => item.condition === 'needs_maintenance' || item.condition === 'broken').length}
                        </span>
                      </div>
                    </div>

                    {event.notes && (
                      <div className="mt-4 text-sm text-gray-400 italic bg-black/10 backdrop-blur-sm p-4 rounded-lg border border-violet-500/10">
                        {event.notes}
                      </div>
                    )}
                  </Motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Motion.div>
      </Motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <CreateInventoryModal
            isOpen={isCreateModalOpen}
            onClose={handleCloseCreateModal}
            locations={locations}
          />
        )}
        {isDetailsModalOpen && selectedEvent && (
          <InventoryDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            event={selectedEvent}
          />
        )}
        {isDeleteModalOpen && selectedEvent && (
          <ConfirmModal
            isOpen={isDeleteModalOpen}
            onClose={handleCloseDeleteModal}
            onConfirm={handleDelete}
            title="Удаление инвентаризации"
            message={`Вы уверены, что хотите удалить инвентаризацию от ${format(new Date(selectedEvent.event_date), 'd MMMM yyyy', { locale: ru })}?`}
            confirmText="Удалить"
            confirmStyle="danger"
          />
        )}
      </AnimatePresence>
    </div>
  )
} 