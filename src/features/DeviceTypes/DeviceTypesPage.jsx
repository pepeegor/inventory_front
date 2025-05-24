import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiEdit, FiTrash, FiInfo, FiFilter, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import AnimatedSection from '../../components/AnimatedSection'
import Loader from '../../components/ui/Loader'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import { getAllDeviceTypes, deleteDeviceType } from '../../api/deviceTypes'
import { getAllPartTypes } from '../../api/partTypes'
import AddDeviceTypeModal from './AddDeviceTypeModal'
import EditDeviceTypeModal from './EditDeviceTypeModal'
import DeviceTypeDetailsModal from './DeviceTypeDetailsModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { Dialog } from '@headlessui/react'
import { FaPlus, FaEdit, FaTrash, FaFilter, FaSync, FaSearch, FaTimes, FaServer, FaMemory, FaNetworkWired, FaHdd } from 'react-icons/fa'

export default function DeviceTypesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDeviceType, setSelectedDeviceType] = useState(null)
  const [filters, setFilters] = useState({
    manufacturer: '',
    part_type: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const queryClient = useQueryClient()

  // Fetch device types
  const { data: deviceTypes = [], isLoading } = useQuery({
    queryKey: ['deviceTypes', filters],
    queryFn: () => getAllDeviceTypes(),
    staleTime: 5 * 60 * 1000 // Consider data fresh for 5 minutes
  })

  // Fetch part types for filter
  const { data: partTypes = [], isLoading: isLoadingPartTypes } = useQuery({
    queryKey: ['partTypes'],
    queryFn: () => getAllPartTypes()
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => deleteDeviceType(id),
    onSuccess: () => {
      toast.success('Тип устройства успешно удален')
      queryClient.invalidateQueries(['deviceTypes'])
      handleCloseDeleteModal()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении типа устройства')
    }
  })

  // Calculate device type stats
  const deviceTypeStats = {
    total: deviceTypes.length,
    manufacturers: new Set(deviceTypes.map(t => t.manufacturer)).size,
    networkDevices: deviceTypes.filter(t => t.part_types?.name?.toLowerCase().includes('сеть')).length,
    scanerDevices: deviceTypes.filter(t => t.part_types?.name?.toLowerCase().includes('сканер')).length,
    processingDevices: deviceTypes.filter(t => 
      t.part_types?.name?.toLowerCase().includes('процессор') || 
      t.part_types?.name?.toLowerCase().includes('память')
    ).length
  }

  // Filter device types by search term
  const filteredDeviceTypes = deviceTypes.filter(type => 
    type.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    type.part_types?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      manufacturer: '',
      part_type: ''
    })
  }

  const handleOpenAddModal = () => setIsAddModalOpen(true)
  const handleCloseAddModal = () => setIsAddModalOpen(false)

  const handleOpenEditModal = (deviceType) => {
    setSelectedDeviceType(deviceType)
    setIsEditModalOpen(true)
  }
  
  const handleCloseEditModal = () => {
    setSelectedDeviceType(null)
    setIsEditModalOpen(false)
  }

  const handleOpenDetailsModal = (deviceType) => {
    setSelectedDeviceType(deviceType)
    setIsDetailsModalOpen(true)
  }
  
  const handleCloseDetailsModal = () => {
    setSelectedDeviceType(null)
    setIsDetailsModalOpen(false)
  }

  const handleOpenDeleteModal = (deviceType) => {
    setSelectedDeviceType(deviceType)
    setIsDeleteModalOpen(true)
  }
  
  const handleCloseDeleteModal = () => {
    setSelectedDeviceType(null)
    setIsDeleteModalOpen(false)
  }

  const handleDelete = () => {
    if (selectedDeviceType) {
      deleteMutation.mutate(selectedDeviceType.id)
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
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FaServer className="text-violet-400" />
            Типы устройств
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по типам устройств..."
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
              <FaPlus /> Добавить тип устройства
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Производитель
                  </label>
                  <select
                    value={filters.manufacturer}
                    onChange={(e) => handleFilterChange('manufacturer', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">Все производители</option>
                    {Array.from(new Set(deviceTypes.map(t => t.manufacturer))).map(manufacturer => (
                      <option key={manufacturer} value={manufacturer}>
                        {manufacturer}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Тип компонента
                  </label>
                  <select
                    value={filters.part_type}
                    onChange={(e) => handleFilterChange('part_type', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">Все типы</option>
                    {Array.from(new Set(deviceTypes.map(t => t.part_types?.name).filter(Boolean))).map(type => (
                      <option key={type} value={type}>
                        {type}
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
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Stats Cards */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6"
        >
          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-violet-800/20 backdrop-blur-sm border border-violet-500/20"
          >
            <div className="text-sm text-violet-300 mb-1">Всего типов</div>
            <div className="text-2xl font-bold text-white">{deviceTypeStats.total}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 backdrop-blur-sm border border-emerald-500/20"
          >
            <div className="text-sm text-emerald-300 mb-1">Производителей</div>
            <div className="text-2xl font-bold text-white">{deviceTypeStats.manufacturers}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-blue-900/30 to-blue-800/20 backdrop-blur-sm border border-blue-500/20"
          >
            <div className="text-sm text-blue-300 mb-1 flex items-center gap-2">
              <FaNetworkWired className="text-blue-400" />
              Сетевые
            </div>
            <div className="text-2xl font-bold text-white">{deviceTypeStats.networkDevices}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-800/20 backdrop-blur-sm border border-amber-500/20"
          >
            <div className="text-sm text-amber-300 mb-1 flex items-center gap-2">
              <FaMemory className="text-amber-400" />
              Обработка данных
            </div>
            <div className="text-2xl font-bold text-white">{deviceTypeStats.processingDevices}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-purple-900/30 to-purple-800/20 backdrop-blur-sm border border-purple-500/20"
          >
            <div className="text-sm text-purple-300 mb-1 flex items-center gap-2">
              <FaHdd className="text-purple-400" />
              Сканеры
            </div>
            <div className="text-2xl font-bold text-white">{deviceTypeStats.scanerDevices}</div>
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
          ) : filteredDeviceTypes.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              {searchTerm ? 'Типы устройств не найдены' : 'Нет типов устройств'}
            </div>
          ) : (
            <div className="relative z-10">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800/50">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Производитель</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Модель</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Тип компонента</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {filteredDeviceTypes.map((type) => (
                    <Motion.tr
                      key={type.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      className="transition-colors cursor-pointer"
                      onClick={() => handleOpenDetailsModal(type)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-gray-300">{type.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{type.manufacturer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-white">{type.model}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {type.part_types?.name ? (
                          <span className="px-2 py-1 rounded-full text-xs bg-violet-900/50 text-violet-300 border border-violet-500/20">
                            {type.part_types.name}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenEditModal(type)
                            }}
                            className="p-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors"
                            title="Редактировать"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleOpenDeleteModal(type)
                            }}
                            className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
                            title="Удалить"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </Motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Motion.div>
      </Motion.div>

      {/* Modals */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddDeviceTypeModal
            isOpen={isAddModalOpen}
            onClose={handleCloseAddModal}
            partTypes={partTypes}
          />
        )}
        {isEditModalOpen && selectedDeviceType && (
          <EditDeviceTypeModal
            isOpen={isEditModalOpen}
            onClose={handleCloseEditModal}
            deviceType={selectedDeviceType}
          />
        )}
        {isDetailsModalOpen && selectedDeviceType && (
          <DeviceTypeDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={handleCloseDetailsModal}
            deviceType={selectedDeviceType}
          />
        )}
        {isDeleteModalOpen && selectedDeviceType && (
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
                    Удаление типа устройства
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
                    Вы уверены, что хотите удалить тип устройства <span className="text-white font-medium">'{selectedDeviceType.manufacturer} {selectedDeviceType.model}'</span>?
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
