import { useState,  useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FiBox, FiCpu, FiMap, FiSettings, FiClipboard, FiActivity, 
  FiChevronRight, FiLogOut, FiUser, FiLayers, FiHome, 
  FiTool, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import { FaBuilding, FaCog } from 'react-icons/fa'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { usePermissions } from '../../hooks/usePermissions'

// Group navigation items by category
const navSections = [
  {
    title: 'Главная',
    icon: <FiHome />,
    items: [
      { to: '/', icon: <FiHome />, label: 'Дашборд' },
    ],
    requiredRole: null // Available to everyone
  },
  {
    title: 'Инвентаризация',
    icon: <FiLayers />,
    items: [
  { to: '/devices', icon: <FiBox />, label: 'Устройства' },
  { to: '/device-types', icon: <FiCpu />, label: 'Типы устройств' },
  { to: '/locations', icon: <FiMap />, label: 'Локации' },
    ],
    requiredRole: null // Available to everyone
  },
  {
    title: 'Техобслуживание',
    icon: <FiTool />,
    items: [
      { to: '/maintenance-tasks', icon: <FiSettings />, label: 'Задачи' },
      { to: '/write-off-reports', icon: <FiClipboard />, label: 'Списания' },
      { to: '/replacement-suggestions', icon: <FiRefreshCw />, label: 'Замены' },
      { to: '/movements', icon: <FiMap />, label: 'Перемещения', badge: 'Админ' },
    ],
    requiredRole: null // Available to everyone, but we'll hide the badge for non-admins
  },
  {
    title: 'Аналитика',
    icon: <FiActivity />,
    items: [
      { to: '/analytics', icon: <FiActivity />, label: 'Отчеты', badge: 'Админ' },
    ],
    requiredRole: 'admin' // Admin only section
  },
  {
    title: 'Locations',
    path: '/locations',
    icon: <FaBuilding />,
  },
  {
    title: 'Manage Locations',
    path: '/locations/manage',
    icon: <FaCog />,
    roles: ['admin']
  }
]

export default function Sidebar() {
  const [openSections, setOpenSections] = useState({})
  const [hoveredItem, setHoveredItem] = useState(null)
  const { logout, user } = useAuth()
  const location = useLocation()
  const { isAdmin: _isAdmin } = usePermissions()
  
  // Auto expand sections on load based on active route
  useEffect(() => {
    const newOpenSections = {}
    navSections.forEach(section => {
      if (section.items && Array.isArray(section.items) && 
          section.items.some(item => item.to === location.pathname)) {
        newOpenSections[section.title] = true
      } else if (section.path && section.path === location.pathname) {
        newOpenSections[section.title] = true
      }
    })
    setOpenSections(newOpenSections)
  }, [location.pathname])
  
  // Check if a section contains the active route
  const isSectionActive = (section) => {
    // Handle sections with a direct path
    if (section.path) {
      return location.pathname === section.path;
    }
    
    // Handle sections with items array
    if (section.items && Array.isArray(section.items)) {
      return section.items.some(item => location.pathname === item.to);
    }
    
    return false;
  }

  // Toggle section open/closed
  const toggleSection = (title) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }))
  }

  // Filter sections based on user role
  const filteredSections = navSections.filter(section => {
    return section.requiredRole === null || section.requiredRole === user?.role;
  });

  return (
    <div className="flex flex-col h-full justify-between py-6 overflow-hidden">
      <div>
        {/* Logo & Brand */}
        <Motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-6 mb-8"
        >
          <Motion.div
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <h2 className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-indigo-500 bg-clip-text text-transparent flex items-center">
              <span className="mr-2">
                <span className="relative inline-flex">
                  <span className="w-3 h-3 bg-violet-500 rounded-full"></span>
                  <Motion.span 
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-3 h-3 bg-violet-400 rounded-full absolute inset-0 opacity-75"
                  ></Motion.span>
                </span>
              </span>
              ИТ-Учёт
            </h2>
            <p className="text-xs text-gray-400 ml-5 mt-0.5">Система управления оборудованием</p>
          </Motion.div>
        </Motion.div>
        
        {/* User Quick Info - Mobile Only */}
        <div className="px-5 mb-6 md:hidden">
          <div className="flex items-center gap-3 bg-gradient-to-r from-[#2d2d45]/40 to-[#33294e]/40 rounded-lg p-2">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-600 to-indigo-700 rounded-full flex items-center justify-center text-white font-medium shadow-lg">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-sm">{user?.username || 'Пользователь'}</p>
              <p className="text-xs text-gray-400">{user?.role || 'Гость'}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation Sections */}
        <div className="px-4 space-y-1.5 overflow-y-auto no-scrollbar" style={{ maxHeight: 'calc(100vh - 240px)' }}>
          {filteredSections.map((section) => {
            // Auto-open section if it contains active route
            const isActive = isSectionActive(section)
            const isSectionOpen = openSections[section.title] ?? isActive
            
            return (
              <Motion.div 
                key={section.title} 
                className="mb-1.5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all
                    ${isActive 
                      ? 'text-white bg-gradient-to-r from-violet-600/20 to-indigo-600/20 shadow-sm' 
                      : 'text-gray-400 hover:text-gray-200 hover:bg-[#2d2d36]/40'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${isActive ? 'text-violet-400' : 'text-gray-500'}`}>
                      {section.icon}
                    </span>
                    <span className="font-medium text-sm">{section.title}</span>
                    
                    {/* Add admin badge for admin-only sections */}
                    {(section.title === 'Типы деталей' || section.title === 'Локации') && (
                      <span className="text-xs px-1.5 py-0.5 bg-amber-700/30 text-amber-400 rounded-full">
                        Админ
                      </span>
                    )}
                  </div>
                  <Motion.span
                    animate={{ rotate: isSectionOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-gray-500"
                  >
                    <FiChevronRight />
                  </Motion.span>
                </button>
                
                {/* Section Items */}
                <AnimatePresence>
                  {isSectionOpen && (
                    <Motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pl-10 pt-1 pb-1 space-y-1">
                        {section.items.map((item) => (
          <NavLink
                            key={item.to}
                            to={item.to}
            className={({ isActive }) =>
                              isActive ? 'your-active-classes' : 'your-inactive-classes'
                            }
                            onMouseEnter={() => setHoveredItem(item.to)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <span className={({ isActive }) => 
                              isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-300'
                            }>
                              {item.icon}
                            </span>
                            <span className="text-sm">{item.label}</span>
                            
                            {/* Badge */}
                            {item.badge && (
                              <span className="absolute right-3 bg-violet-500/80 text-white text-xs px-1.5 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            
                            {/* Hover effect */}
                            {hoveredItem === item.to && (
                              <Motion.span
                                layoutId="hoverIndicator"
                                className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-500 rounded-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                              />
                            )}
          </NavLink>
        ))}
                      </div>
                    </Motion.div>
                  )}
                </AnimatePresence>
              </Motion.div>
            )
          })}
        </div>
      </div>
      
      {/* Footer Section */}
      <div className="px-4 mt-auto pt-4 border-t border-gray-800/50">
        <NavLink
          to="/profile"
          className={({ isActive }) => `
            relative flex items-center gap-3 px-3 py-2 rounded-md transition-all group mb-1
            ${isActive 
              ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-white' 
              : 'text-gray-400 hover:text-gray-200 hover:bg-[#2d2d36]/40'}
          `}
          onMouseEnter={() => setHoveredItem('/profile')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <span className={({ isActive }) => 
            isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-gray-300'
          }>
            <FiUser />
          </span>
          <span className="text-sm">Профиль</span>
          
          {hoveredItem === '/profile' && (
            <Motion.span
              layoutId="hoverIndicator"
              className="absolute left-0 top-0 bottom-0 w-0.5 bg-violet-500 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </NavLink>
        
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-[#2d2d36]/40 transition-all relative group"
          onMouseEnter={() => setHoveredItem('logout')}
          onMouseLeave={() => setHoveredItem(null)}
        >
          <span className="text-gray-500 group-hover:text-red-400">
            <FiLogOut />
          </span>
          <span className="text-sm group-hover:text-red-400">Выйти</span>
          
          {hoveredItem === 'logout' && (
            <Motion.span
              layoutId="hoverIndicator"
              className="absolute left-0 top-0 bottom-0 w-0.5 bg-red-500 rounded-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </button>
        
        {/* Version Info */}
        <div className="mt-4 px-3 text-xs text-gray-600">
          Версия 1.0.0
        </div>
      </div>
    </div>
  )
}
