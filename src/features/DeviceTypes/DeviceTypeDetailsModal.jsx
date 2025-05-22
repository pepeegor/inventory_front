import Modal from '../../components/common/Modal'
import Button from '../../components/ui/Button'

export default function DeviceTypeDetailsModal({ isOpen, onClose, deviceType }) {
  return (
    <Modal
      title="Информация о типе устройства"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-medium text-white">
              {deviceType.manufacturer} {deviceType.model}
            </h3>
            <p className="text-sm text-gray-400">ID: {deviceType.id}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Тип детали:</p>
              <p className="text-white">
                {deviceType.part_types?.name || 'Не указано'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Ожидаемый срок службы:</p>
              <p className="text-white">
                {deviceType.expected_lifetime_months 
                  ? `${deviceType.expected_lifetime_months} месяцев` 
                  : 'Не указано'}
              </p>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm">Создатель:</p>
              <p className="text-white">ID: {deviceType.created_by}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end mt-4">
        <Button onClick={onClose}>Закрыть</Button>
      </div>
    </Modal>
  )
} 