import { useState } from 'react'
import { toast } from 'react-toastify'
import { FaTimes } from 'react-icons/fa'
import { createLocation } from '../../api/locations'
import Modal from '../../components/common/Modal'

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
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-t-lg flex justify-between items-center border-b border-gray-700">
        <h3 className="text-xl font-medium text-white">Add New Location</h3>
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
            <label htmlFor="parentId" className="block text-sm font-medium text-gray-300 mb-1">Parent Location</label>
            <select
              id="parentId"
              name="parent_id"
              value={formData.parent_id}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No Parent (Root Location)</option>
              {locations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
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
          {isLoading ? 'Creating...' : 'Create Location'}
        </button>
      </div>
    </Modal>
  )
} 