import { useState, useEffect, useCallback } from 'react'
import { toast } from 'react-toastify'
import { FaPlus, FaEdit, FaTrash, FaFilter, FaSync, FaInfoCircle, FaMapMarkerAlt } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { FiMap } from 'react-icons/fi'
import { usePermissions } from '../../hooks/usePermissions'
import { getAllDevices, deleteDevice } from '../../api/devices'
import { getAllDeviceTypes } from '../../api/deviceTypes'
import { getUserById } from '../../api/users'
import { useLocations } from '../../hooks/useLocations'
import AddDeviceModal from './AddDeviceModal'
import EditDeviceModal from './EditDeviceModal'
import DeviceDetailsModal from './DeviceDetailsModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import { flattenLocationTree } from '../../utils/locationUtils'

export default function DevicesPage() {
  const [devices, setDevices] = useState([])
  const [deviceTypes, setDeviceTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [filters, setFilters] = useState({
    type_id: '',
    status: '',
    current_location_id: ''
  })
  const [creators, setCreators] = useState({}) // Map of user_id -> user data
  const { isAdmin: _isAdmin } = usePermissions()
  const { locations } = useLocations()

  const fetchDevices = useCallback(async () => {
    setLoading(true)
    try {
      const filterParams = {}
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          filterParams[key] = filters[key]
        }
      })
      
      const data = await getAllDevices(filterParams)
      setDevices(data)

      // Get unique creator IDs to fetch user data
      const creatorIds = [...new Set(data.map(device => device.created_by).filter(Boolean))]
      
      // Only fetch creators that we don't already have
      const newCreatorIds = creatorIds.filter(id => !creators[id])
      
      if (newCreatorIds.length > 0) {
        // Fetch creator information
        const creatorPromises = newCreatorIds.map(async (id) => {
          try {
            const userData = await getUserById(id)
            return { id, userData }
          } catch (error) {
            console.error(`Error fetching user ${id}:`, error)
            return { id, userData: null }
          }
        })

        const creatorResults = await Promise.allSettled(creatorPromises)
        const newCreatorsData = {}
        
        creatorResults.forEach(result => {
          if (result.status === 'fulfilled' && result.value) {
            const { id, userData } = result.value
            if (userData) {
              newCreatorsData[id] = userData
            }
          }
        })

        // Only update if we have new data
        if (Object.keys(newCreatorsData).length > 0) {
          setCreators(prev => ({...prev, ...newCreatorsData}))
        }
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
      toast.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Separate function to fetch device types to avoid constant refetching
  const fetchDeviceTypes = useCallback(async () => {
    try {
      const data = await getAllDeviceTypes()
      setDeviceTypes(data)
    } catch (error) {
      console.error('Error fetching device types:', error)
      toast.error('Failed to load device types')
    }
  }, [])

  useEffect(() => {
    fetchDevices()
  }, [fetchDevices])

  // Fetch device types only once on initial load
  useEffect(() => {
    fetchDeviceTypes()
  }, [fetchDeviceTypes])

  const handleFilterChange = (key, value) => {
    // If it's a location filter, we need special handling
    if (key === 'current_location_id') {
      const locationValue = value === '' ? null : Number(value);
      setFilters(prev => ({ ...prev, [key]: locationValue }));
      
      // Apply the filter immediately if using a location
      if (locationValue !== null) {
        fetchDevices({
          ...filters,
          current_location_id: locationValue,
        });
      } else {
        fetchDevices({
          ...filters,
          current_location_id: null,
        });
      }
    } else {
      // For other filters, just update the state
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const applyFilters = () => {
    fetchDevices()
  }

  const resetFilters = () => {
    setFilters({
      type_id: '',
      status: '',
      current_location_id: ''
    })
    setTimeout(fetchDevices, 0)
  }

  const handleOpenAddModal = () => setIsAddModalOpen(true)
  const handleCloseAddModal = () => setIsAddModalOpen(false)

  const handleOpenEditModal = (device) => {
    setSelectedDevice(device)
    setIsEditModalOpen(true)
  }
  
  const handleCloseEditModal = () => {
    setSelectedDevice(null)
    setIsEditModalOpen(false)
  }

  const handleOpenDetailsModal = (device) => {
    setSelectedDevice(device)
    setIsDetailsModalOpen(true)
  }
  
  const handleCloseDetailsModal = () => {
    setSelectedDevice(null)
    setIsDetailsModalOpen(false)
  }

  const handleOpenDeleteModal = (device) => {
    setSelectedDevice(device)
    setIsDeleteModalOpen(true)
  }
  
  const handleCloseDeleteModal = () => {
    setSelectedDevice(null)
    setIsDeleteModalOpen(false)
  }

  const handleDelete = async () => {
    if (!selectedDevice) return

    try {
      await deleteDevice(selectedDevice.id)
      toast.success('Device deleted successfully')
      fetchDevices()
    } catch (error) {
      console.error('Error deleting device:', error)
      toast.error(error.response?.data?.detail || 'Failed to delete device')
    } finally {
      handleCloseDeleteModal()
    }
  }

  // Get status badge class based on status
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'storage':
        return 'bg-blue-100 text-blue-800';
      case 'repair':
        return 'bg-orange-100 text-orange-800';
      case 'decommissioned':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getWarrantyStatus = (warrantyEnd) => {
    if (!warrantyEnd) return null;
    
    const endDate = new Date(warrantyEnd);
    const now = new Date();
    
    if (endDate < now) {
      return <span className="text-red-500 text-sm">Expired</span>;
    }
    
    // Calculate months remaining
    const monthsRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24 * 30.5));
    
    if (monthsRemaining <= 1) {
      return <span className="text-orange-500 text-sm">Expiring soon</span>;
    }
    
    return <span className="text-green-500 text-sm">Valid</span>;
  };

  return (
    <div className="container mx-auto py-4 px-4 animate__animated animate__fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaMapMarkerAlt className="mr-2" /> Devices Management
        </h2>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md transition duration-200 transform hover:scale-105"
        >
          <FaPlus /> Add New Device
        </button>
      </div>

      {/* Filters panel */}
      <div className="bg-gray-800 rounded-lg shadow mb-6 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="typeFilter" className="block text-sm font-medium text-gray-300 mb-1">Device Type</label>
            <select
              id="typeFilter"
              name="type_id"
              value={filters.type_id}
              onChange={(e) => handleFilterChange('type_id', e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {deviceTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.manufacturer} {type.model} ({type.part_types?.name})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-300 mb-1">Status</label>
            <select
              id="statusFilter"
              name="status"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-gray-700 text-white border border-gray-600 rounded p-2.5 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="maintenance">Maintenance</option>
              <option value="storage">Storage</option>
              <option value="repair">Repair</option>
              <option value="decommissioned">Decommissioned</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="locationFilter" className="block text-sm font-medium text-gray-300 mb-1">Location</label>
            <select
              className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
              value={filters.current_location_id || ''}
              onChange={(e) => handleFilterChange('current_location_id', e.target.value)}
            >
              <option value="">All Locations</option>
              {flattenLocationTree(locations).map(location => (
                <option key={location.id} value={location.id}>
                  {location.displayName}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          <button 
            onClick={applyFilters}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <FaFilter /> Apply Filters
          </button>
          <button 
            onClick={resetFilters}
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md transition duration-200"
          >
            <FaSync /> Reset
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Serial Number</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Warranty</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {devices.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-400">No devices found</td>
                  </tr>
                ) : (
                  devices.map((device) => (
                    <tr key={device.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{device.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{device.serial_number}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {device.type ? (
                          <div className="flex flex-col">
                            <span>{device.type.manufacturer} {device.type.model}</span>
                            <span className="text-xs text-gray-400">{device.type.part_types?.name}</span>
                          </div>
                        ) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {device.current_location?.name || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${getStatusBadgeClass(device.status)} text-xs font-medium px-2.5 py-0.5 rounded`}>
                          {device.status?.charAt(0).toUpperCase() + device.status?.slice(1) || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {getWarrantyStatus(device.warranty_end)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenDetailsModal(device)}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-gray-600"
                            title="View Details"
                          >
                            <FaInfoCircle />
                          </button>
                          <button 
                            onClick={() => handleOpenEditModal(device)}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-gray-600"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleOpenDeleteModal(device)}
                            className="text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-600"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                          <Link 
                            to={`/devices/${device.id}/movements`}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-gray-600"
                            title="История перемещений"
                          >
                            <FiMap />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      {isAddModalOpen && (
        <AddDeviceModal 
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSuccess={fetchDevices}
          deviceTypes={deviceTypes}
          locations={locations}
        />
      )}

      {isEditModalOpen && selectedDevice && (
        <EditDeviceModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          device={selectedDevice}
          onSuccess={fetchDevices}
          deviceTypes={deviceTypes}
          locations={locations}
        />
      )}

      {isDetailsModalOpen && selectedDevice && (
        <DeviceDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          device={selectedDevice}
        />
      )}

      {isDeleteModalOpen && selectedDevice && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          title="Delete Device"
          message={`Are you sure you want to delete the device '${selectedDevice.serial_number}'? This action cannot be undone.`}
          onConfirm={handleDelete}
          variant="danger"
        />
      )}
    </div>
  )
}
