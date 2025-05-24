import { Dialog } from '@headlessui/react'
import { FaTimes } from 'react-icons/fa'
import { motion as Motion } from 'framer-motion'

export default function DeviceDetailsModal({ isOpen, onClose, device, deviceTypes, locations }) {
  const deviceType = deviceTypes.find(t => t.id === device.type_id)
  const location = locations.find(l => l.id === device.current_location_id)

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="relative z-50"
    >
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#1f1f25] border border-violet-500/20 rounded-xl shadow-lg w-full max-w-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-900/30 via-violet-800/20 to-violet-900/30 flex justify-between items-center">
            <h3 className="text-lg font-medium text-white">
              Детали устройства
            </h3>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <FaTimes />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">ID</label>
                  <div className="text-white">{device.id}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Серийный номер</label>
                  <div className="text-white">{device.serial_number}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Название</label>
                  <div className="text-white">{device.name || '-'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Тип устройства</label>
                  <div className="text-white">
                    {deviceType ? (
                      <div className="flex flex-col">
                        <span>{deviceType.manufacturer} {deviceType.model}</span>
                        {deviceType.part_types?.name && (
                          <span className="text-sm text-violet-400">{deviceType.part_types.name}</span>
                        )}
                      </div>
                    ) : '-'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Текущая локация</label>
                  <div className="text-white">{location?.name || '-'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Статус</label>
                  <div className="text-white capitalize">{device.status || '-'}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Дата покупки</label>
                  <div className="text-white">
                    {device.purchase_date ? new Date(device.purchase_date).toLocaleDateString() : '-'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Гарантия до</label>
                  <div className="text-white">
                    {device.warranty_end ? new Date(device.warranty_end).toLocaleDateString() : '-'}
                  </div>
                </div>
              </div>
            </div>

            {device.notes && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-400">Заметки</label>
                <div className="text-white whitespace-pre-wrap p-4 bg-black/20 rounded-lg border border-violet-500/10">
                  {device.notes}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-violet-500/20 bg-black/20 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors border border-violet-500/20"
            >
              Закрыть
            </button>
          </div>
        </Motion.div>
      </div>
    </Dialog>
  )
} 