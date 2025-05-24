import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { FaClipboard, FaSearch, FaPlus, FaCheck } from 'react-icons/fa'
import { motion as Motion } from 'framer-motion'
import AnimatedSection from '../../components/AnimatedSection'
import Button from '../../components/ui/Button'
import Loader from '../../components/ui/Loader'
import { format } from 'date-fns'
import { usePermissions } from '../../hooks/usePermissions'
import { toast } from 'react-toastify'
import AddWriteOffReportModal from './AddWriteOffReportModal'
import { fetchWriteOffReports, approveWriteOffReport } from '../../api/writeoffs'
import { getAllUsers } from '../../api/users'

const DEVICE_STATUSES = {
  active: 'Активно',
  maintenance: 'На обслуживании',
  decommissioned: 'Списано'
}

const REPORT_STATUSES = {
  pending: 'Ожидает утверждения',
  approved: 'Утвержден'
}

export default function WriteOffReportsPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: '',
    disposedBy: ''
  })

  const { isAdmin } = usePermissions()
  const queryClient = useQueryClient()

  // Fetch reports
  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['writeOffReports', filters],
    queryFn: () => fetchWriteOffReports({ search: searchTerm, ...filters }).then(res => res.data)
  })

  // Fetch users for filtering (only for admins)
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
    enabled: isAdmin, // Only fetch if user is admin
    staleTime: 5 * 60 * 1000,
  })

  // Approve report mutation
  const { mutate: approveReport } = useMutation({
    mutationFn: approveWriteOffReport,
    onSuccess: () => {
      toast.success('Отчет успешно утвержден')
      queryClient.invalidateQueries(['writeOffReports'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Не удалось утвердить отчет')
    }
  })

  // Обновим статистику для отчетов
  const reportStats = {
    total: reports.length,
    approved: reports.filter(r => r.approved_by).length,
    pending: reports.filter(r => !r.approved_by).length
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
            <FaClipboard className="mr-2 text-violet-400" />
            Отчёты по списанию
          </h2>
          
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по отчетам..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            
            <Button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <FaPlus /> Создать отчет
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
        >
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-indigo-800/20 backdrop-blur-sm border border-violet-700/30">
            <div className="text-sm text-violet-300 mb-1">Всего отчетов</div>
            <div className="text-2xl font-bold text-white">{reportStats.total}</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-indigo-800/20 backdrop-blur-sm border border-violet-700/30">
            <div className="text-sm text-violet-300 mb-1">Утверждено</div>
            <div className="text-2xl font-bold text-white">{reportStats.approved}</div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-indigo-800/20 backdrop-blur-sm border border-violet-700/30">
            <div className="text-sm text-violet-300 mb-1">Ожидают утверждения</div>
            <div className="text-2xl font-bold text-white">{reportStats.pending}</div>
          </div>
        </Motion.div>

        {/* Filters */}
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6"
        >
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
            className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
            className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          >
            <option value="">Все отчеты</option>
            <option value="approved">Утвержденные</option>
            <option value="pending">Не утвержденные</option>
          </select>
          {isAdmin && (
            <select
              value={filters.disposedBy}
              onChange={(e) => setFilters(prev => ({ ...prev, disposedBy: e.target.value }))}
              className="px-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            >
              <option value="">Все пользователи</option>
              {users.map(user => (
                <option key={user.id} value={user.id}>
                  {user.full_name || user.username}
                </option>
              ))}
            </select>
          )}
        </Motion.div>
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
        ) : reports.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            {searchTerm ? 'Отчеты не найдены' : 'Нет отчетов'}
          </div>
        ) : (
          <div className="relative z-10">
            <table className="w-full">
              <thead>
                <tr className="border-b border-violet-500/20">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[180px]">
                    Устройство
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[300px]">
                    Причина
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[120px]">
                    Дата
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[160px]">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider w-[180px]">
                    Оставил заявку
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider w-[120px]">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-violet-500/20">
                {reports.map((report) => {
                  const disposedByUser = users.find(u => u.id === report.disposed_by);
                  
                  return (
                    <Motion.tr
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-white">
                        {report.device.serial_number}
                      </td>
                      <td className="px-6 py-4 text-gray-300 break-words max-w-[300px]">
                        {report.reason}
                      </td>
                      <td className="px-6 py-4 text-gray-300 whitespace-nowrap">
                        {format(new Date(report.report_date), 'dd.MM.yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center justify-center min-w-[120px] px-3 py-1 rounded-full text-xs font-medium ${
                          report.approved_by 
                            ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-500/30' 
                            : 'bg-amber-900/50 text-amber-300 border border-amber-500/30'
                        }`}>
                          {report.approved_by ? 'Утвержден' : 'Не утвержден'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-300">
                        {disposedByUser?.full_name || disposedByUser?.username || 'Неизвестно'}
                      </td>
                      <td className="px-6 py-4 flex justify-end">
                        {isAdmin && !report.approved_by_user && (
                          <Button
                            onClick={() => approveReport(report.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-3 py-1 rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap"
                          >
                            <FaCheck className="text-xs" /> Утвердить
                          </Button>
                        )}
                      </td>
                    </Motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Motion.div>

      {/* Add Modal */}
      {showAddModal && (
        <AddWriteOffReportModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </AnimatedSection>
  )
}
