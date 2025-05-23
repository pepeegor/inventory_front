import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaPlus, FaEdit, FaTrash, FaArrowUp, FaBuilding, FaSync, FaSitemap } from 'react-icons/fa'
import { usePermissions } from '../../hooks/usePermissions'
import { getAllLocations, deleteLocation } from '../../api/locations'
import AddLocationModal from './AddLocationModal'
import EditLocationModal from './EditLocationModal'
import ConfirmModal from '../../components/common/ConfirmModal'
import AnimatedSection from '../../components/AnimatedSection'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import { Link } from 'react-router-dom'

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

  return (
    <AnimatedSection className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaBuilding className="mr-2" /> Locations Management
        </h2>
        
        <div className="flex space-x-2">
          <Button 
            onClick={fetchLocations}
            variant="secondary"
            className="flex items-center gap-1"
          >
            <FaSync /> Refresh
          </Button>
          
          <Link to="/locations">
            <Button 
              variant="secondary"
              className="flex items-center gap-1"
            >
              <FaSitemap /> Tree View
            </Button>
          </Link>
          
          {isAdmin && (
            <Button 
              onClick={handleOpenAddModal}
              className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600"
            >
              <FaPlus /> Add New Location
            </Button>
          )}
        </div>
      </div>

      <div className="glassmorphism rounded-lg border border-gray-700 relative overflow-hidden">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-5 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-white/20"></div>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <Loader />
          </div>
        ) : (
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left">
              <thead className="backdrop-blur-sm bg-gray-800/50 sticky top-0 border-b border-gray-700">
                <tr>
                  <th className="p-4 text-xs font-medium uppercase text-gray-300">ID</th>
                  <th className="p-4 text-xs font-medium uppercase text-gray-300">Name</th>
                  <th className="p-4 text-xs font-medium uppercase text-gray-300">Parent Location</th>
                  <th className="p-4 text-xs font-medium uppercase text-gray-300">Description</th>
                  <th className="p-4 text-xs font-medium uppercase text-gray-300">Devices</th>
                  <th className="p-4 text-xs font-medium uppercase text-gray-300">Child Locations</th>
                  {isAdmin && (
                    <th className="p-4 text-xs font-medium uppercase text-gray-300">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/30">
                {locations.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? "7" : "6"} className="p-4 text-center text-gray-400">No locations found</td>
                  </tr>
                ) : (
                  locations.map((location) => (
                    <tr key={location.id} className="hover:bg-gray-700/50 transition-colors">
                      <td className="p-4 text-sm text-gray-300">{location.id}</td>
                      <td className="p-4 text-sm text-white font-medium">{location.name}</td>
                      <td className="p-4 text-sm text-gray-300">
                        {location.parent_id ? (
                          <div className="flex items-center">
                            <FaArrowUp className="mr-1 text-blue-400" />
                            {getParentName(location.parent_id)}
                          </div>
                        ) : (
                          <span className="text-green-400">Root</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        {location.description || '-'}
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        <span className="px-2 py-1 bg-blue-900/50 text-blue-300 rounded-full text-xs">
                          {location.devices?.length > 0 ? location.devices.length : '0'} devices
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-300">
                        <span className="px-2 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-xs">
                          {location.children?.length > 0 ? location.children.length : '0'} locations
                        </span>
                      </td>
                      {isAdmin && (
                        <td className="p-4 text-sm text-gray-300">
                          <div className="flex gap-2">
                            <Button 
                              variant="icon" 
                              onClick={() => handleOpenEditModal(location)}
                              title="Edit"
                            >
                              <FaEdit className="text-blue-400" />
                            </Button>
                            <Button 
                              variant="icon" 
                              onClick={() => handleOpenDeleteModal(location)}
                              title="Delete"
                              disabled={!canDelete(location)}
                              className={!canDelete(location) ? 'opacity-50 cursor-not-allowed' : ''}
                            >
                              <FaTrash className="text-red-400" />
                            </Button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isAdmin && isAddModalOpen && (
        <AddLocationModal 
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSuccess={fetchLocations}
          locations={locations}
        />
      )}

      {isAdmin && isEditModalOpen && selectedLocation && (
        <EditLocationModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          location={selectedLocation}
          onSuccess={fetchLocations}
          locations={locations}
        />
      )}

      {isAdmin && isDeleteModalOpen && selectedLocation && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          title="Delete Location"
          message={`Are you sure you want to delete the location '${selectedLocation.name}'? This action cannot be undone.`}
          onConfirm={handleDelete}
          variant="danger"
        />
      )}
    </AnimatedSection>
  )
} 