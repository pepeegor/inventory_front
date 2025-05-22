import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaTimes } from 'react-icons/fa'
import { updatePartType } from '../../api/partTypes'
import Modal from '../../components/common/Modal'

export default function EditPartTypeModal({ isOpen, onClose, partType, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    expected_failure_interval_days: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (partType) {
      setFormData({
        name: partType.name || '',
        description: partType.description || '',
        expected_failure_interval_days: partType.expected_failure_interval_days !== null 
          ? String(partType.expected_failure_interval_days) 
          : ''
      })
    }
  }, [partType])

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
    
    // Convert empty string to null for optional number field
    const dataToSubmit = {
      ...formData,
      expected_failure_interval_days: formData.expected_failure_interval_days === '' 
        ? null 
        : parseInt(formData.expected_failure_interval_days, 10)
    }
    
    try {
      await updatePartType(partType.id, dataToSubmit)
      toast.success('Part type updated successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating part type:', error)
      toast.error(error.response?.data?.detail || 'Failed to update part type')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-t-lg flex justify-between items-center border-b border-gray-700">
        <h3 className="text-xl font-medium text-white">Edit Part Type</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <FaTimes />
        </button>
      </div>
      
      <div className="bg-gray-800 p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="expected_failure_interval_days" className="block text-sm font-medium text-gray-300 mb-1">
              Expected Failure Interval (days)
            </label>
            <input
              type="number"
              id="expected_failure_interval_days"
              name="expected_failure_interval_days"
              value={formData.expected_failure_interval_days}
              onChange={handleChange}
              min="1"
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </form>
      </div>
      
      <div className="bg-gray-800 p-4 rounded-b-lg border-t border-gray-700 flex justify-end space-x-2">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition duration-200"
        >
          Cancel
        </button>
        <button 
          type="button" 
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md transition duration-200 disabled:opacity-50"
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  )
} 