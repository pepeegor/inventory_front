import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import axios from '../../api/axiosClient'

export default function AddInventoryItemModal({ isOpen, onClose, eventId, locationId }) {
  const [formData, setFormData] = useState({
    device_id: '',
    found: true,
    condition: 'good',
    comments: ''
  })
  
  const queryClient = useQueryClient()
  
  // Get devices for dropdown (filtered by location)
  const { data: devices = [] } = useQuery({
    queryKey: ['devices', { locationId }],
    queryFn: () => axios.get('/devices/', { 
      params: { current_location_id: locationId } 
    }).then(res => res.data),
    enabled: isOpen && !!locationId
  })
  
  useEffect(() => {
    if (isOpen) {
      setFormData({
        device_id: '',
        found: true,
        condition: 'good',
        comments: ''
      })
    }
  }, [isOpen])
  
  const mutation = useMutation({
    mutationFn: (data) => axios.post(`/inventory-events/${eventId}/items`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory-events', eventId])
      toast.success('Результат инвентаризации добавлен')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Не удалось добавить результат инвентаризации')
    }
  })
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' 
        ? checked 
        : name === 'device_id' 
          ? (value ? Number(value) : '') 
          : value
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.device_id) {
      return toast.error('Выберите устройство')
    }
    
    const payload = {
      ...formData,
      device_id: Number(formData.device_id)
    }
    
    mutation.mutate(payload)
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Добавить результат инвентаризации"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Устройство"
          name="device_id"
          value={formData.device_id}
          onChange={handleChange}
          required
        >
          <option value="">-- Выберите устройство --</option>
          {devices.map(device => (
            <option key={device.id} value={device.id}>
              {device.serial_number} ({device.type?.manufacturer} {device.type?.model})
            </option>
          ))}
        </Select>
        
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="found"
            name="found"
            checked={formData.found}
            onChange={handleChange}
            className="rounded bg-gray-700 border-gray-600 text-violet-500 focus:ring-violet-500"
          />
          <label htmlFor="found" className="text-gray-300">Устройство обнаружено</label>
        </div>
        
        <Select
          label="Состояние"
          name="condition"
          value={formData.condition}
          onChange={handleChange}
        >
          <option value="good">Хорошее</option>
          <option value="damaged">Повреждено</option>
          <option value="repair_needed">Требует ремонта</option>
        </Select>
        
        <Input
          label="Комментарии"
          name="comments"
          value={formData.comments}
          onChange={handleChange}
        />
        
        <div className="flex gap-3 justify-end mt-6">
          <Button 
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Отмена
          </Button>
          <Button
            type="submit"
            isLoading={mutation.isLoading}
          >
            Добавить
          </Button>
        </div>
      </form>
    </Modal>
  )
} 