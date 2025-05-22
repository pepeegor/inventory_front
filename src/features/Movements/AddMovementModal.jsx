import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { addDeviceMovement } from '../../api/deviceMovements'
import Modal from '../../components/common/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

export default function AddMovementModal({ isOpen, onClose, devices, locations }) {
  const [formData, setFormData] = useState({
    device_id: '',
    from_location_id: '',
    to_location_id: '',
    moved_at: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const [selectedDevice, setSelectedDevice] = useState(null)
  
  const queryClient = useQueryClient()
  
  // Update from_location when device changes
  useEffect(() => {
    if (formData.device_id) {
      const device = devices.find(d => d.id === parseInt(formData.device_id))
      setSelectedDevice(device)
      
      if (device?.current_location?.id) {
        setFormData(prev => ({
          ...prev,
          from_location_id: String(device.current_location.id)
        }))
      }
    }
  }, [devices, formData.device_id])
  
  const createMutation = useMutation({
    mutationFn: (data) => {
      const { device_id, ...movementData } = data
      return addDeviceMovement(device_id, movementData)
    },
    onSuccess: () => {
      toast.success('Перемещение устройства успешно зарегистрировано')
      queryClient.invalidateQueries(['movements'])
      queryClient.invalidateQueries(['devices'])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при регистрации перемещения')
    }
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = () => {
    // Validate
    if (!formData.device_id || !formData.from_location_id || !formData.to_location_id || !formData.moved_at) {
      toast.error('Заполните обязательные поля')
      return
    }
    
    if (formData.from_location_id === formData.to_location_id) {
      toast.error('Локации отправления и назначения должны отличаться')
      return
    }
    
    // Process data
    const dataToSubmit = {
      ...formData,
      device_id: parseInt(formData.device_id),
      from_location_id: parseInt(formData.from_location_id),
      to_location_id: parseInt(formData.to_location_id),
      moved_at: new Date(formData.moved_at).toISOString()
    }
    
    createMutation.mutate(dataToSubmit)
  }
  
  return (
    <Modal
      title="Регистрация перемещения устройства"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-2">
        <Select
          label="Устройство"
          name="device_id"
          value={formData.device_id}
          onChange={handleChange}
          required
          options={[
            { label: 'Выберите устройство', value: '' },
            ...devices.map(device => ({
              label: `${device.type?.manufacturer} ${device.type?.model} (${device.serial_number})`,
              value: device.id
            }))
          ]}
        />
        
        {selectedDevice && (
          <div className="p-3 bg-gray-700 rounded-lg text-sm">
            <div className="text-gray-300">Текущая локация устройства:</div>
            <div className="font-medium text-white">{selectedDevice.current_location?.name || 'Не указана'}</div>
          </div>
        )}
        
        <Select
          label="Откуда (исходная локация)"
          name="from_location_id"
          value={formData.from_location_id}
          onChange={handleChange}
          required
          options={[
            { label: 'Выберите локацию', value: '' },
            ...locations.map(location => ({
              label: location.name,
              value: location.id
            }))
          ]}
        />
        
        <Select
          label="Куда (новая локация)"
          name="to_location_id"
          value={formData.to_location_id}
          onChange={handleChange}
          required
          options={[
            { label: 'Выберите локацию', value: '' },
            ...locations.map(location => ({
              label: location.name,
              value: location.id
            }))
          ]}
        />
        
        <Input
          label="Дата перемещения"
          name="moved_at"
          type="datetime-local"
          value={formData.moved_at}
          onChange={handleChange}
          required
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Примечания
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows="3"
            placeholder="Укажите дополнительную информацию о перемещении"
          ></textarea>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Отмена
        </Button>
        <Button 
          onClick={handleSubmit} 
          disabled={createMutation.isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          {createMutation.isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </Modal>
  )
} 