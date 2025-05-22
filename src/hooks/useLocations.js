import { useState, useEffect } from 'react'
import { getAllLocations } from '../api/locations'
import { toast } from 'react-toastify'

export function useLocations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true)
        const data = await getAllLocations()
        setLocations(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching locations:', err)
        setError(err)
        toast.error('Could not load locations')
      } finally {
        setLoading(false)
      }
    }

    fetchLocations()
  }, [])

  return { locations, loading, error }
} 