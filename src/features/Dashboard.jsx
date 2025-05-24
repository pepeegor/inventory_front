import React from 'react'
import { FiBox, FiCpu, FiMap, FiActivity, FiSettings, FiUser, FiClipboard, FiRefreshCw, FiFileText } from 'react-icons/fi'
import { Link } from 'react-router-dom'

const cards = [
  { icon: <FiBox />, label: 'Устройства', to: '/devices' },
  { icon: <FiCpu />, label: 'Типы устройств', to: '/device-types' },
  { icon: <FiMap />, label: 'Локации', to: '/locations' },
  { icon: <FiClipboard />, label: 'Инвентаризация', to: '/inventory' },
  { icon: <FiSettings />, label: 'Обслуживание', to: '/maintenance-tasks' },
  { icon: <FiFileText />, label: 'Списания', to: '/write-off-reports' },
  { icon: <FiRefreshCw />, label: 'Предложения по замене', to: '/replacement-suggestions' },
  { icon: <FiUser />, label: 'Профиль', to: '/profile' },
]

export default function Dashboard() {
  return (
    <div className="p-6 min-h-[80vh] relative overflow-hidden">
      {/* SVG-фигуры для декора */}
      {/* Правая верхняя */}
      <div className="absolute right-[-120px] top-[-120px] z-0 select-none pointer-events-none">
        <div className="w-[320px] h-[320px] animate-spin-slow">
          <svg viewBox="0 0 320 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="polyGrad1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <filter id="glow1" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="16" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <polygon points="160,30 290,110 250,260 70,260 30,110" fill="url(#polyGrad1)" filter="url(#glow1)" opacity="0.6">
              <animateTransform attributeName="transform" type="rotate" from="0 160 160" to="360 160 160" dur="14s" repeatCount="indefinite" />
            </polygon>
            <polygon points="160,60 260,120 230,230 90,230 60,120" fill="none" stroke="#fff" strokeWidth="3" opacity="0.13">
              <animateTransform attributeName="transform" type="rotate" from="0 160 160" to="-360 160 160" dur="20s" repeatCount="indefinite" />
            </polygon>
          </svg>
        </div>
      </div>
      {/* Левая нижняя */}
      <div className="absolute left-[-90px] bottom-[-90px] z-0 select-none pointer-events-none">
        <div className="w-[220px] h-[220px] animate-spin-slower">
          <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="polyGrad2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="100%" stopColor="#60a5fa" />
              </linearGradient>
              <filter id="glow2" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="12" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <polygon points="110,20 200,70 180,200 40,200 20,70" fill="url(#polyGrad2)" filter="url(#glow2)" opacity="0.4">
              <animateTransform attributeName="transform" type="rotate" from="0 110 110" to="-360 110 110" dur="22s" repeatCount="indefinite" />
            </polygon>
          </svg>
        </div>
      </div>
      {/* Центр слева */}
      <div className="absolute left-[-60px] top-1/3 z-0 select-none pointer-events-none">
        <div className="w-[120px] h-[120px] animate-spin-slowest">
          <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <defs>
              <linearGradient id="polyGrad3" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <filter id="glow3" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <polygon points="60,10 110,40 100,110 20,110 10,40" fill="url(#polyGrad3)" filter="url(#glow3)" opacity="0.35">
              <animateTransform attributeName="transform" type="rotate" from="0 60 60" to="360 60 60" dur="30s" repeatCount="indefinite" />
            </polygon>
          </svg>
        </div>
      </div>
      <h2 className="text-2xl font-bold text-white mb-8 relative z-10">Главная панель</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 relative z-10">
        {cards.map(({ icon, label, to }) => (
          <Link
            to={to}
            key={label}
            className="group bg-gradient-to-br from-[#23233a] to-[#181825] hover:from-violet-800/30 hover:to-indigo-900/30 transition-colors border border-[#333] rounded-2xl p-8 flex flex-col items-center space-y-4 text-gray-200 shadow-xl hover:shadow-2xl focus:outline-none"
          >
            <span className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-700/40 to-indigo-700/30 mb-2 shadow group-hover:scale-105 transition-transform text-4xl text-violet-300">{icon}</span>
            <span className="text-lg font-semibold text-center">{label}</span>
            <span className="text-xs text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">Перейти</span>
          </Link>
        ))}
      </div>
      <style>{`
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        @keyframes spin-slower { 0% { transform: rotate(0deg); } 100% { transform: rotate(-360deg); } }
        @keyframes spin-slowest { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .animate-spin-slow { animation: spin-slow 18s linear infinite; }
        .animate-spin-slower { animation: spin-slower 28s linear infinite; }
        .animate-spin-slowest { animation: spin-slowest 36s linear infinite; }
      `}</style>
    </div>
  )
}
