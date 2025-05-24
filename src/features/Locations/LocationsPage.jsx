import { useState, useEffect } from 'react'
import { FaPlus, FaEdit, FaTrash, FaBuilding, FaSearch } from 'react-icons/fa'
import { getAllLocations, deleteLocation } from '../../api/locations'
import { toast } from 'react-toastify'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { usePermissions } from '../../hooks/usePermissions'
import { Navigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import AddLocationModal from './AddLocationModal'
import EditLocationModal from './EditLocationModal'
import { flattenLocationTree } from '../../utils/locationUtils'
import AnimatedSection from '../../components/AnimatedSection'
import Loader from '../../components/ui/Loader'

export default function LocationsPage() {
  const [locations, setLocations] = useState([])
  const [flattenedLocations, setFlattenedLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const { isAdmin } = usePermissions()

  const fetchLocations = async () => {
    setLoading(true)
    try {
      const data = await getAllLocations()
      setLocations(data)
      setFlattenedLocations(flattenLocationTree(data))
    } catch (error) {
      console.error('Error fetching locations:', error)
      toast.error('Failed to load locations')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLocations()
  }, [])

  // Redirect non-admin users
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту локацию?')) return
    
    try {
      await deleteLocation(id)
      toast.success('Локация успешно удалена')
      fetchLocations()
    } catch (error) {
      console.error('Error deleting location:', error)
      toast.error('Ошибка при удалении локации')
    }
  }

  const filteredLocations = flattenedLocations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AnimatedSection className="p-6">
      {/* Header Section */}
      <Motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaBuilding className="mr-2 text-violet-400" />
            Управление локациями
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по локациям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <FaPlus /> Добавить локацию
            </Button>
          </div>
        </div>
      </Motion.div>

      {/* Main Content */}
      <Motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glassmorphism rounded-xl border border-violet-500/20 relative overflow-hidden"
      >
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
        ) : filteredLocations.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            {searchTerm ? 'Локации не найдены' : 'Нет локаций'}
          </div>
        ) : (
          <div className="relative z-10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-violet-500/20">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Родительская локация
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/20">
                {filteredLocations.map((location) => (
                  <Motion.tr
                    key={location.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    className="transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {location.displayName}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {location.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {location.parent_id ? (
                        locations.find(l => l.id === location.parent_id)?.name || '-'
                      ) : (
                        <span className="text-violet-400">Корневая локация</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => {
                          setSelectedLocation(location)
                          setShowEditModal(true)
                        }}
                        className="mr-2 p-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </Motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Motion.div>

      {/* Modals */}
      <AnimatePresence>
        {showAddModal && (
          <AddLocationModal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            onSuccess={fetchLocations}
            parentLocations={flattenedLocations}
          />
        )}
        {showEditModal && selectedLocation && (
          <EditLocationModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false)
              setSelectedLocation(null)
            }}
            onSuccess={fetchLocations}
            location={selectedLocation}
            parentLocations={flattenedLocations}
          />
        )}
      </AnimatePresence>
    </AnimatedSection>
  )
} 