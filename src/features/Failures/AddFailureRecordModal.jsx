import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import axios from '../../api/axiosClient'

export default function AddFailureRecordModal({ isOpen, onClose, deviceId = null }) {
  const [formData, setFormData] = useState({
    device_id: deviceId || '',
    failure_date: new Date().toISOString().split('T')[0],
    description: ''
  })
  
  const queryClient = useQueryClient()
  
  // Get devices for dropdown if deviceId is not provided
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => axios.get('/devices/').then(res => res.data),
    enabled: isOpen && !deviceId
  })
  
  useEffect(() => {
    if (isOpen) {
      setFormData({
        device_id: deviceId || '',
        failure_date: new Date().toISOString().split('T')[0],
        description: ''
      })
    }
  }, [isOpen, deviceId])
  
  const mutation = useMutation({
    mutationFn: (data) => axios.post('/failure-records', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['failures'])
      if (deviceId) {
        queryClient.invalidateQueries(['failures', deviceId])
      }
      toast.success('Запись об отказе создана')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Не удалось создать запись об отказе')
    }
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'device_id' ? (value ? Number(value) : '') : value
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
      title="Создать запись об отказе"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!deviceId && (
          <Select
            label="Устройство"
            name="device_id"
            value={formData.device_id}
            onChange={handleChange}
            required
            disabled={!!deviceId}
          >
            <option value="">-- Выберите устройство --</option>
            {devices.map(device => (
              <option key={device.id} value={device.id}>
                {device.serial_number} ({device.type?.manufacturer} {device.type?.model})
              </option>
            ))}
          </Select>
        )}
        
        <Input
          label="Дата отказа"
          name="failure_date"
          type="date"
          value={formData.failure_date}
          onChange={handleChange}
          required
        />
        
        <Input
          label="Описание"
          name="description"
          value={formData.description}
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
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  )
} 