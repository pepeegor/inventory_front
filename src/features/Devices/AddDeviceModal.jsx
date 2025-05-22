import { useState } from 'react'
import { toast } from 'react-toastify'
import { FaTimes } from 'react-icons/fa'
import { createDevice } from '../../api/devices'
import Modal from '../../components/common/Modal'
import { flattenLocationTree } from '../../utils/locationUtils'

export default function AddDeviceModal({ isOpen, onClose, onSuccess, deviceTypes, locations }) {
  const [formData, setFormData] = useState({
    serial_number: '',
    type_id: '',
    purchase_date: '',
    warranty_end: '',
    current_location_id: '',
    status: 'active' // Default status
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
    
    // Convert empty strings to null for optional fields
    const dataToSubmit = {
      ...formData,
      type_id: parseInt(formData.type_id, 10),
      current_location_id: formData.current_location_id ? parseInt(formData.current_location_id, 10) : null,
      purchase_date: formData.purchase_date || null,
      warranty_end: formData.warranty_end || null
    }
    
    try {
      await createDevice(dataToSubmit)
      toast.success('Device created successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error creating device:', error)
      toast.error(error.response?.data?.detail || 'Failed to create device')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-t-lg flex justify-between items-center border-b border-gray-700">
        <h3 className="text-xl font-medium text-white">Add New Device</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <FaTimes />
        </button>
      </div>
      
      <div className="bg-gray-800 p-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="serial_number" className="block text-sm font-medium text-gray-300 mb-1">Serial Number</label>
            <input
              type="text"
              id="serial_number"
              name="serial_number"
              value={formData.serial_number}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="type_id" className="block text-sm font-medium text-gray-300 mb-1">Device Type</label>
            <select
              id="type_id"
              name="type_id"
              value={formData.type_id}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a device type</option>
              {deviceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.manufacturer} {type.model} ({type.part_types?.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-300 mb-1">Purchase Date</label>
              <input
                type="date"
                id="purchase_date"
                name="purchase_date"
                value={formData.purchase_date}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="warranty_end" className="block text-sm font-medium text-gray-300 mb-1">Warranty End</label>
              <input
                type="date"
                id="warranty_end"
                name="warranty_end"
                value={formData.warranty_end}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="current_location_id" className="block text-sm font-medium text-gray-300 mb-1">Current Location</label>
            <select
              id="current_location_id"
              name="current_location_id"
              value={formData.current_location_id}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">No location</option>
              {flattenLocationTree(locations).map(location => (
                <option key={location.id} value={location.id}>
                  {location.displayName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="storage">Storage</option>
              <option value="repair">Repair</option>
              <option value="decommissioned">Decommissioned</option>
            </select>
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
          {isLoading ? 'Creating...' : 'Create Device'}
        </button>
      </div>
    </Modal>
  )
} 