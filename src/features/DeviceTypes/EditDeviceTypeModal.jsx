import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { updateDeviceType } from '../../api/deviceTypes'
import Modal from '../../components/common/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { useAuth } from '../../hooks/useAuth'

export default function EditDeviceTypeModal({ isOpen, onClose, deviceType, partTypes }) {
  const [formData, setFormData] = useState({
    manufacturer: '',
    model: '',
    expected_lifetime_months: '',
    part_type_id: ''
  })
  
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  // Initialize form data from device type
  useEffect(() => {
    if (deviceType) {
      setFormData({
        manufacturer: deviceType.manufacturer || '',
        model: deviceType.model || '',
        expected_lifetime_months: deviceType.expected_lifetime_months 
          ? String(deviceType.expected_lifetime_months) 
          : '',
        part_type_id: deviceType.part_type_id 
          ? String(deviceType.part_type_id) 
          : ''
      })
    }
  }, [deviceType])
  
  // Check if user can edit this device type
  const canEdit = deviceType?.created_by === user?.id
  
  const updateMutation = useMutation({
    mutationFn: (data) => updateDeviceType(deviceType.id, data),
    onSuccess: () => {
      toast.success('Тип устройства успешно обновлен')
      queryClient.invalidateQueries(['deviceTypes'])
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при обновлении типа устройства')
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
    
    updateMutation.mutate(dataToSubmit)
  }
  
  // Show permission denied if user can't edit
  if (!canEdit) {
    return (
      <Modal
        title="Доступ запрещен"
        isOpen={isOpen}
        onClose={onClose}
      >
        <div className="py-4 text-center text-yellow-400">
          Вы можете редактировать только созданные вами типы устройств.
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Закрыть</Button>
        </div>
      </Modal>
    )
  }
  
  return (
    <Modal
      title="Редактирование типа устройства"
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
          disabled={updateMutation.isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          {updateMutation.isLoading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </Modal>
  )
} 