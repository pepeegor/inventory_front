import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import axios from '../../api/axiosClient'

export default function AddMovementModal({ isOpen, onClose, deviceId, currentLocationId }) {
  const [formData, setFormData] = useState({
    from_location_id: '',
    to_location_id: '',
    moved_at: new Date().toISOString().split('T')[0],
    notes: ''
  })
  
  const queryClient = useQueryClient()
  
  // Get locations for dropdowns
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => axios.get('/locations/').then(res => res.data),
    enabled: isOpen
  })
  
  useEffect(() => {
    if (isOpen) {
      setFormData({
        from_location_id: currentLocationId || '',
        to_location_id: '',
        moved_at: new Date().toISOString().split('T')[0],
        notes: ''
      })
    }
  }, [isOpen, currentLocationId])
  
  const mutation = useMutation({
    mutationFn: (data) => axios.post(`/devices/${deviceId}/movements/`, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['devices'])
      queryClient.invalidateQueries(['movements', deviceId])
      toast.success('Перемещение зарегистрировано')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Не удалось зарегистрировать перемещение')
    }
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'from_location_id' || name === 'to_location_id' 
        ? value ? Number(value) : '' 
        : value
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.to_location_id) {
      return toast.error('Выберите новую локацию')
    }
    
    if (formData.from_location_id === formData.to_location_id) {
      return toast.error('Новая локация совпадает с текущей')
    }
    
    mutation.mutate(formData)
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Переместить устройство"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Откуда (текущая локация)"
          name="from_location_id"
          value={formData.from_location_id}
          onChange={handleChange}
          disabled={currentLocationId}
        >
          <option value="">-- Не указано --</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </Select>
        
        <Select
          label="Куда (новая локация)"
          name="to_location_id"
          value={formData.to_location_id}
          onChange={handleChange}
          required
        >
          <option value="">-- Выберите локацию --</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
        </Select>
        
        <Input
          label="Дата перемещения"
          name="moved_at"
          type="datetime-local"
          value={formData.moved_at}
          onChange={handleChange}
        />
        
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
            Переместить
          </Button>
        </div>
      </form>
    </Modal>
  )
} 