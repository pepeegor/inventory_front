import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { addDeviceMovement } from '../../api/deviceMovements'
import { getAllLocations } from '../../api/locations'
import Modal from '../../components/common/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Loader from '../../components/ui/Loader'
import { flattenLocationTree } from '../../utils/locationUtils'

export default function AddDeviceMovementModal({ isOpen, onClose, device }) {
  const [locations, setLocations] = useState([])
  const [selectedFromLocation, setSelectedFromLocation] = useState(device.current_location_id)
  const [selectedToLocation, setSelectedToLocation] = useState(null)
  const [loading, setLoading] = useState(false)

  const queryClient = useQueryClient()
  
  // Fetch locations for the select inputs
  const { data: locationsData = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: () => getAllLocations()
  })
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await getAllLocations()
        setLocations(data)
      } catch (error) {
        console.error('Ошибка при получении локаций:', error)
      }
    }

    fetchLocations()
  }, [])
  
  const createMutation = useMutation({
    mutationFn: (data) => addDeviceMovement(device.id, data),
    onSuccess: () => {
      toast.success('Перемещение устройства успешно зарегистрировано')
      queryClient.invalidateQueries(['deviceMovements', device.id])
      queryClient.invalidateQueries(['device', device.id])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при регистрации перемещения')
    }
  })
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    // Логика для отправки перемещения
  }
  
  if (isLoadingLocations) {
    return (
      <Modal
        title="Добавление перемещения"
        isOpen={isOpen}
        onClose={onClose}
      >
        <div className="py-8 flex justify-center">
          <Loader />
        </div>
      </Modal>
    )
  }
  
  return (
    <Modal
      title="Регистрация перемещения устройства"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Текущая локация
          </label>
          <select
            value={selectedFromLocation}
            onChange={(e) => setSelectedFromLocation(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
            disabled
          >
            <option value={device.current_location_id}>
              {locations.find(loc => loc.id === device.current_location_id)?.name || 'Неизвестно'}
            </option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Переместить в
          </label>
          <select
            value={selectedToLocation}
            onChange={(e) => setSelectedToLocation(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
            required
          >
            <option value="">Выберите локацию</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  )
} 