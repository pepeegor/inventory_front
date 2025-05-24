import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Dialog } from '@headlessui/react'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { FiX, FiPlus, FiTrash2, FiEdit3, FiAlertCircle, FiCheckCircle, FiXCircle } from 'react-icons/fi'
import { toast } from 'react-toastify'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { getInventoryEvent, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '../../api/inventoryEvents'
import { getAllDevices } from '../../api/devices'
import AddInventoryItemModal from './AddInventoryItemModal'
import EditInventoryItemModal from './EditInventoryItemModal'
import ConfirmModal from '../../components/common/ConfirmModal'

const DEVICE_CONDITIONS = {
  ok: { label: 'Исправно', color: 'emerald' },
  needs_maintenance: { label: 'Требует обслуживания', color: 'amber' },
  broken: { label: 'Неисправно', color: 'red' }
}

export default function InventoryDetailsModal({ isOpen, onClose, event }) {
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false)
  const [isEditItemModalOpen, setIsEditItemModalOpen] = useState(false)
  const [isDeleteItemModalOpen, setIsDeleteItemModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const queryClient = useQueryClient()

  // Fetch event details
  const { data: eventDetails, isLoading } = useQuery({
    queryKey: ['inventory-event', event.id],
    queryFn: () => getInventoryEvent(event.id)
  })

  // Fetch devices for dropdown
  const { data: devices = [] } = useQuery({
    queryKey: ['devices', { location_id: event.location.id }],
    queryFn: () => getAllDevices({ current_location_id: event.location.id }),
    staleTime: 5 * 60 * 1000,
    enabled: !!event.location.id
  })

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (itemId) => deleteInventoryItem(itemId),
    onSuccess: () => {
      toast.success('Запись успешно удалена')
      queryClient.invalidateQueries(['inventory-event', event.id])
      handleCloseDeleteItemModal()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении записи')
    }
  })

  const handleOpenAddItemModal = () => setIsAddItemModalOpen(true)
  const handleCloseAddItemModal = () => setIsAddItemModalOpen(false)

  const handleOpenEditItemModal = (item) => {
    setSelectedItem(item)
    setIsEditItemModalOpen(true)
  }
  
  const handleCloseEditItemModal = () => {
    setSelectedItem(null)
    setIsEditItemModalOpen(false)
  }

  const handleOpenDeleteItemModal = (item) => {
    setSelectedItem(item)
    setIsDeleteItemModalOpen(true)
  }
  
  const handleCloseDeleteItemModal = () => {
    setSelectedItem(null)
    setIsDeleteItemModalOpen(false)
  }

  const handleDeleteItem = () => {
    if (selectedItem) {
      deleteItemMutation.mutate(selectedItem.id)
    }
  }

  const getConditionBadgeClass = (condition) => {
    const conditionConfig = DEVICE_CONDITIONS[condition]
    if (!conditionConfig) return 'bg-gray-900/50 text-gray-300'
    return `bg-${conditionConfig.color}-900/50 text-${conditionConfig.color}-300`
  }

  if (isLoading) {
    return null
  }

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
          className="bg-[#1f1f25] border border-violet-500/20 rounded-xl shadow-lg w-full max-w-4xl overflow-hidden"
        >
          {/* Header */}
          <div className="p-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-900/30 via-violet-800/20 to-violet-900/30 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-white">
                Инвентаризация от {format(new Date(event.event_date), 'd MMMM yyyy', { locale: ru })}
              </h3>
              <p className="text-sm text-gray-400">
                Локация: {event.location?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
            >
              <FiX />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-900/20 border border-emerald-500/20">
                <FiCheckCircle className="text-emerald-400" />
                <span className="text-emerald-300 text-sm">
                  Найдено: {eventDetails.items.filter(item => item.found).length}
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-900/20 border border-red-500/20">
                <FiXCircle className="text-red-400" />
                <span className="text-red-300 text-sm">
                  Не найдено: {eventDetails.items.filter(item => !item.found).length}
                </span>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-amber-900/20 border border-amber-500/20">
                <FiAlertCircle className="text-amber-400" />
                <span className="text-amber-300 text-sm">
                  Проблем: {eventDetails.items.filter(item => item.condition === 'needs_maintenance' || item.condition === 'broken').length}
                </span>
              </div>
            </div>

            {/* Notes */}
            {eventDetails.notes && (
              <div className="mb-6 text-sm text-gray-400 italic bg-black/10 backdrop-blur-sm p-4 rounded-lg border border-violet-500/10">
                {eventDetails.notes}
              </div>
            )}

            {/* Items Table */}
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-white">Результаты проверки</h4>
                <button
                  onClick={handleOpenAddItemModal}
                  className="flex items-center gap-2 px-3 py-1.5 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors border border-violet-500/20"
                >
                  <FiPlus className="text-sm" /> Добавить устройство
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800/50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Устройство</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Статус</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Состояние</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Комментарий</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Действия</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800/50">
                    {eventDetails.items.map((item) => {
                      const device = devices.find(d => d.id === item.device_id)
                      return (
                        <tr key={item.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="text-white">{device?.serial_number}</span>
                              {device?.name && (
                                <span className="text-sm text-gray-400">{device.name}</span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.found ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300'}`}>
                              {item.found ? 'Найдено' : 'Не найдено'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getConditionBadgeClass(item.condition)}`}>
                              {DEVICE_CONDITIONS[item.condition]?.label || 'Неизвестно'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-gray-300 text-sm">{item.comments || '-'}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleOpenEditItemModal(item)}
                                className="p-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors"
                                title="Редактировать"
                              >
                                <FiEdit3 />
                              </button>
                              <button
                                onClick={() => handleOpenDeleteItemModal(item)}
                                className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
                                title="Удалить"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isAddItemModalOpen && (
          <AddInventoryItemModal
            isOpen={isAddItemModalOpen}
            onClose={handleCloseAddItemModal}
            eventId={event.id}
            event={event}
          />
        )}
        {isEditItemModalOpen && selectedItem && (
          <EditInventoryItemModal
            isOpen={isEditItemModalOpen}
            onClose={handleCloseEditItemModal}
            item={selectedItem}
            devices={devices}
          />
        )}
        {isDeleteItemModalOpen && selectedItem && (
          <ConfirmModal
            isOpen={isDeleteItemModalOpen}
            onClose={handleCloseDeleteItemModal}
            onConfirm={handleDeleteItem}
            title="Удаление записи"
            message="Вы уверены, что хотите удалить эту запись?"
            confirmText="Удалить"
            confirmStyle="danger"
          />
        )}
      </AnimatePresence>
    </Dialog>
  )
} 