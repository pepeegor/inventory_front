import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { FiX } from 'react-icons/fi'

export default function Modal({ 
  isOpen, 
  onClose, 
  children, 
  title,
  size = 'md' // sm, md, lg, xl
}) {
  useEffect(() => {
    if (isOpen) {
      // Prevent scrolling when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }
  
  if (!isOpen) return null
  
  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div 
        className="flex min-h-screen items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" />
        
        {/* Modal */}
        <div 
          className={`relative bg-[#1f2937] rounded-lg shadow-xl w-full ${sizeClasses[size]} z-50 animate-fadeIn`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
              <h3 className="text-lg font-medium text-white">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white focus:outline-none"
              >
                <FiX size={20} />
              </button>
            </div>
          )}
          
          {/* Content */}
          <div className="px-6 py-4">
            {children}
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
} 