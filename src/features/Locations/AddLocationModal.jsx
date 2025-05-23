import { useState } from 'react'
import { toast } from 'react-toastify'
import { createLocation } from '../../api/locations'
import Modal from '../../components/common/Modal'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'

export default function AddLocationModal({ isOpen, onClose, onSuccess, locations }) {
  const [formData, setFormData] = useState({
    name: '',
    parent_id: '',
    description: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Convert empty string to null for optional parent_id
    const dataToSubmit = {
      ...formData,
      parent_id: formData.parent_id === '' ? null : parseInt(formData.parent_id, 10)
    }
    
    try {
      await createLocation(dataToSubmit)
      toast.success('Location created successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating location:', error)
      toast.error(error.response?.data?.detail || 'Failed to create location')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal
      title="Add New Location"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4 py-2">
        <Input
          label="Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="Enter location name"
        />
        
        <Select
          label="Parent Location"
          name="parent_id"
          value={formData.parent_id}
          onChange={handleChange}
          options={[
            { label: 'No Parent (Root Location)', value: '' },
            ...locations.map(location => ({
              label: location.name,
              value: location.id
            }))
          ]}
        />
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter location description (optional)"
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={isLoading}
          className="bg-gradient-to-r from-blue-600 to-indigo-600"
        >
          {isLoading ? 'Creating...' : 'Create Location'}
        </Button>
      </div>
    </Modal>
  )
} 