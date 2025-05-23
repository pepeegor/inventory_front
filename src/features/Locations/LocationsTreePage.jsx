import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaBuilding, FaPlus, FaTable } from 'react-icons/fa'
import { getAllLocations } from '../../api/locations'
import LocationTreeView from '../../components/locations/LocationTreeView'
import AnimatedSection from '../../components/AnimatedSection'
import Button from '../../components/ui/Button'
import { Link } from 'react-router-dom'

export default function LocationsTreePage() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)

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

  return (
    <AnimatedSection className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaBuilding className="mr-2" /> Locations Tree
        </h2>
        
        <Link to="/locations/manage">
          <Button 
            className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            <FaTable /> Manage Locations
          </Button>
        </Link>
      </div>

      <div className="glassmorphism p-6 rounded-lg border border-gray-700 relative overflow-hidden">
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-5 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-white/20"></div>
          ))}
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="loader">
              <div className="loader-ring"></div>
            </div>
          </div>
        ) : (
          <div className="relative z-10">
            <LocationTreeView locations={locations} />
          </div>
        )}
      </div>
    </AnimatedSection>
  )
} 