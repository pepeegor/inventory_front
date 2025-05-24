import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { FiUser, FiBell, FiChevronDown, FiSettings, FiLogOut, FiMenu, FiSearch, FiMoon, FiSun, FiShield, FiInfo } from 'react-icons/fi'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'

// Route name mapping for breadcrumbs
const routeNames = {
  '': 'Главная',
  'devices': 'Устройства',
  'device-types': 'Типы устройств',
  'locations': 'Локации',
  'maintenance-tasks': 'Техобслуживание',
  'analytics': 'Аналитика',
  'profile': 'Профиль',
  'write-off-reports': 'Списания',
  'replacement-suggestions': 'Предложения по замене',
}

export default function Header({ toggleSidebar }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  
  const location = useLocation()
  const { user, logout } = useAuth()
  
  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean)
    
    return [
      { name: 'Главная', path: '/' },
      ...pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`
        const name = routeNames[segment] || segment
        return { name, path }
      })
    ]
  }
  
  const breadcrumbs = generateBreadcrumbs()

  return (
    <header className="relative z-20">
      {/* Glassmorphism Header */}
      <div className="bg-gradient-to-r from-[#111113]/90 to-[#1a1a20]/90 backdrop-blur-md border-b border-[#2a2a30]/50 px-4 md:px-6 py-3 shadow-lg">
        <div className="flex justify-between items-center">
          {/* Left Section: Menu toggle and breadcrumbs */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleSidebar}
              className="hidden md:flex p-2 rounded-full hover:bg-[#2d2d36]/60 transition-all text-gray-400 hover:text-white"
            >
              <FiMenu className="text-xl" />
            </button>
            
            {/* Breadcrumbs */}
            <nav className="hidden sm:flex" aria-label="Breadcrumb">
              <ol className="inline-flex items-center">
                {breadcrumbs.map((crumb, idx) => (
                  <li key={idx} className="inline-flex items-center">
                    {idx > 0 && (
                      <span className="mx-2 text-gray-500">/</span>
                    )}
                    <Link
                      to={crumb.path}
                      className={`
                        text-sm font-medium hover:text-[#a78bfa] transition-colors
                        ${idx === breadcrumbs.length - 1 
                          ? 'text-white cursor-default pointer-events-none' 
                          : 'text-gray-400'}
                      `}
                      aria-current={idx === breadcrumbs.length - 1 ? 'page' : undefined}
                    >
                      {crumb.name}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
          </div>
          
          {/* Фишки вместо поиска/темы/уведомлений */}
          <div />
          
          {/* User Menu */}
          <div className="flex items-center space-x-1 md:space-x-3">
            <div className="relative">
              <button 
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-[#2d2d36]/60 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-medium shadow-lg shadow-violet-900/20 relative">
                  <span className="absolute -inset-1 rounded-full bg-violet-500/30 blur-xl opacity-60 animate-pulse"></span>
                  <span className="relative z-10">{user?.username?.charAt(0)?.toUpperCase() || 'U'}</span>
                </span>
                <div className="hidden md:block text-left">
                  <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-white">{user?.username || 'Пользователь'}</p>
                    {/* Индикатор онлайн */}
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{user?.role || 'Гость'}</p>
                </div>
                <FiChevronDown className={`transition-transform duration-200 hidden md:block ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {/* User Dropdown Menu */}
              <AnimatePresence>
                {userMenuOpen && (
                  <Motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl bg-[#1f1f25]/95 backdrop-blur-md border border-[#2a2a30]/70 z-50 overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-[#2a2a30]/70">
                      <p className="text-sm font-medium text-white">{user?.email}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user?.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
                    </div>
                    
                    {/* Menu Items */}
                    <div onClick={() => setUserMenuOpen(false)}>
                      <Link to="/profile" className="flex items-center px-4 py-2.5 hover:bg-[#2d2d36]/50 transition-colors">
                        <FiUser className="mr-2 text-violet-400" /> 
                        <span>Мой профиль</span>
                      </Link>
                      
                      {/* Admin panel link - only for admins */}
                      {user?.role === 'admin' && (
                        <a 
                          href="http://localhost:8000/admin/login" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center px-4 py-2.5 hover:bg-[#2d2d36]/50 transition-colors"
                        >
                          <FiShield className="mr-2 text-amber-500" />
                          <span>Админ-панель</span>
                        </a>
                      )}
                      
                      <div className="border-t border-[#2a2a30]/70 my-1"></div>
                      <button 
                        onClick={logout}
                        className="flex items-center w-full text-left px-4 py-2.5 text-red-400 hover:bg-[#2d2d36]/50 transition-colors"
                      >
                        <FiLogOut className="mr-2" /> 
                        <span>Выйти</span>
                      </button>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
