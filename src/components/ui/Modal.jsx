import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'
import { motion as Motion, AnimatePresence } from 'framer-motion'

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md' 
}) {
  const modalRef = useRef(null)
  
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }
  
  if (!isOpen) return null
  
  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
        {/* Backdrop */}
        <Motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <Motion.div
          ref={modalRef}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.3 }}
          className={`${sizeClasses[size]} w-full relative bg-[#1f1f25] border border-gray-800 rounded-lg shadow-xl z-10`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-800 px-5 py-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-gray-800/50 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
          
          {/* Content */}
          <div className="px-5 py-4">
            {children}
          </div>
        </Motion.div>
      </div>
    </AnimatePresence>,
    document.body
  )
}
