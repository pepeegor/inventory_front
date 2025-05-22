import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'
import { FiPlus, FiFilter, FiRefreshCw } from 'react-icons/fi'
import AnimatedSection from '../../components/AnimatedSection'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Loader from '../../components/ui/Loader'
import { getAllMovements } from '../../api/deviceMovements'
import { getAllLocations } from '../../api/locations'
import { getAllDevices } from '../../api/devices'
import AddMovementModal from './AddMovementModal'

export default function MovementsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    device_id: '',
    location_from: '',
    location_to: '',
    date_from: '',
    date_to: ''
  })
  
  // Fetch movements with filters
  const { 
    data: movements = [], 
    isLoading: isLoadingMovements 
  } = useQuery({
    queryKey: ['movements', filters],
    queryFn: async () => {
      // Convert empty strings to undefined
      const params = {}
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value
      })
      return getAllMovements(params)
    }
  })
  
  // Fetch locations for filters
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getAllLocations()
  })
  
  // Fetch devices for filters
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => getAllDevices()
  })
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }
  
  const resetFilters = () => {
    setFilters({
      device_id: '',
      location_from: '',
      location_to: '',
      date_from: '',
      date_to: ''
    })
  }
  
  const handleOpenAddModal = () => setIsAddModalOpen(true)
  const handleCloseAddModal = () => setIsAddModalOpen(false)
  
  const formatDateTime = (dateTimeStr) => {
    try {
      return format(new Date(dateTimeStr), 'dd.MM.yyyy HH:mm')
    } catch {
      return 'Некорректная дата'
    }
  }

  return (
    <AnimatedSection className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Перемещения устройств</h2>
        <Button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1"
        >
          <FiPlus size={16} /> Добавить перемещение
        </Button>
      </div>
      
      {/* Filters */}
      <div className="bg-[#1f2937] rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Select
            label="Устройство"
            name="device_id"
            value={filters.device_id}
            onChange={handleFilterChange}
            options={[
              { label: 'Все устройства', value: '' },
              ...devices.map(device => ({
                label: `${device.type?.manufacturer} ${device.type?.model} (${device.serial_number})`,
                value: device.id
              }))
            ]}
          />
          
          <Select
            label="Откуда"
            name="location_from"
            value={filters.location_from}
            onChange={handleFilterChange}
            options={[
              { label: 'Все локации', value: '' },
              ...locations.map(location => ({
                label: location.name,
                value: location.id
              }))
            ]}
          />
          
          <Select
            label="Куда"
            name="location_to"
            value={filters.location_to}
            onChange={handleFilterChange}
            options={[
              { label: 'Все локации', value: '' },
              ...locations.map(location => ({
                label: location.name,
                value: location.id
              }))
            ]}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            label="С даты"
            name="date_from"
            type="date"
            value={filters.date_from}
            onChange={handleFilterChange}
          />
          
          <Input
            label="По дату"
            name="date_to"
            type="date"
            value={filters.date_to}
            onChange={handleFilterChange}
          />
        </div>
        
        <div className="flex justify-end gap-2 mt-2">
          <Button 
            variant="secondary"
            onClick={resetFilters}
            className="flex items-center gap-1"
          >
            <FiRefreshCw size={16} /> Сбросить
          </Button>
          <Button
            onClick={() => {}} // Фильтры применяются автоматически через хук React Query
            className="flex items-center gap-1"
          >
            <FiFilter size={16} /> Применить
          </Button>
        </div>
      </div>
      
      {/* Movements list */}
      {isLoadingMovements ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {movements.length === 0 ? (
            <div className="bg-[#1f2937] rounded-lg p-8 text-center text-gray-400">
              Перемещения не найдены
            </div>
          ) : (
            <div className="bg-[#1f2937] rounded-lg overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead className="bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Устройство
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Откуда
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Куда
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Дата
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Сотрудник
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Примечание
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-gray-800 divide-y divide-gray-700">
                    {movements.map(movement => (
                      <tr key={movement.id} className="hover:bg-gray-700 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {movement.device?.serial_number || 'Неизвестно'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {movement.from_location?.name || 'Неизвестно'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {movement.to_location?.name || 'Неизвестно'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {formatDateTime(movement.moved_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {movement.performed_by_user?.full_name || 'Неизвестно'}
                        </td>
                        <td className="px-6 py-4 text-sm text-white">
                          {movement.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
      
      {isAddModalOpen && (
        <AddMovementModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          devices={devices}
          locations={locations}
        />
      )}
    </AnimatedSection>
  )
} 