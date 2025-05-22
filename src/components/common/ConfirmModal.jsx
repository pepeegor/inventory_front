import { FaTimes, FaExclamationTriangle } from 'react-icons/fa'
import Modal from './Modal'

export default function ConfirmModal({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  onConfirm, 
  variant = 'danger',
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) {
  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'
      default:
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 p-4 rounded-t-lg flex justify-between items-center border-b border-gray-700">
        <h3 className="text-xl font-medium text-white flex items-center">
          {variant === 'danger' && <FaExclamationTriangle className="text-red-500 mr-2" />}
          {title}
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <FaTimes />
        </button>
      </div>
      
      <div className="bg-gray-800 p-6 text-gray-300">
        {message}
      </div>
      
      <div className="bg-gray-800 p-4 rounded-b-lg border-t border-gray-700 flex justify-end space-x-2">
        <button 
          type="button" 
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition duration-200"
        >
          {cancelText}
        </button>
        <button 
          type="button" 
          onClick={onConfirm}
          className={`px-4 py-2 ${getVariantClasses()} text-white rounded-md transition duration-200`}
        >
          {confirmText}
        </button>
      </div>
    </Modal>
  )
} 