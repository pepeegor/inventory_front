import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { FiPlus, FiArrowLeft, FiArrowRight } from 'react-icons/fi'
import AnimatedSection from '../../components/AnimatedSection'
import Loader from '../../components/ui/Loader'
import Button from '../../components/ui/Button'
import { getDeviceById } from '../../api/devices'
import { getDeviceMovements } from '../../api/deviceMovements'
import { useAuth } from '../../hooks/useAuth'
import AddDeviceMovementModal from './AddDeviceMovementModal'

export default function DeviceMovementsPage() {
  const { deviceId } = useParams()
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()

  // Fetch device details
  const { 
    data: device, 
    isLoading: isLoadingDevice,
    isError: isDeviceError
  } = useQuery({
    queryKey: ['device', deviceId],
    queryFn: () => getDeviceById(parseInt(deviceId)),
    enabled: !!deviceId,
    onError: () => {
      toast.error('Устройство не найдено или у вас нет прав доступа')
      navigate('/devices')
    }
  })

  // Check if user has access to this device
  useEffect(() => {
    if (device && user && device.created_by !== user.id && user.role !== 'admin') {
      toast.error('У вас нет доступа к этому устройству')
      navigate('/devices')
    }
  }, [device, user, navigate])

  // Fetch device movements
  const { 
    data: movements = [], 
    isLoading: isLoadingMovements 
  } = useQuery({
    queryKey: ['deviceMovements', deviceId],
    queryFn: () => getDeviceMovements(parseInt(deviceId)),
    enabled: !!deviceId && !isDeviceError
  })

  const handleOpenAddModal = () => setIsAddModalOpen(true)
  const handleCloseAddModal = () => setIsAddModalOpen(false)

  const formatDateTime = (dateTimeStr) => {
    try {
      return format(new Date(dateTimeStr), 'dd.MM.yyyy HH:mm')
    } catch {
      return 'Некорректная дата'
    }
  }

  if (isLoadingDevice) {
    return <Loader />
  }

  return (
    <AnimatedSection className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link 
            to="/devices" 
            className="text-blue-400 hover:text-blue-300 mb-2 inline-flex items-center"
          >
            <FiArrowLeft className="mr-1" /> Вернуться к списку устройств
          </Link>
          <h2 className="text-2xl font-bold text-white">
            История перемещений устройства
          </h2>
          {device && (
            <div className="mt-1 text-gray-400">
              {device.type?.manufacturer} {device.type?.model} &nbsp;|&nbsp; SN: {device.serial_number}
            </div>
          )}
        </div>
        <Button
          onClick={handleOpenAddModal}
          className="flex items-center gap-1"
        >
          <FiPlus size={16} /> Добавить перемещение
        </Button>
      </div>

      {isLoadingMovements ? (
        <Loader />
      ) : (
        <div className="space-y-4">
          {movements.length === 0 ? (
            <div className="bg-[#1f2937] rounded-lg p-8 text-center text-gray-400">
              Для данного устройства не зарегистрировано перемещений
            </div>
          ) : (
            <div className="bg-[#1f2937] rounded-lg overflow-hidden shadow-lg">
              <ul className="divide-y divide-gray-700">
                {movements.map((movement) => (
                  <li key={movement.id} className="px-6 py-5 hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-grow">
                        <div className="min-w-[40%]">
                          <div className="flex items-center text-white">
                            <span className="text-gray-400 mr-2">Из:</span>
                            <span className="font-medium">{movement.from_location?.name || 'Неизвестно'}</span>
                          </div>
                          <div className="flex items-center text-white mt-2">
                            <span className="text-gray-400 mr-2">В:</span>
                            <span className="font-medium text-green-400">{movement.to_location?.name || 'Неизвестно'}</span>
                          </div>
                        </div>
                        <div className="min-w-[30%]">
                          <div className="text-sm text-gray-400">
                            <span>Дата:</span>
                            <span className="ml-2 text-white">{formatDateTime(movement.moved_at)}</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            <span>Выполнил:</span>
                            <span className="ml-2 text-white">{movement.performed_by_user?.full_name || 'Неизвестно'}</span>
                          </div>
                        </div>
                        <div className="flex-grow">
                          {movement.notes && (
                            <div className="text-sm">
                              <span className="text-gray-400">Примечание:</span>
                              <p className="text-white mt-1">{movement.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-2xl text-blue-400 ml-4">
                        <FiArrowRight />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {isAddModalOpen && (
        <AddDeviceMovementModal
          isOpen={isAddModalOpen}
          onClose={handleCloseAddModal}
          deviceId={parseInt(deviceId)}
          currentLocationId={device?.current_location?.id}
        />
      )}
    </AnimatedSection>
  )
} 