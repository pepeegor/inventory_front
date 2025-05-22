import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaPlus, FaEdit, FaTrash, FaArrowUp, FaBuilding } from 'react-icons/fa'
import { usePermissions } from '../../hooks/usePermissions'
import { getAllLocations, deleteLocation } from '../../api/locations'
import AddLocationModal from './AddLocationModal'
import EditLocationModal from './EditLocationModal'
import ConfirmModal from '../../components/common/ConfirmModal'

export default function LocationsPage() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const { isAdmin } = usePermissions()

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const data = await getAllLocations()
      setLocations(data)
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => setIsAddModalOpen(true)
  const handleCloseAddModal = () => setIsAddModalOpen(false)

  const handleOpenEditModal = (location) => {
    setSelectedLocation(location)
    setIsEditModalOpen(true)
  }
  
  const handleCloseEditModal = () => {
    setSelectedLocation(null)
    setIsEditModalOpen(false)
  }

  const handleOpenDeleteModal = (location) => {
    setSelectedLocation(location)
    setIsDeleteModalOpen(true)
  }
  
  const handleCloseDeleteModal = () => {
    setSelectedLocation(null)
    setIsDeleteModalOpen(false)
  }

  const handleDelete = async () => {
    if (!selectedLocation) return

    try {
      await deleteLocation(selectedLocation.id)
      toast.success('Location deleted successfully')
      fetchLocations()
    } catch (error) {
      console.error('Error deleting location:', error)
      toast.error(error.response?.data?.detail || 'Failed to delete location')
    } finally {
      handleCloseDeleteModal()
    }
  }

  // Check if a location has devices or child locations
  const canDelete = (location) => {
    return (location.children?.length === 0 || !location.children) && 
           (location.devices?.length === 0 || !location.devices)
  }

  // Find parent location name
  const getParentName = (parentId) => {
    if (!parentId) return '-'
    const parent = locations.find(loc => loc.id === parentId)
    return parent ? parent.name : `ID: ${parentId}`
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-4 px-4">
        <div className="bg-gray-800 text-white rounded-lg shadow p-4 text-center">
          <h3 className="text-xl font-medium">Admin privileges required</h3>
          <p className="mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-4 px-4 animate__animated animate__fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaBuilding className="mr-2" /> Locations Management
        </h2>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md transition duration-200 transform hover:scale-105"
        >
          <FaPlus /> Add New Location
        </button>
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Parent Location</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Devices</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Child Locations</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-400">No locations found</td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{location.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{location.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {location.parent_id ? (
                          <div className="flex items-center">
                            <FaArrowUp className="mr-1 text-gray-500" />
                            {getParentName(location.parent_id)}
                          </div>
                        ) : (
                          'Root'
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {location.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {location.devices?.length > 0 ? location.devices.length : '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {location.children?.length > 0 ? location.children.length : '0'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(location)}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-gray-600"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleOpenDeleteModal(location)}
                            className={`text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-600 ${!canDelete(location) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Delete"
                            disabled={!canDelete(location)}
                          >
                            <FaTrash />
                          </button>
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

      {isAddModalOpen && (
        <AddLocationModal 
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSuccess={fetchLocations}
          locations={locations}
        />
      )}

      {isEditModalOpen && selectedLocation && (
        <EditLocationModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          location={selectedLocation}
          onSuccess={fetchLocations}
          locations={locations}
        />
      )}

      {isDeleteModalOpen && selectedLocation && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          title="Delete Location"
          message={`Are you sure you want to delete the location '${selectedLocation.name}'? This action cannot be undone.`}
          onConfirm={handleDelete}
          variant="danger"
        />
      )}
    </div>
  )
}
