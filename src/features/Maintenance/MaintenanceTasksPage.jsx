import React from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from '../../api/axiosClient'
import Loader from '../../components/ui/Loader'
import { FiTool, FiCalendar, FiUser } from 'react-icons/fi'

export default function MaintenanceTasksPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['maintenanceTasks'],
    queryFn: () => axios.get('/maintenance-tasks').then((res) => res.data),
  })

  if (isLoading) return <Loader />
  if (error) return <p className="text-red-500">Ошибка при загрузке задач</p>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Регламентные работы</h2>
      <ul className="space-y-4">
        {data.map((task) => (
          <li key={task.id} className="bg-[#1f1f25] border border-[#333] rounded-lg p-4 text-gray-300">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FiTool className="text-[#8e6fff]" />
              {task.task_type} для {task.device?.serial_number}
            </div>
            <div className="text-sm text-gray-400 mt-1 flex flex-col gap-1">
              <span className="flex items-center gap-2">
                <FiCalendar /> {task.scheduled_date}
              </span>
              {task.assigned_to && (
                <span className="flex items-center gap-2">
                  <FiUser /> Назначен: {task.assigned_to.email}
                </span>
              )}
            </div>
            {task.notes && <p className="text-sm mt-1">{task.notes}</p>}
          </li>
        ))}
      </ul>
    </div>
  )
}
