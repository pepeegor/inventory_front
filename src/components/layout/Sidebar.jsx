import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { FiBox, FiCpu, FiMap, FiSettings, FiClipboard, FiActivity, 
  FiChevronRight, FiUser, FiLayers, FiHome, 
  FiTool, FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { usePermissions } from '../../hooks/usePermissions'
import { useDataCenterActivity } from '../../hooks/useDataCenterActivity'
import { FaTools } from 'react-icons/fa'
import { getSummaryStats } from '../../api/stats'

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
  { to: '/inventory', icon: <FiClipboard />, label: 'Инвентаризация' },
    ],
    adminItems: [ // New section for admin-only items
      { to: '/part-types', icon: <FaTools />, label: 'Типы деталей' }
    ],
    requiredRole: null // Available to everyone
  },
  {
    title: 'Техобслуживание',
    icon: <FiTool />,
    items: [
      { to: '/maintenance-tasks', icon: <FiSettings />, label: 'Задачи' },
      { to: '/write-off-reports', icon: <FiClipboard />, label: 'Списания' },
      { to: '/movements', icon: <FiMap />, label: 'Перемещения', badge: 'Админ' },
    ],
    adminItems: [
      { to: '/replacement-suggestions', icon: <FiRefreshCw />, label: 'Замены' }
    ],
    requiredRole: null // Available to everyone, but we'll hide admin items for non-admins
  },
  {
    title: 'Аналитика',
    icon: <FiActivity />,
    items: [
      { to: '/analytics', icon: <FiActivity />, label: 'Отчеты', badge: 'Админ' },
      { to: '/analytics/admin', icon: <FiActivity />, label: 'Расширенная аналитика', badge: 'Админ' },
    ],
    requiredRole: 'admin' // Admin only section
  }
]

export default function Sidebar() {
  const [openSections, setOpenSections] = useState({})
  const [hoveredItem, setHoveredItem] = useState(null)
  const location = useLocation()
  const { isAdmin } = usePermissions()
  const { values, timestamps, serverStatus, loading } = useDataCenterActivity();
  
  // --- Добавлено: загрузка краткой статистики ---
  const [stats, setStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [statsError, setStatsError] = useState(false)
  useEffect(() => {
    let mounted = true
    const fetchStats = () => {
      setLoadingStats(true)
      getSummaryStats()
        .then(data => { if (mounted) { setStats(data); setStatsError(false); } })
        .catch(() => { if (mounted) { setStatsError(true); } })
        .finally(() => { if (mounted) setLoadingStats(false) })
    }
    fetchStats()
    const intervalId = setInterval(fetchStats, 60000)
    return () => { mounted = false; clearInterval(intervalId) }
  }, [])
  
  // Auto expand sections on load based on active route
  useEffect(() => {
    const newOpenSections = {}
    navSections.forEach(section => {
      if (section.items && Array.isArray(section.items) && 
          section.items.some(item => item.to === location.pathname)) {
        newOpenSections[section.title] = true
      }
    })
    setOpenSections(newOpenSections)
  }, [location.pathname])
  
  // Check if a section contains the active route
  const isSectionActive = (section) => {
    if (!section.items || !Array.isArray(section.items)) {
      return false;
    }
    
    const hasActiveRegularItem = section.items.some(item => location.pathname === item.to);
    const hasActiveAdminItem = isAdmin && section.adminItems && section.adminItems.some(item => location.pathname === item.to);
    
    return hasActiveRegularItem || hasActiveAdminItem;
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
    return section.requiredRole === null || (section.requiredRole === 'admin' && isAdmin);
  });
  
  // Animation variants for panels
  const panelVariants = {
    open: { height: 'auto', opacity: 1 },
    closed: { height: 0, opacity: 0 }
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Background Grid Pattern - Matching AppLayout */}
      <div className="absolute inset-0 z-0 opacity-30 overflow-hidden">
        <div className="grid grid-cols-4 grid-rows-12 h-full w-full">
          {Array.from({ length: 48 }).map((_, i) => (
            <Motion.div 
              key={i}
              initial={{ opacity: 0.1 }}
              animate={{ opacity: [0.1, 0.15, 0.1] }}
              transition={{ duration: 3 + (i % 3), repeat: Infinity, repeatType: 'reverse' }}
              className="border-[0.5px] border-violet-900/20"
            />
          ))}
        </div>
      </div>

      {/* Sidebar Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar relative z-10 pt-2">
        <div className="px-3 mb-6">
          {/* System Status Dashboard Card */}
          <Motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="w-full rounded-xl overflow-hidden bg-gradient-to-br from-violet-900/30 to-indigo-800/20 backdrop-blur-sm border border-violet-700/30 shadow-lg"
          >
            <div className="p-3 text-center">
              <h3 className="text-[0.8rem] font-medium text-violet-300">Статус системы</h3>
              
              <div className="grid grid-cols-3 gap-1 my-2">
                <div className="px-2 py-1.5 rounded-lg bg-[#2d2d36]/40">
                  <div className="text-xs text-violet-400">Устройств</div>
                  <div className="text-lg font-semibold">
                    {loadingStats ? <span className="animate-pulse">...</span> : (statsError ? '—' : stats?.total_devices ?? '—')}
                  </div>
                </div>
                <div className="px-2 py-1.5 rounded-lg bg-[#2d2d36]/40">
                  <div className="text-xs text-violet-400">Неполадки</div>
                  <div className="text-lg font-semibold">
                    {loadingStats ? <span className="animate-pulse">...</span> : (statsError ? '—' : stats?.total_failures ?? '—')}
                  </div>
                </div>
                <div className="px-2 py-1.5 rounded-lg bg-[#2d2d36]/40">
                  <div className="text-xs text-violet-400">Списано</div>
                  <div className="text-lg font-semibold">
                    {loadingStats ? <span className="animate-pulse">...</span> : (statsError ? '—' : stats?.total_writeoffs ?? '—')}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 px-2 flex justify-between items-center">
                <div className="flex items-center">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-1.5"></span>
                  <span className="text-xs text-gray-400">Серверы работают</span>
                </div>
                <div className="text-xs text-violet-400">99.8% аптайм</div>
              </div>
            </div>
          </Motion.div>
        </div>

        {/* Navigation Menu */}
        <div className="space-y-1 px-3">
          {filteredSections.map((section) => {
            const isActive = isSectionActive(section)
            const isSectionOpen = openSections[section.title] ?? isActive
            
            // Special handling for "Главная" section - make it a direct link
            if (section.title === 'Главная') {
              return (
                <Motion.div 
                  key={section.title} 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="mb-1"
                >
          <NavLink
                    to="/"
                    className={({ isActive }) => `
                      w-full flex items-center px-4 py-2.5 rounded-lg transition-all
                      ${isActive 
                        ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-white backdrop-blur-sm border border-violet-500/20' 
                        : 'text-gray-400 hover:bg-[#2d2d36]/50 hover:text-white'}
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-lg ${isActive ? 'text-violet-400' : 'text-gray-500'}`}>
                        {section.icon}
                      </span>
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                  </NavLink>
                </Motion.div>
              )
            }

            // Regular section handling for other sections
            return (
              <Motion.div 
                key={section.title} 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="mb-1"
              >
                {/* Section Header */}
                <button
                  onClick={() => toggleSection(section.title)}
                  className={`
                    w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all
                    ${isActive 
                      ? 'bg-gradient-to-r from-violet-600/20 to-indigo-600/20 text-white backdrop-blur-sm border border-violet-500/20' 
                      : 'text-gray-400 hover:bg-[#2d2d36]/50 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={`text-lg ${isActive ? 'text-violet-400' : 'text-gray-500'}`}>
                      {section.icon}
                    </span>
                    <span className="font-medium text-sm">{section.title}</span>
                    
                    {/* Admin badge */}
                    {section.requiredRole === 'admin' && (
                      <span className="text-xs px-1.5 py-0.5 bg-violet-900/50 text-violet-300 rounded-full text-[0.65rem] font-medium">
                        Админ
                      </span>
                    )}
                  </div>
                  <Motion.span
                    animate={{ rotate: isSectionOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`text-sm ${isActive ? 'text-violet-400' : 'text-gray-500'}`}
                  >
                    <FiChevronRight />
                  </Motion.span>
                </button>
                
                {/* Section Items */}
                <AnimatePresence>
                  {isSectionOpen && section.items && Array.isArray(section.items) && (
                    <Motion.div
                      variants={panelVariants}
                      initial="closed"
                      animate="open"
                      exit="closed"
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1 pb-1 space-y-0.5 pl-10">
                        {section.items.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `
                              relative flex items-center gap-3 px-4 py-2 rounded-md
                              transition-all duration-150 group
                              ${isActive 
                                ? 'bg-violet-500/10 text-white border border-violet-500/10' 
                                : 'text-gray-400 hover:bg-[#2d2d36]/50 hover:text-gray-200'}
                            `}
                            onMouseEnter={() => setHoveredItem(item.to)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <span className={({ isActive }) => 
                              `transition-colors ${isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-violet-400'}`
                            }>
                              {item.icon}
                            </span>
                            <span className="text-sm">{item.label}</span>
                            
                            {/* Badge */}
                            {item.badge && isAdmin && (
                              <span className="absolute right-3 bg-violet-700/80 text-violet-300 text-xs px-1.5 py-0.5 rounded-full text-[0.65rem]">
                                {item.badge}
                              </span>
                            )}
                            
                            {/* Hover indicator */}
                            {hoveredItem === item.to && (
                              <Motion.span
                                layoutId="hoverIndicator"
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-violet-500 rounded-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                              />
                            )}
                          </NavLink>
                        ))}
                        
                        {/* Admin Items */}
                        {isAdmin && section.adminItems && section.adminItems.map((item) => (
                          <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) => `
                              relative flex items-center gap-3 px-4 py-2 rounded-md
                              transition-all duration-150 group
                              ${isActive 
                                ? 'bg-violet-500/10 text-white border border-violet-500/10' 
                                : 'text-gray-400 hover:bg-[#2d2d36]/50 hover:text-gray-200'}
                            `}
                            onMouseEnter={() => setHoveredItem(item.to)}
                            onMouseLeave={() => setHoveredItem(null)}
                          >
                            <span className={({ isActive }) => 
                              `transition-colors ${isActive ? 'text-violet-400' : 'text-gray-500 group-hover:text-violet-400'}`
                            }>
                              {item.icon}
                            </span>
                            <span className="text-sm">{item.label}</span>
                            
                            {/* Admin badge */}
                            <span className="absolute right-3 bg-violet-700/80 text-violet-300 text-xs px-1.5 py-0.5 rounded-full text-[0.65rem]">
                              Админ
                            </span>
                            
                            {/* Hover indicator */}
                            {hoveredItem === item.to && (
                              <Motion.span
                                layoutId="hoverIndicator"
                                className="absolute left-0 top-1/2 -translate-y-1/2 h-3/5 w-1 bg-violet-500 rounded-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
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
      
      {/* Bottom Utility Card */}
      <div className="mt-auto pt-4 pb-6 px-4">
        <div className="rounded-xl overflow-hidden backdrop-blur-sm border border-violet-800/20 shadow-lg">
          <div className="p-3 bg-gradient-to-br from-[#2d2d36]/50 to-[#252530]/50">
            <div className="mb-1 flex justify-between items-center">
              <h3 className="text-xs font-medium text-violet-300">Активность ЦОД</h3>
              <span className={`
                inline-block rounded-full px-2 py-0.5 text-[0.65rem] font-medium 
                ${serverStatus === 'online' ? 'bg-emerald-700/40 text-emerald-300' : 
                  serverStatus === 'warning' ? 'bg-amber-700/40 text-amber-300' : 
                  'bg-red-700/40 text-red-300'}
              `}>
                {serverStatus === 'online' ? 'Стабильно' : 
                 serverStatus === 'warning' ? 'Нагрузка' : 'Критично'}
              </span>
            </div>
            
            {/* Server Load Visualization */}
            <div className="h-16 flex items-end gap-0.5 mt-1">
              {loading ? (
                // Loading placeholder
                <div className="w-full h-full flex items-center justify-center">
                  <Motion.div 
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-xs text-violet-400"
                  >
                    Загрузка...
                  </Motion.div>
                </div>
              ) : (
                // Real data visualization
                values.map((value, i) => (
                  <Motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${value}%` }}
                    transition={{ 
                      duration: 0.5,
                      delay: i * 0.02
                    }}
                    className={`
                      flex-1 rounded-sm
                      ${value > 80 ? 'bg-gradient-to-t from-red-500/80 to-red-400/30' :
                       value > 60 ? 'bg-gradient-to-t from-amber-500/80 to-amber-400/30' :
                       'bg-gradient-to-t from-violet-500/80 to-violet-400/30'}
                    `}
                  />
                ))
              )}
            </div>
            
            <div className="mt-2 flex justify-between text-[0.65rem] text-gray-400">
              {timestamps.length > 0 ? (
                <>
                  <span>{new Date(timestamps[0]).getHours()}:00</span>
                  <span>{new Date(timestamps[Math.floor(timestamps.length / 3)]).getHours()}:00</span>
                  <span>{new Date(timestamps[Math.floor(timestamps.length * 2 / 3)]).getHours()}:00</span>
                  <span>{new Date(timestamps[timestamps.length - 1]).getHours()}:00</span>
                </>
              ) : (
                <>
                  <span>08:00</span>
                  <span>12:00</span>
                  <span>16:00</span>
                  <span>Сейчас</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
