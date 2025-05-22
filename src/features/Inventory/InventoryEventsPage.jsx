import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from '../../api/axiosClient'
import Loader from '../../components/ui/Loader'
import { FiClipboard, FiCalendar } from 'react-icons/fi'

export default function InventoryEventsPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['inventoryEvents'],
    queryFn: () => axios.get('/inventory-events').then((res) => res.data),
  })

  if (isLoading) return <Loader />
  if (error) return <p className="text-red-500">Ошибка при загрузке инвентаризаций</p>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Инвентаризации</h2>
      <ul className="space-y-4">
        {data.map((event) => (
          <li key={event.id} className="bg-[#1f1f25] border border-[#333] rounded-lg p-4 text-gray-300">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FiClipboard className="text-[#8e6fff]" />
              Событие #{event.id}
            </div>
            <div className="text-sm text-gray-400 mt-1 flex items-center gap-2">
              <FiCalendar />
              {event.event_date} / {event.location?.name}
            </div>
            {event.notes && <p className="text-sm mt-1">{event.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
