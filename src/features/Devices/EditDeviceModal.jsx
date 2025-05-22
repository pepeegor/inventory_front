import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaTimes } from 'react-icons/fa'
import { updateDevice } from '../../api/devices'
import Modal from '../../components/common/Modal'

export default function EditDeviceModal({ isOpen, onClose, device, onSuccess }) {
  const [formData, setFormData] = useState({
    serial_number: '',
    device_type_id: '',
    status: 'active',
    notes: ''
  })
  const [loading, setLoading] = useState(false)
  const [deviceTypes, setDeviceTypes] = useState([])
  const [locations, setLocations] = useState([])

  useEffect(() => {
    if (device) {
      setFormData({
        serial_number: device.serial_number || '',
        device_type_id: device.type?.id ? String(device.type.id) : '',
        status: device.status || 'active',
        notes: device.notes || ''
      })
    }
  }, [device])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await updateDevice(device.id, formData)
      toast.success('Device updated successfully')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating device:', error)
      toast.error(error.response?.data?.detail || 'Failed to update device')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Device">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Serial Number
          </label>
          <input
            type="text"
            name="serial_number"
            value={formData.serial_number}
            onChange={handleChange}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Device Type
          </label>
          <select
            name="device_type_id"
            value={formData.device_type_id}
            onChange={handleChange}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
            required
          >
            <option value="">Select Device Type</option>
            {deviceTypes.map(type => (
              <option key={type.id} value={type.id}>
                {type.manufacturer} {type.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
            required
          >
            <option value="active">Active</option>
            <option value="storage">Storage</option>
            <option value="maintenance">Maintenance</option>
            <option value="decommissioned">Decommissioned</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
            rows="3"
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  )
} 