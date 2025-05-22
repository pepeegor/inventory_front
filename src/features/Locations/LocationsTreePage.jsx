import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { FaBuilding } from 'react-icons/fa'
import { getAllLocations } from '../../api/locations'
import LocationTreeView from '../../components/locations/LocationTreeView'

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
    <div className="container mx-auto py-4 px-4 animate__animated animate__fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center">
          <FaBuilding className="mr-2" /> Locations Tree
        </h2>
      </div>

      <div className="bg-gray-800 rounded-lg shadow">
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="p-4">
            <LocationTreeView locations={locations} />
          </div>
        )}
      </div>
    </div>
  )
} 