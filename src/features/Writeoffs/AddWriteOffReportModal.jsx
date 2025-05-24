import { useState, useEffect } from 'react'
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { createWriteOffReport } from '../../api/writeoffs'
import { getAllDevices } from '../../api/devices'
import { FaPlus } from 'react-icons/fa'

export default function AddWriteOffReportModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    device_id: '',
    report_date: new Date().toISOString().split('T')[0],
    reason: '',
  })
  
  const queryClient = useQueryClient()
  
  // Get devices for dropdown (only active and maintenance)
  const { data: devices = [], isLoading } = useQuery({
    queryKey: ['devices'],
    queryFn: () => getAllDevices().then(data => 
      data.filter(device => device.status !== 'decommissioned')
    ),
    enabled: isOpen
  })
  
  useEffect(() => {
    if (isOpen) {
      setFormData({
        device_id: '',
        report_date: new Date().toISOString().split('T')[0],
        reason: ''
      })
    }
  }, [isOpen])
  
  const mutation = useMutation({
    mutationFn: createWriteOffReport,
    onSuccess: () => {
      queryClient.invalidateQueries(['writeOffReports'])
      toast.success('Отчет о списании создан')
      onClose()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Не удалось создать отчет о списании')
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
    if (!formData.reason.trim()) {
      return toast.error('Укажите причину списания')
    }
    
    mutation.mutate(formData)
  }
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <FaPlus className="text-violet-400" />
          <span>Создать отчет о списании</span>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Select
          label="Устройство"
          name="device_id"
          value={formData.device_id}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        >
          <option value="">Выберите устройство</option>
          {!isLoading && devices.map(device => (
            <option key={device.id} value={device.id}>
              {device.serial_number} ({device.type?.manufacturer} {device.type?.model}) - {
                device.status === 'maintenance' ? 'На обслуживании' : 'Активно'
              }
            </option>
          ))}
        </Select>
        
        <Input
          label="Дата списания"
          name="report_date"
          type="date"
          value={formData.report_date}
          onChange={handleChange}
          required
          className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        />
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Причина списания
          </label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            required
            rows="3"
            className="w-full px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            placeholder="Укажите причину списания устройства..."
          />
        </div>
        
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            isLoading={mutation.isLoading}
            className="px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <FaPlus className="text-sm" />
            Создать
          </Button>
        </div>
      </form>
    </Modal>
  )
} 