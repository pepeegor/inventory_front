import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import axios from '../../api/axiosClient'

export default function AddInventoryEventModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    event_date: new Date().toISOString().split('T')[0],
    location_id: '',
    notes: ''
  })
  
  const queryClient = useQueryClient()
  
  // Get locations for dropdown
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: () => axios.get('/locations/').then(res => res.data),
    enabled: isOpen
  })
  
  useEffect(() => {
    if (isOpen) {
      setFormData({
        event_date: new Date().toISOString().split('T')[0],
        location_id: '',
        notes: ''
      })
    }
  }, [isOpen])
  
  const mutation = useMutation({
    mutationFn: (data) => axios.post('/inventory-events/', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory-events'])
      toast.success('Событие инвентаризации создано')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Не удалось создать событие инвентаризации')
    }
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'location_id' ? (value ? Number(value) : '') : value
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!formData.location_id) {
      return toast.error('Выберите локацию')
    }
    
    const payload = {
      ...formData,
      location_id: Number(formData.location_id)
    }
    
    mutation.mutate(payload)
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Создать событие инвентаризации"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Дата проведения"
          name="event_date"
          type="date"
          value={formData.event_date}
          onChange={handleChange}
          required
        />
        
        <Select
          label="Локация"
          name="location_id"
          value={formData.location_id}
          onChange={handleChange}
          required
        >
          <option value="">-- Выберите локацию --</option>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>{loc.name}</option>
          ))}
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