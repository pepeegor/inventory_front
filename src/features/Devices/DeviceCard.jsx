import React from 'react'
import { FiCpu, FiMapPin, FiHash, FiShield } from 'react-icons/fi'

export default function DeviceCard({ device }) {
  return (
    <div className="bg-[#1f1f25] border border-[#333] rounded-lg p-4 text-gray-200 shadow hover:border-[#555] transition">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FiHash className="text-[#8e6fff]" />
          {device.serial_number}
        </h3>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded bg-opacity-20 ${
            device.status === 'active'
              ? 'bg-green-500 text-green-400'
              : 'bg-red-500 text-red-400'
          }`}
        >
          {device.status}
        </span>
      </div>
      <div className="text-sm text-gray-400 space-y-1">
        <div className="flex items-center gap-2">
          <FiCpu className="text-[#8e6fff]" />
          <span>{device.type?.manufacturer} {device.type?.model}</span>
        </div>
        <div className="flex items-center gap-2">
          <FiMapPin className="text-[#8e6fff]" />
          <span>{device.current_location?.name || '—'}</span>
        </div>
        {device.warranty_end && (
          <div className="flex items-center gap-2">
            <FiShield className="text-[#8e6fff]" />
            <span>Гарантия до {device.warranty_end}</span>
          </div>
        )}
      </div>
    </div>
  )
}
