import React, { useState } from 'react'
import { FiLogIn, FiUserPlus, FiShield } from 'react-icons/fi'
import LoginModal from './Auth/LoginModal'
import RegisterModal from './Auth/RegisterModal'

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gradient-to-br from-[#181825] via-[#23233a] to-[#312e81] relative overflow-hidden">
      {/* Левая часть — информация */}
      <div className="flex-1 flex flex-col justify-center items-start px-8 py-16 z-10">
        <div className="mb-8 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-violet-900/20">
            <FiShield />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-glow">Система учёта оборудования</h1>
        </div>
        <p className="text-lg text-gray-300 mb-6 max-w-xl">
          Добро пожаловать в современную платформу для управления парком оборудования, аналитики, обслуживания и контроля жизненного цикла устройств.
        </p>
        <ul className="mb-8 space-y-2 text-gray-400 text-base">
          <li>• Удобный учёт и поиск устройств</li>
          <li>• Гибкая аналитика и отчёты</li>
          <li>• Контроль обслуживания и замен</li>
          <li>• Современный дизайн и безопасность</li>
        </ul>
        <div className="flex gap-4">
          <button
            onClick={() => setShowLogin(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white rounded-lg shadow-lg text-lg font-semibold transition-all"
          >
            <FiLogIn /> Войти
          </button>
          <button
            onClick={() => setShowRegister(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white rounded-lg shadow-lg text-lg font-semibold transition-all"
          >
            <FiUserPlus /> Зарегистрироваться
          </button>
        </div>
        <div className="mt-10 text-gray-500 text-sm">
          <span>По всем вопросам: </span>
          <a href="mailto:support@example.com" className="text-violet-300 hover:underline">support@example.com</a>
        </div>
      </div>
      {/* Правая часть — фигура */}
      <div className="flex-1 flex items-center justify-center relative z-0">
        <div className="w-[480px] h-[480px] max-w-full">
          <svg viewBox="0 0 600 600" className="w-full h-full">
            <defs>
              <linearGradient id="blobGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
              <filter id="blobGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="24" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path>
              <animate attributeName="d" dur="12s" repeatCount="indefinite"
                values="M421,320Q420,390,360,430Q300,470,230,440Q160,410,140,340Q120,270,170,210Q220,150,300,140Q380,130,420,200Q460,270,421,320Z;
                        M420,320Q400,400,320,420Q240,440,180,390Q120,340,140,260Q160,180,240,160Q320,140,390,180Q460,220,440,300Q420,380,340,400Q260,420,200,370Q140,320,180,250Q220,180,300,180Q380,180,420,250Q460,320,420,320Z;
                        M421,320Q420,390,360,430Q300,470,230,440Q160,410,140,340Q120,270,170,210Q220,150,300,140Q380,130,420,200Q460,270,421,320Z" />
              <animate attributeName="fill" values="url(#blobGrad);url(#blobGrad);url(#blobGrad)" dur="12s" repeatCount="indefinite" />
            </path>
            <path d="M421,320Q420,390,360,430Q300,470,230,440Q160,410,140,340Q120,270,170,210Q220,150,300,140Q380,130,420,200Q460,270,421,320Z" fill="url(#blobGrad)" filter="url(#blobGlow)" opacity="0.7" />
          </svg>
        </div>
      </div>
      {/* Модальные окна */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSwitch={() => { setShowLogin(false); setShowRegister(true); }} />
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} onSwitch={() => { setShowRegister(false); setShowLogin(true); }} />
      <style>{`
        .drop-shadow-glow { text-shadow: 0 2px 16px #a78bfa44, 0 1px 2px #000; }
      `}</style>
    </div>
  )
} 