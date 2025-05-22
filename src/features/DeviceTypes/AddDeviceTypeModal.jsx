import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { createDeviceType } from '../../api/deviceTypes'
import Modal from '../../components/common/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

export default function AddDeviceTypeModal({ isOpen, onClose, partTypes }) {
  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    expected_lifetime_months: '',
    part_type_id: ''
  })
  
  const queryClient = useQueryClient()
  
  const createMutation = useMutation({
    mutationFn: (data) => createDeviceType(data),
    onSuccess: () => {
      toast.success('Тип устройства успешно создан')
      queryClient.invalidateQueries(['deviceTypes'])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при создании типа устройства')
    }
  })
  
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = () => {
    // Validate
    if (!formData.manufacturer || !formData.model || !formData.part_type_id) {
      toast.error('Заполните обязательные поля')
      return
    }
    
    // Process data
    const dataToSubmit = {
      ...formData,
      part_type_id: parseInt(formData.part_type_id),
      expected_lifetime_months: formData.expected_lifetime_months 
        ? parseInt(formData.expected_lifetime_months) 
        : null
    }
    
    createMutation.mutate(dataToSubmit)
  }
  
  return (
    <Modal
      title="Создание типа устройства"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-2">
        <Input
          label="Производитель"
          name="manufacturer"
          value={formData.manufacturer}
          onChange={handleChange}
          required
          placeholder="Введите производителя"
        />
        
        <Input
          label="Модель"
          name="model"
          value={formData.model}
          onChange={handleChange}
          required
          placeholder="Введите модель"
        />
        
        <Select
          label="Тип детали"
          name="part_type_id"
          value={formData.part_type_id}
          onChange={handleChange}
          required
          options={[
            { label: 'Выберите тип детали', value: '' },
            ...partTypes.map(type => ({
              label: type.name,
              value: type.id
            }))
          ]}
        />
        
        <Input
          label="Ожидаемый срок службы (месяцев)"
          name="expected_lifetime_months"
          type="number"
          min="1"
          value={formData.expected_lifetime_months}
          onChange={handleChange}
          placeholder="Введите срок службы в месяцах"
        />
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
          {createMutation.isLoading ? 'Создание...' : 'Создать'}
        </Button>
      </div>
    </Modal>
  )
} 