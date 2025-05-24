import React, { useState } from 'react'
import { FiLogIn, FiUserPlus, FiCpu } from 'react-icons/fi'
import LoginModal from './Auth/LoginModal'
import RegisterModal from './Auth/RegisterModal'
import { motion } from 'framer-motion'

const listVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.13,
    },
  },
}
const itemVariants = {
  hidden: { opacity: 0, x: 40 },
  visible: { opacity: 1, x: 0, transition: { type: 'spring', stiffness: 60, damping: 18 } },
}

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent relative overflow-hidden">
      {/* Глубокий тёмный градиентный фон */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: 'linear-gradient(120deg, #181825 0%, #23233a 60%, #312e81 100%)',
        }}
      />
      {/* Анимированные движущиеся круги */}
      <motion.div
        className="pointer-events-none fixed inset-0 z-0"
        initial={false}
        animate={{}}
      >
        {/* Крупные и средние круги */}
        <motion.div
          className="absolute"
          style={{ left: '10%', top: '20%' }}
          animate={{ y: [0, 60, 0, -40, 0], x: [0, 40, 0, -30, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-64 h-64 rounded-full bg-gradient-to-br from-violet-800/40 to-indigo-900/30 blur-3xl opacity-60" />
        </motion.div>
        <motion.div
          className="absolute"
          style={{ left: '70%', top: '10%' }}
          animate={{ y: [0, -50, 0, 30, 0], x: [0, -30, 0, 20, 0] }}
          transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-40 h-40 rounded-full bg-gradient-to-br from-indigo-700/40 to-pink-700/30 blur-2xl opacity-50" />
        </motion.div>
        <motion.div
          className="absolute"
          style={{ left: '60%', top: '70%' }}
          animate={{ y: [0, 40, 0, -30, 0], x: [0, 20, 0, -20, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-700/40 to-violet-700/30 blur-2xl opacity-40" />
        </motion.div>
        {/* Маленькие светящиеся точки */}
        <motion.div
          className="absolute"
          style={{ left: '30%', top: '80%' }}
          animate={{ y: [0, -20, 0, 10, 0], x: [0, 10, 0, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 opacity-70 blur-[2px] shadow-lg shadow-violet-500/30" />
        </motion.div>
        <motion.div
          className="absolute"
          style={{ left: '80%', top: '60%' }}
          animate={{ y: [0, 16, 0, -12, 0], x: [0, -12, 0, 8, 0] }}
          transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-400 to-violet-400 opacity-60 blur-[1.5px] shadow-lg shadow-emerald-400/30" />
        </motion.div>
        <motion.div
          className="absolute"
          style={{ left: '55%', top: '30%' }}
          animate={{ y: [0, 10, 0, -10, 0], x: [0, 8, 0, -8, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-violet-400 opacity-60 blur-[2px] shadow-lg shadow-pink-400/30" />
        </motion.div>
      </motion.div>
      {/* SVG-сетка и линии на заднем плане */}
      <svg className="absolute inset-0 w-full h-full z-0" viewBox="0 0 1440 900" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Сетка */}
        <g opacity="0.08">
          {[...Array(13)].map((_, i) => (
            <line key={i} x1={i * 120} y1="0" x2={i * 120} y2="900" stroke="#a78bfa" strokeWidth="1" />
          ))}
          {[...Array(10)].map((_, i) => (
            <line key={i} x1="0" y1={i * 100} x2="1440" y2={i * 100} stroke="#6366f1" strokeWidth="1" />
          ))}
        </g>
        {/* Плавные анимированные линии */}
        <path>
          <animate attributeName="d" dur="12s" repeatCount="indefinite"
            values="M0,700 Q360,600 720,700 T1440,700;M0,650 Q360,750 720,650 T1440,650;M0,700 Q360,600 720,700 T1440,700" />
          <animate attributeName="stroke" values="#a78bfa;#34d399;#f472b6;#a78bfa" dur="12s" repeatCount="indefinite" />
        </path>
        <path>
          <animate attributeName="d" dur="16s" repeatCount="indefinite"
            values="M0,800 Q480,850 960,800 T1440,800;M0,850 Q480,750 960,850 T1440,850;M0,800 Q480,850 960,800 T1440,800" />
          <animate attributeName="stroke" values="#34d399;#a78bfa;#6366f1;#34d399" dur="16s" repeatCount="indefinite" />
        </path>
        {/* Светящиеся точки */}
        <circle r="8" fill="#fff" opacity="0.10">
          <animate attributeName="cx" dur="10s" repeatCount="indefinite" values="320;400;600;900;1200;320" />
          <animate attributeName="cy" dur="10s" repeatCount="indefinite" values="200;300;400;200;100;200" />
        </circle>
        <circle r="6" fill="#a78bfa" opacity="0.13">
          <animate attributeName="cx" dur="14s" repeatCount="indefinite" values="1000;800;600;400;200;1000" />
          <animate attributeName="cy" dur="14s" repeatCount="indefinite" values="700;600;500;600;700;700" />
        </circle>
        <circle r="10" fill="#34d399" opacity="0.09">
          <animate attributeName="cx" dur="18s" repeatCount="indefinite" values="1200;1000;800;600;400;1200" />
          <animate attributeName="cy" dur="18s" repeatCount="indefinite" values="300;400;500;400;300;300" />
        </circle>
      </svg>
      {/* Контейнер с текстом и кнопками */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="flex-1 flex flex-col justify-center items-start px-8 md:pl-32 py-16 z-10"
      >
        <div className="w-full max-w-xl bg-[#181825ee] backdrop-blur-md rounded-2xl shadow-2xl border border-violet-700/30 p-10 md:p-12 mb-8 animate-glow-container">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            className="mb-8 flex items-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-violet-900/20">
              <FiCpu />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-glow tracking-tight leading-tight">
              Инвентаризация и аналитика IT-оборудования
            </h1>
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.7, ease: 'easeOut' }}
            className="text-lg text-gray-300 mb-6 max-w-2xl"
          >
            Комплексное решение для учёта, контроля и анализа компьютерной техники и периферии внутри магазина. Система объединяет проектирование архитектуры, клиент-серверное взаимодействие и современную базу данных для эффективного управления парком устройств.
          </motion.p>
          <motion.ul
            variants={listVariants}
            initial="hidden"
            animate="visible"
            className="mb-8 space-y-2 text-gray-400 text-base max-w-xl"
          >
            {[
              'Учёт и история перемещений техники и комплектующих',
              'Инвентаризация и планирование регламентных работ',
              'Карточки устройств с подробной информацией',
              'Генерация отчётов по списанию и обслуживанию',
              'Анализ сроков отказов деталей с прогнозом замены',
              'Автоматические предложения по замене компонентов',
            ].map((text, i) => (
              <motion.li key={i} variants={itemVariants} className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-violet-400 to-indigo-500 mr-2" />
                {text}
              </motion.li>
            ))}
          </motion.ul>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.7, ease: 'easeOut' }}
            className="flex gap-4"
          >
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-indigo-700 hover:from-violet-700 hover:to-indigo-800 text-white rounded-lg shadow-lg text-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-violet-400/60"
            >
              <FiLogIn /> Войти
            </button>
            <button
              onClick={() => setShowRegister(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white rounded-lg shadow-lg text-lg font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400/60"
            >
              <FiUserPlus /> Зарегистрироваться
            </button>
          </motion.div>
        </div>
      </motion.div>
      {/* Модальные окна */}
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} onSwitch={() => { setShowLogin(false); setShowRegister(true); }} />
      <RegisterModal isOpen={showRegister} onClose={() => setShowRegister(false)} onSwitch={() => { setShowRegister(false); setShowLogin(true); }} />
      <style>{`
        .drop-shadow-glow { text-shadow: 0 2px 16px #a78bfa44, 0 1px 2px #000; }
        @keyframes glowContainer {
          0%, 100% { box-shadow: 0 0 32px 0 #a78bfa33, 0 1px 2px #000; }
          50% { box-shadow: 0 0 64px 8px #a78bfa55, 0 1px 2px #000; }
        }
        .animate-glow-container { animation: glowContainer 5s infinite alternate; }
      `}</style>
    </div>
  )
} 