import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaBuilding, FaPlus, FaTable, FaSearch } from 'react-icons/fa'
import { getAllLocations } from '../../api/locations'
import LocationTreeView from './LocationTreeView'
import AnimatedSection from '../../components/AnimatedSection'
import Button from '../../components/ui/Button'
import { Link } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { usePermissions } from '../../hooks/usePermissions'
import Loader from '../../components/ui/Loader'
import { getTotalLocationsCount } from '../../utils/locationUtils'

function LocationsTreePage() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const { isAdmin } = usePermissions()

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

  useEffect(() => {
    fetchLocations()
  }, [])

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
            Дерево локаций
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по локациям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            {isAdmin && (
              <Link to="/locations/manage">
                <Button 
                  className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
                >
                  <FaTable /> Управление локациями
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-indigo-800/20 backdrop-blur-sm border border-violet-700/30">
            <div className="text-sm text-violet-300 mb-1">Всего локаций</div>
            <div className="text-2xl font-bold text-white">{getTotalLocationsCount(locations)}</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-indigo-800/20 backdrop-blur-sm border border-violet-700/30">
            <div className="text-sm text-violet-300 mb-1">Корневые локации</div>
            <div className="text-2xl font-bold text-white">
              {locations.filter(l => !l.parent_id).length}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-indigo-800/20 backdrop-blur-sm border border-violet-700/30">
            <div className="text-sm text-violet-300 mb-1">Дочерние локации</div>
            <div className="text-2xl font-bold text-white">
              {getTotalLocationsCount(locations) - locations.filter(l => !l.parent_id).length}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-indigo-800/20 backdrop-blur-sm border border-violet-700/30">
            <div className="text-sm text-violet-300 mb-1">Глубина дерева</div>
            <div className="text-2xl font-bold text-white">
              {Math.max(...locations.map(loc => {
                const getDepth = (node, depth = 0) => {
                  if (!node.children?.length) return depth;
                  return Math.max(...node.children.map(child => getDepth(child, depth + 1)));
                };
                return getDepth(loc);
              }), 0) + 1}
            </div>
          </div>
        </Motion.div>
      </Motion.div>

      <Motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="glassmorphism rounded-xl border border-gray-700 relative overflow-hidden p-6"
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
        ) : (
          <div className="relative z-10">
            <LocationTreeView locations={locations} searchTerm={searchTerm} />
          </div>
        )}
      </Motion.div>
    </AnimatedSection>
  )
}

export default LocationsTreePage; 