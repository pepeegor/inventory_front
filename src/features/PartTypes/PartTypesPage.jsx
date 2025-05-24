import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaTools, FaSearch, FaPlus, FaEdit, FaTrash, FaTimes } from 'react-icons/fa'
import { motion as Motion } from 'framer-motion'
import { Dialog } from '@headlessui/react'
import AnimatedSection from '../../components/AnimatedSection'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import { usePermissions } from '../../hooks/usePermissions'
import { toast } from 'react-toastify'
import { getAllPartTypes, deletePartType } from '../../api/partTypes'
import AddPartTypeModal from './AddPartTypeModal'
import EditPartTypeModal from './EditPartTypeModal'

export default function PartTypesPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPartType, setSelectedPartType] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  const { isAdmin } = usePermissions()
  const queryClient = useQueryClient()

  // Fetch part types
  const { data: partTypes = [], isLoading } = useQuery({
    queryKey: ['partTypes'],
    queryFn: getAllPartTypes
  })

  // Filter part types locally based on search term
  const filteredPartTypes = partTypes.filter(type => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      type.name?.toLowerCase().includes(searchLower) ||
      type.description?.toLowerCase().includes(searchLower)
    );
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: deletePartType,
    onSuccess: () => {
      toast.success('Тип детали успешно удален')
      queryClient.invalidateQueries(['partTypes'])
      handleCloseDeleteModal()
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Ошибка при удалении типа детали')
    }
  })

  const handleOpenAddModal = () => setShowAddModal(true)
  const handleCloseAddModal = () => setShowAddModal(false)

  const handleOpenEditModal = (partType) => {
    setSelectedPartType(partType)
    setShowEditModal(true)
  }

  const handleCloseEditModal = () => {
    setSelectedPartType(null)
    setShowEditModal(false)
  }

  const handleOpenDeleteModal = (partType) => {
    setSelectedPartType(partType)
    setShowDeleteModal(true)
  }

  const handleCloseDeleteModal = () => {
    setSelectedPartType(null)
    setShowDeleteModal(false)
  }

  const handleDelete = () => {
    if (selectedPartType) {
      deleteMutation.mutate(selectedPartType.id)
    }
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-4 px-4">
        <div className="bg-gray-800 text-white rounded-lg shadow p-4 text-center">
          <h3 className="text-xl font-medium">Admin privileges required</h3>
          <p className="mt-2">You don't have permission to view this page.</p>
        </div>
      </div>
    )
  }

  return (
    <AnimatedSection className="p-6">
      {/* Header Section */}
      <Motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaTools className="mr-2 text-violet-400" />
            Типы деталей
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по типам деталей..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <FaPlus /> Добавить тип детали
            </Button>
          </div>
        </div>
      </Motion.div>

      {/* Main Content */}
      <Motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glassmorphism rounded-xl border border-violet-500/20 relative overflow-hidden"
      >
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-5 pointer-events-none">
          {Array.from({ length: 100 }).map((_, i) => (
            <div key={i} className="border border-white/20"></div>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-10">
            <Loader />
          </div>
        ) : filteredPartTypes.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            {searchTerm ? 'Типы деталей не найдены' : 'Нет типов деталей'}
          </div>
        ) : (
          <div className="relative z-10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-violet-500/20">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Название
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Описание
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Интервал отказа (дней)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider w-[120px]">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/20">
                {filteredPartTypes.map((partType) => (
                  <Motion.tr
                    key={partType.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                    className="transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-white">
                      {partType.name}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {partType.description || '-'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {partType.expected_failure_interval_days || 'Н/Д'}
                    </td>
                    <td className="px-6 py-4 flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenEditModal(partType)}
                        className="p-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 rounded-lg transition-colors"
                        title="Редактировать"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleOpenDeleteModal(partType)}
                        className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
                        title="Удалить"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </Motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Motion.div>

      {/* Modals */}
      {showAddModal && (
        <AddPartTypeModal
          isOpen={showAddModal}
          onClose={handleCloseAddModal}
        />
      )}

      {showEditModal && selectedPartType && (
        <EditPartTypeModal
          isOpen={showEditModal}
          onClose={handleCloseEditModal}
          partType={selectedPartType}
        />
      )}

      {showDeleteModal && selectedPartType && (
        <Dialog
          open={showDeleteModal}
          onClose={handleCloseDeleteModal}
          className="relative z-50"
        >
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

          <div className="fixed inset-0 flex items-center justify-center p-4">
            <Motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1f1f25] border border-violet-500/20 rounded-xl shadow-lg w-full max-w-lg overflow-hidden"
            >
              {/* Header */}
              <div className="p-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-900/30 via-violet-800/20 to-violet-900/30 flex justify-between items-center">
                <h3 className="text-lg font-medium text-white">
                  Удаление типа детали
                </h3>
                <button
                  onClick={handleCloseDeleteModal}
                  className="p-1 text-gray-400 hover:text-gray-300 transition-colors"
                >
                  <FaTimes />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-gray-300">
                  Вы уверены, что хотите удалить тип детали <span className="text-white font-medium">'{selectedPartType.name}'</span>?
                </p>
                <p className="mt-2 text-red-400 text-sm">
                  Это действие нельзя отменить.
                </p>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-violet-500/20 bg-black/20 flex justify-end gap-3">
                <button
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg transition-colors border border-gray-700"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors border border-red-500/20"
                >
                  Удалить
                </button>
              </div>
            </Motion.div>
          </div>
        </Dialog>
      )}
    </AnimatedSection>
  )
} 