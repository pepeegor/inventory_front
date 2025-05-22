import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import axios from '../../api/axiosClient'

export default function AddMaintenanceTaskModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    device_id: '',
    task_type: '',
    scheduled_date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'scheduled'
  })
  
  const queryClient = useQueryClient()
  
  // Get devices for dropdown
  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: () => axios.get('/devices/').then(res => res.data),
    enabled: isOpen
  })
  
  useEffect(() => {
    if (isOpen) {
      setFormData({
        device_id: '',
        task_type: '',
        scheduled_date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'scheduled'
      })
    }
  }, [isOpen])
  
  const mutation = useMutation({
    mutationFn: (data) => axios.post('/maintenance-tasks/', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['maintenance-tasks'])
      toast.success('Задача обслуживания создана')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Не удалось создать задачу обслуживания')
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
    if (!formData.task_type.trim()) {
      return toast.error('Введите тип задачи')
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
      title="Создать задачу обслуживания"
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
        
        <Input
          label="Тип задачи"
          name="task_type"
          value={formData.task_type}
          onChange={handleChange}
          placeholder="Например: Замена детали, Профилактика, Чистка"
          required
        />
        
        <Input
          label="Дата выполнения"
          name="scheduled_date"
          type="date"
          value={formData.scheduled_date}
          onChange={handleChange}
          required
        />
        
        <Select
          label="Статус"
          name="status"
          value={formData.status}
          onChange={handleChange}
        >
          <option value="scheduled">Запланировано</option>
          <option value="in_progress">В процессе</option>
          <option value="completed">Выполнено</option>
          <option value="cancelled">Отменено</option>
        </Select>
        
        <Input
          label="Примечания"
          name="notes"
          value={formData.notes}
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