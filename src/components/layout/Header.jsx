import { useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { FiUser, FiBell, FiChevronDown, FiSettings, FiLogOut, FiMenu, FiSearch, FiMoon, FiSun, FiShield } from 'react-icons/fi'
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
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [searchActive, setSearchActive] = useState(false)
  const notifications = [
    { id: 1, message: 'Требуется замена детали #4432', time: '10 мин назад', type: 'warning' },
    { id: 2, message: 'Устройство перемещено в локацию Офис #3', time: '2 часа назад', type: 'info' },
    { id: 3, message: 'Обновлен статус списания', time: '10 часов назад', type: 'success' }
  ]
  
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
  const hasUnreadNotifications = true // This would be dynamic in a real app

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
          
          {/* Search Bar */}
          <div className="hidden md:block mx-4 flex-grow max-w-md">
            <div className={`
              relative transition-all duration-300 
              ${searchActive ? 'w-full' : 'w-[12rem]'}
            `}>
              <input 
                type="text" 
                placeholder="Поиск..." 
                className="w-full bg-[#252530]/50 border border-gray-700/50 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all"
                onFocus={() => setSearchActive(true)}
                onBlur={() => setSearchActive(false)}
              />
              <FiSearch className="absolute left-3.5 top-2 text-gray-400" />
            </div>
          </div>
          
          {/* User and Notifications */}
          <div className="flex items-center space-x-1 md:space-x-3">
            {/* Theme Toggle Example */}
            <button className="p-2 rounded-full hover:bg-[#2d2d36]/60 transition-colors text-gray-400 hover:text-white">
              <FiSun className="text-lg" />
            </button>
            
            {/* Notifications */}
            <div className="relative">
              <button 
                className="p-2 rounded-full hover:bg-[#2d2d36]/60 transition-colors text-gray-400 hover:text-white relative"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <FiBell className="text-lg" />
                {hasUnreadNotifications && (
                  <Motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full"
                  />
                )}
              </button>
              
              {/* Notifications Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <Motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 rounded-lg shadow-xl bg-[#1f1f25]/95 backdrop-blur-md border border-[#2a2a30]/70 z-50 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-[#2a2a30]/70">
                      <h3 className="font-medium">Уведомления</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className="px-4 py-3 border-b border-[#2a2a30]/30 hover:bg-[#2d2d36]/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start">
                            <div className={`
                              w-2 h-2 rounded-full mt-1.5 mr-2 flex-shrink-0
                              ${notification.type === 'warning' ? 'bg-amber-500' : 
                                notification.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'}
                            `}/>
                            <div>
                              <p className="text-sm">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 text-center border-t border-[#2a2a30]/70">
                      <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                        Показать все
                      </button>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* User Menu */}
            <div className="relative">
              <button 
                className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-[#2d2d36]/60 transition-colors"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-medium shadow-lg shadow-violet-900/20">
                  {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{user?.username || 'Пользователь'}</p>
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
                      <Link to="/settings" className="flex items-center px-4 py-2.5 hover:bg-[#2d2d36]/50 transition-colors">
                        <FiSettings className="mr-2 text-violet-400" /> 
                        <span>Настройки</span>
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
