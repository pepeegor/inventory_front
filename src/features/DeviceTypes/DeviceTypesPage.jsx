import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FiPlus, FiEdit, FiTrash, FiInfo, FiFilter, FiRefreshCw } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { useAuth } from '../../hooks/useAuth'
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

export default function DeviceTypesPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDeviceType, setSelectedDeviceType] = useState(null)
  const [partTypeFilter, setPartTypeFilter] = useState('')
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch device types with part type filter
  const { data: deviceTypes = [], isLoading } = useQuery({
    queryKey: ['deviceTypes', partTypeFilter],
    queryFn: async () => {
      const params = {}
      if (partTypeFilter) params.part_type_id = partTypeFilter
      return getAllDeviceTypes(params)
    }
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
      setIsDeleteModalOpen(false)
      setSelectedDeviceType(null)
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении типа устройства')
    }
  })

  // Handlers
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

  const handleFilterChange = (e) => {
    setPartTypeFilter(e.target.value)
  }

  const resetFilter = () => {
    setPartTypeFilter('')
  }

  // Check if user owns the device type
  const canModify = (deviceType) => deviceType.created_by === user?.id

  return (
    <AnimatedSection className="p-6">
      <h2 className="text-2xl font-bold mb-6">Типы устройств</h2>
      
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-end gap-4 w-full md:w-auto">
          <div className="w-full md:w-64">
            <Select
              label="Фильтр по типу детали"
              value={partTypeFilter}
              onChange={handleFilterChange}
              options={[
                { label: 'Все типы деталей', value: '' },
                ...partTypes.map(type => ({
                  label: type.name,
                  value: type.id
                }))
              ]}
            />
          </div>
          <Button
            variant="secondary"
            onClick={resetFilter}
            className="flex items-center gap-1 mb-0.5"
          >
            <FiRefreshCw size={16} /> Сбросить
          </Button>
        </div>
        
        <Button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          <FiPlus size={16} /> Добавить
        </Button>
      </div>
      
      {isLoading || isLoadingPartTypes ? (
        <Loader />
      ) : (
        <div className="bg-[#1f2937] rounded-lg overflow-hidden shadow-lg">
          {deviceTypes.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              Типы устройств не найдены
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Производитель
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Модель
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Тип детали
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Срок службы
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Создатель
                    </th>
                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {deviceTypes.map(deviceType => (
                    <tr key={deviceType.id} className="hover:bg-gray-700 transition-colors">
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {deviceType.id}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                        {deviceType.manufacturer}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-white">
                        {deviceType.model}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-900 text-indigo-300">
                          {deviceType.part_types?.name || 'Неизвестно'}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {deviceType.expected_lifetime_months ? `${deviceType.expected_lifetime_months} мес.` : 'Не указано'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        {deviceType.created_by === user?.id ? 'Вы' : `ID: ${deviceType.created_by}`}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex space-x-2">
                          <Button 
                            variant="icon" 
                            onClick={() => handleOpenDetailsModal(deviceType)}
                            title="Детали"
                          >
                            <FiInfo className="text-blue-400" />
                          </Button>
                          
                          <Button 
                            variant="icon" 
                            onClick={() => handleOpenEditModal(deviceType)}
                            title="Редактировать"
                            disabled={!canModify(deviceType)}
                            className={!canModify(deviceType) ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            <FiEdit className="text-blue-400" />
                          </Button>
                          
                          <Button 
                            variant="icon" 
                            onClick={() => handleOpenDeleteModal(deviceType)}
                            title="Удалить"
                            disabled={!canModify(deviceType)}
                            className={!canModify(deviceType) ? 'opacity-50 cursor-not-allowed' : ''}
                          >
                            <FiTrash className="text-red-400" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
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
          partTypes={partTypes}
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
        <ConfirmModal 
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDelete}
          title="Удаление типа устройства"
          message={`Вы уверены, что хотите удалить тип устройства "${selectedDeviceType.manufacturer} ${selectedDeviceType.model}"?`}
          confirmText="Удалить"
          cancelText="Отмена"
          isLoading={deleteMutation.isLoading}
        />
      )}
    </AnimatedSection>
  )
}
