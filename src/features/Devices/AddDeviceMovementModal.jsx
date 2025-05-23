import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { addDeviceMovement } from '../../api/deviceMovements'
import { getAllLocations } from '../../api/locations'
import { getDeviceById } from '../../api/devices'
import { flattenLocationTree } from '../../utils/locationUtils'
import Modal from '../../components/common/Modal'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'

export default function AddDeviceMovementModal({ isOpen, onClose, deviceId, currentLocationId }) {
  const [flattenedLocations, setFlattenedLocations] = useState([])
  const [selectedToLocation, setSelectedToLocation] = useState('')
  const [loading, setLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [device, setDevice] = useState(null)
  const [fromLocationId, setFromLocationId] = useState(null)
  const [notes, setNotes] = useState('')

  const queryClient = useQueryClient()
  
  // Load data when modal opens
  useEffect(() => {
    if (!isOpen) return;
    
    const loadData = async () => {
      setIsLoadingData(true);
      
      try {
        // Load both device and locations data
        const [deviceData, locationsData] = await Promise.all([
          getDeviceById(parseInt(deviceId)),
          getAllLocations()
        ]);
        
        // Set device data
        setDevice(deviceData);
        
        // Set the current from location ID, using the device data as the source of truth
        if (deviceData?.current_location?.id) {
          setFromLocationId(deviceData.current_location.id);
        } else if (currentLocationId) {
          setFromLocationId(currentLocationId);
        }
        
        // Process and set locations
        const flattened = flattenLocationTree(locationsData);
        setFlattenedLocations(flattened);
        
        // Log the device and location data for debugging
        console.log("Device data:", deviceData);
        console.log("From location ID:", deviceData?.current_location_id || currentLocationId);
        console.log("Available locations:", flattened);
        
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Ошибка при загрузке данных');
      } finally {
        setIsLoadingData(false);
      }
    };
    
    loadData();
  }, [isOpen, deviceId, currentLocationId]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!fromLocationId) {
      toast.error('Текущая локация устройства не определена')
      setLoading(false)
      return
    }

    if (!selectedToLocation) {
      toast.error('Выберите новую локацию')
      setLoading(false)
      return
    }

    try {
      // Parse IDs to ensure they are numbers
      const parsedDeviceId = Number(deviceId)
      const parsedFromId = Number(fromLocationId)
      const parsedToId = Number(selectedToLocation)

      // Check if locations are the same
      if (parsedFromId === parsedToId) {
        toast.error('Новая локация совпадает с текущей')
        setLoading(false)
        return
      }

      // Format the current date in ISO 8601 format with timezone
      const now = new Date();
      const formattedDate = now.toISOString();

      // Prepare the movement payload
      const movementPayload = {
        from_location_id: parsedFromId,
        to_location_id: parsedToId,
        moved_at: formattedDate,
        notes: notes || ""
      };

      // Log what we're about to send
      console.log("Sending movement data:", {
        deviceId: parsedDeviceId,
        payload: movementPayload
      });
      
      const response = await addDeviceMovement(parsedDeviceId, movementPayload);
      console.log("Movement response:", response);
      
      toast.success('Перемещение устройства успешно зарегистрировано');
      
      // Invalidate both query keys to refresh the data
      const deviceIdString = parsedDeviceId.toString();
      queryClient.invalidateQueries(['deviceMovements', deviceIdString]);
      queryClient.invalidateQueries(['device', deviceIdString]);
      
      onClose();
    } catch (error) {
      console.error('Error adding device movement:', error);
      
      // More detailed error reporting
      if (error.response) {
        console.error('Error response:', error.response.data);
        toast.error(error.response.data?.detail || 'Ошибка при регистрации перемещения');
      } else {
        toast.error('Ошибка соединения при регистрации перемещения');
      }
    } finally {
      setLoading(false)
    }
  }
  
  if (isLoadingData) {
    return (
      <Modal
        title="Добавление перемещения"
        isOpen={isOpen}
        onClose={onClose}
      >
        <div className="py-8 flex justify-center">
          <Loader />
        </div>
      </Modal>
    )
  }
  
  // Find current location's display name
  const currentLocation = fromLocationId ? 
    flattenedLocations.find(loc => loc.id === Number(fromLocationId)) : null
  
  return (
    <Modal
      title="Регистрация перемещения устройства"
      isOpen={isOpen}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Текущая локация
          </label>
          <select
            value={fromLocationId || ''}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
            disabled
          >
            {fromLocationId ? (
              <option value={fromLocationId}>
                {currentLocation?.displayName || device?.current_location?.name || `Локация ID: ${fromLocationId}`}
              </option>
            ) : (
              <option value="">Нет локации</option>
            )}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Переместить в
          </label>
          <select
            value={selectedToLocation}
            onChange={(e) => setSelectedToLocation(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
            required
          >
            <option value="">Выберите локацию</option>
            {flattenedLocations.length > 0 ? (
              flattenedLocations.map(location => (
                <option key={location.id} value={location.id}>
                  {location.displayName}
                </option>
              ))
            ) : (
              <option value="" disabled>Нет доступных локаций</option>
            )}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Примечания
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="bg-gray-700 text-white border border-gray-600 rounded px-3 py-2 w-full"
            rows={3}
            placeholder="Необязательные комментарии к перемещению"
          />
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={onClose}>
            Отмена
          </Button>
          <Button 
            type="submit"
            disabled={loading || flattenedLocations.length === 0}
            className="bg-gradient-to-r from-blue-600 to-indigo-600"
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </div>
      </form>
    </Modal>
  )
} 