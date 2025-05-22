import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion as Motion } from 'framer-motion'
import { FiMenu, FiX } from 'react-icons/fi'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  
  
  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#121212] opacity-95"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20"></div>
        <div className="grid grid-cols-6 grid-rows-6 h-full w-full">
          {Array.from({ length: 36 }).map((_, i) => (
            <Motion.div 
              key={i}
              initial={{ opacity: 0.05 }}
              animate={{ opacity: [0.05, 0.08, 0.05] }}
              transition={{ duration: 5 + (i % 5), repeat: Infinity, repeatType: 'reverse' }}
              className="border-[0.5px] border-gray-800/30"
            />
          ))}
        </div>
      </div>

      {/* Content Container */}
      <div className="flex w-full h-full relative z-10 text-gray-100">
        {/* Desktop Sidebar */}
        <Motion.aside
          initial={false}
          animate={{ width: sidebarOpen ? '280px' : '0px' }}
          transition={{ duration: 0.3 }}
          className="bg-[#1f1f25]/90 backdrop-blur-md border-r border-gray-800/50 hidden md:block overflow-hidden h-full"
        >
          <Sidebar />
        </Motion.aside>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <Motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 h-full w-72 bg-[#1f1f25]/95 backdrop-blur-md border-r border-gray-800/50 z-50 md:hidden shadow-2xl"
            >
              <div className="flex justify-end p-4">
                <button 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-full bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 transition-all"
                >
                  <FiX size={20} />
                </button>
              </div>
              <Sidebar />
            </Motion.aside>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
          
          {/* Mobile Sidebar Toggle */}
          <div className="md:hidden p-2 border-b border-gray-800/50">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-full bg-gray-800/30 hover:bg-gray-700/50 transition-all"
            >
              <FiMenu className="text-xl" />
            </button>
          </div>

          {/* Page Content with Animation */}
          <Motion.main 
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 overflow-y-auto p-4"
          >
            <Outlet />
          </Motion.main>
        </div>
      </div>
    </div>
  )
}
