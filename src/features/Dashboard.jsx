import React from 'react'
import { FiBox, FiCpu, FiMap, FiActivity, FiSettings } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const cards = [
  { icon: <FiBox />, label: 'Устройства', to: '/devices' },
  { icon: <FiCpu />, label: 'Типы устройств', to: '/device-types' },
  { icon: <FiMap />, label: 'Локации', to: '/locations' },
  { icon: <FiSettings />, label: 'Обслуживание', to: '/maintenance' },
  { icon: <FiActivity />, label: 'Аналитика', to: '/analytics' },
]

export default function Dashboard() {
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Главная панель</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(({ icon, label, to }) => (
          <Link
            to={to}
            key={label}
            className="bg-[#1c1c20] hover:bg-[#2a2a2e] transition-colors border border-[#333] rounded-xl p-6 flex items-center space-x-4 text-gray-200 shadow"
          >
            <span className="text-3xl text-[#8e6fff]">{icon}</span>
            <span className="text-lg font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
