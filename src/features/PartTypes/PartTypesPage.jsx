import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaPlus, FaEdit, FaTrash, FaCog } from 'react-icons/fa'
import { usePermissions } from '../../hooks/usePermissions'
import { getAllPartTypes, deletePartType } from '../../api/partTypes'
import AddPartTypeModal from './AddPartTypeModal'
import EditPartTypeModal from './EditPartTypeModal'
import ConfirmModal from '../../components/common/ConfirmModal'

export default function PartTypesPage() {
  const [partTypes, setPartTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedPartType, setSelectedPartType] = useState(null)
  const { isAdmin } = usePermissions()

  useEffect(() => {
    fetchPartTypes()
  }, [])

  const fetchPartTypes = async () => {
    setLoading(true)
    try {
      const data = await getAllPartTypes()
      setPartTypes(data)
    } catch (error) {
      console.error('Error fetching part types:', error)
      toast.error('Failed to load part types')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAddModal = () => setIsAddModalOpen(true)
  const handleCloseAddModal = () => setIsAddModalOpen(false)

  const handleOpenEditModal = (partType) => {
    setSelectedPartType(partType)
    setIsEditModalOpen(true)
  }
  
  const handleCloseEditModal = () => {
    setSelectedPartType(null)
    setIsEditModalOpen(false)
  }

  const handleOpenDeleteModal = (partType) => {
    setSelectedPartType(partType)
    setIsDeleteModalOpen(true)
  }
  
  const handleCloseDeleteModal = () => {
    setSelectedPartType(null)
    setIsDeleteModalOpen(false)
  }

  const handleDelete = async () => {
    if (!selectedPartType) return

    try {
      await deletePartType(selectedPartType.id)
      toast.success('Part type deleted successfully')
      fetchPartTypes()
    } catch (error) {
      console.error('Error deleting part type:', error)
      toast.error(error.response?.data?.detail || 'Failed to delete part type')
    } finally {
      handleCloseDeleteModal()
    }
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
          <FaCog className="mr-2" /> Part Types Management
        </h2>
        <button 
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-md transition duration-200 transform hover:scale-105"
        >
          <FaPlus /> Add New Part Type
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
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Expected Failure Interval</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Device Types</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {partTypes.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400">No part types found</td>
                  </tr>
                ) : (
                  partTypes.map((partType) => (
                    <tr key={partType.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{partType.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{partType.name}</td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {partType.description || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {partType.expected_failure_interval_days || 'Not set'} {partType.expected_failure_interval_days ? 'days' : ''}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {partType.device_types?.length ? (
                          <div className="flex flex-wrap gap-1">
                            {partType.device_types.map(dt => (
                              <span 
                                key={dt.id} 
                                className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                              >
                                {dt.manufacturer} {dt.model}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-500">None</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleOpenEditModal(partType)}
                            className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-gray-600"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            onClick={() => handleOpenDeleteModal(partType)}
                            className={`text-red-400 hover:text-red-300 p-1 rounded hover:bg-gray-600 ${partType.device_types?.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Delete"
                            disabled={partType.device_types?.length > 0}
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
        <AddPartTypeModal 
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          onSuccess={fetchPartTypes}
        />
      )}

      {isEditModalOpen && selectedPartType && (
        <EditPartTypeModal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          partType={selectedPartType}
          onSuccess={fetchPartTypes}
        />
      )}

      {isDeleteModalOpen && selectedPartType && (
        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={handleCloseDeleteModal}
          title="Delete Part Type"
          message={`Are you sure you want to delete the part type '${selectedPartType.name}'? This action cannot be undone.`}
          onConfirm={handleDelete}
          variant="danger"
        />
      )}
    </div>
  )
} 