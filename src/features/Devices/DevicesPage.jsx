import { useState } from 'react'
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { FaPlus, FaEdit, FaTrash, FaFilter, FaSync, FaServer, FaSearch, FaTimes } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { FiMap } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { getAllDevices, deleteDevice } from '../../api/devices'
import { getAllDeviceTypes } from '../../api/deviceTypes'
import { useLocations } from '../../hooks/useLocations'
import AddDeviceModal from './AddDeviceModal'
import EditDeviceModal from './EditDeviceModal'
import DeviceDetailsModal from './DeviceDetailsModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { flattenLocationTree } from '../../utils/locationUtils'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@headlessui/react'

const DEVICE_STATUSES = {
  active: 'Активно',
  maintenance: 'На обслуживании',
  decommissioned: 'Списано'
}

export default function DevicesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [filters, setFilters] = useState({
    type_id: '',
    status: '',
    current_location_id: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const { isAdmin: _isAdmin } = usePermissions()
  const { locations } = useLocations()
  const queryClient = useQueryClient()

  // Fetch devices with filters
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices', filters],
    queryFn: async () => {
      const filterParams = {}
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          filterParams[key] = filters[key]
        }
      })
      const data = await getAllDevices(filterParams)
      // Сортируем устройства по ID в порядке возрастания
      return data.sort((a, b) => a.id - b.id)
    }
  })

  // Fetch device types
  const { data: deviceTypes = [] } = useQuery({
    queryKey: ['deviceTypes'],
    queryFn: () => getAllDeviceTypes(),
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    onError: (error) => {
      console.error('Error fetching device types:', error)
      toast.error('Failed to load device types')
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDevice(id),
    onSuccess: () => {
      toast.success('Устройство успешно удалено')
      queryClient.invalidateQueries(['devices'])
      handleCloseDeleteModal()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении устройства')
    }
  })

  // Calculate device stats
  const deviceStats = {
    total: devices.length,
    active: devices.filter(d => d.status === 'active').length,
    maintenance: devices.filter(d => d.status === 'maintenance').length,
    decommissioned: devices.filter(d => d.status === 'decommissioned').length
  }

  // Filter devices by search term
  const filteredDevices = devices.filter(device => 
    device.serial_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deviceTypes.find(t => t.id === device.device_type_id)?.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    // Filters are automatically applied through useQuery
    queryClient.invalidateQueries(['devices'])
  }

  const resetFilters = () => {
    setFilters({
      type_id: '',
      status: '',
      current_location_id: ''
    })
  }

  const handleOpenAddModal = () => setIsAddModalOpen(true)
  const handleCloseAddModal = () => {
    setIsAddModalOpen(false)
    queryClient.invalidateQueries(['devices'])
  }

  const handleOpenEditModal = (device) => {
    setSelectedDevice(device)
    setIsEditModalOpen(true)
  }
  
  const handleCloseEditModal = () => {
    setSelectedDevice(null)
    setIsEditModalOpen(false)
    queryClient.invalidateQueries(['devices'])
  }

  const handleCloseDetailsModal = () => {
    setSelectedDevice(null)
    setIsDetailsModalOpen(false)
  }

  const handleOpenDeleteModal = (device) => {
    setSelectedDevice(device)
    setIsDeleteModalOpen(true)
  }
  
  const handleCloseDeleteModal = () => {
    setSelectedDevice(null)
    setIsDeleteModalOpen(false)
  }

  const handleDelete = () => {
    if (selectedDevice) {
      deleteMutation.mutate(selectedDevice.id)
    }
  }

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-900/50 text-green-300';
      case 'maintenance':
        return 'bg-yellow-900/50 text-yellow-300';
      case 'decommissioned':
        return 'bg-red-900/50 text-red-300';
      default:
        return 'bg-gray-900/50 text-gray-300';
    }
  };

  const getWarrantyStatus = (warrantyEnd) => {
    if (!warrantyEnd) return { text: 'Не указана', color: 'gray' }
    
    const endDate = new Date(warrantyEnd)
    const now = new Date()
    const monthsRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24 * 30.5))
    
    if (endDate < now) {
      return { text: 'Истекла', color: 'red' }
    }
    
    if (monthsRemaining <= 1) {
      return { text: `Истекает через ${monthsRemaining} мес.`, color: 'amber' }
    }
    
    return { text: `Действует (${monthsRemaining} мес.)`, color: 'emerald' }
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
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaServer className="text-violet-400" />
            Устройства
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по устройствам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" />
            </div>
            
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 text-white rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <FaPlus /> Добавить устройство
            </button>
          </div>
        </div>

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
                <FaFilter className="text-violet-400" />
                <h3 className="text-lg font-medium text-white">Фильтры</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6 bg-gradient-to-b from-violet-900/10 to-transparent">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Тип устройства
                  </label>
                  <select
                    value={filters.type_id}
                    onChange={(e) => handleFilterChange('type_id', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">Все типы</option>
                    {deviceTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.manufacturer} {type.model}
                        {type.part_types?.name ? ` (${type.part_types.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Статус
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">Все статусы</option>
                    {Object.entries(DEVICE_STATUSES).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Локация
                  </label>
                  <select
                    value={filters.current_location_id || ''}
                    onChange={(e) => handleFilterChange('current_location_id', e.target.value)}
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
                  <FaSync className="text-sm" /> Сбросить
                </button>
                <button
                  onClick={applyFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors border border-violet-500/20"
                >
                  <FaFilter className="text-sm" /> Применить
                </button>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Stats Cards */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
        >
          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-violet-800/20 backdrop-blur-sm border border-violet-500/20"
          >
            <div className="text-sm text-violet-300 mb-1">Всего устройств</div>
            <div className="text-2xl font-bold text-white">{deviceStats.total}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 backdrop-blur-sm border border-emerald-500/20"
          >
            <div className="text-sm text-emerald-300 mb-1">Активных</div>
            <div className="text-2xl font-bold text-white">{deviceStats.active}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-800/20 backdrop-blur-sm border border-amber-500/20"
          >
            <div className="text-sm text-amber-300 mb-1">В ремонте</div>
            <div className="text-2xl font-bold text-white">{deviceStats.maintenance}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm border border-blue-500/20"
          >
            <div className="text-sm text-blue-300 mb-1">Списано</div>
            <div className="text-2xl font-bold text-white">{deviceStats.decommissioned}</div>
          </Motion.div>
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
          ) : filteredDevices.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              {searchTerm ? 'Устройства не найдены' : 'Нет устройств'}
            </div>
          ) : (
            <div className="relative z-10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Серийный номер</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Локация</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Статус</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Гарантия</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredDevices.map((device) => {
                    const warrantyStatus = getWarrantyStatus(device.warranty_end)
                    const deviceType = deviceTypes.find(t => t.id === device.type_id)
                    
                    return (
                      <Motion.tr
                        key={device.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        className="transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedDevice(device)
                          setIsDetailsModalOpen(true)
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{device.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          <div className="flex flex-col">
                            <span>{device.serial_number}</span>
                            {device.name && (
                              <span className="text-sm text-gray-400">{device.name}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {deviceType ? (
                            <div className="flex flex-col">
                              <span className="text-white">{deviceType.manufacturer} {deviceType.model}</span>
                              {deviceType.part_types?.name && (
                                <span className="text-sm text-violet-400">{deviceType.part_types.name}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-500">Тип не найден</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-300">
                          {device.current_location?.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(device.status)}`}>
                            {DEVICE_STATUSES[device.status] || 'Неизвестно'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded-full text-xs bg-${warrantyStatus.color}-900/50 text-${warrantyStatus.color}-300`}>
                            {warrantyStatus.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenEditModal(device)
                              }}
                              className="p-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors"
                              title="Редактировать"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOpenDeleteModal(device)
                              }}
                              className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
                              title="Удалить"
                            >
                              <FaTrash />
                            </button>
                            <Link
                              to={`/devices/${device.id}/movements`}
                              onClick={(e) => e.stopPropagation()}
                              className="p-2 bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 rounded-lg transition-colors"
                              title="История перемещений"
                            >
                              <FiMap />
                            </Link>
                          </div>
                        </td>
                      </Motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Motion.div>
      </Motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddDeviceModal
            isOpen={isAddModalOpen}
            onClose={handleCloseAddModal}
            onSuccess={applyFilters}
            deviceTypes={deviceTypes}
            locations={locations}
          />
        )}
        {isEditModalOpen && selectedDevice && (
          <EditDeviceModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            device={selectedDevice}
            onSuccess={applyFilters}
            deviceTypes={deviceTypes}
            locations={locations}
          />
        )}
        {isDetailsModalOpen && selectedDevice && (
          <DeviceDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            device={selectedDevice}
            deviceTypes={deviceTypes}
            locations={locations}
          />
        )}
        {isDeleteModalOpen && selectedDevice && (
          <Dialog
            open={isDeleteModalOpen}
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
                    Удаление устройства
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
                    Вы уверены, что хотите удалить устройство <span className="text-white font-medium">'{selectedDevice.serial_number}'</span>?
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
      </AnimatePresence>
    </div>
  )
}
