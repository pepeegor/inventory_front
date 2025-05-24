import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiMap, FiFilter, FiSearch, FiBox, FiCalendar, FiArrowRight, FiUser, FiMapPin, FiClock, FiRefreshCw } from 'react-icons/fi'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import axios from '../../api/axiosClient'
import { format, formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useLocations } from '../../hooks/useLocations'

export default function MovementsPage() {
  const [filters, setFilters] = useState({
    device_id: '',
    performed_by: '',
    from_location_id: '',
    to_location_id: '',
    moved_from: '',
    moved_to: '',
    offset: 0,
    limit: 100
  })
  const [searchTerm, setSearchTerm] = useState('')
  const { locations: _ } = useLocations() // Destructure but ignore since we don't use it

  const { data: movements = [], isLoading } = useQuery({
    queryKey: ['movements', filters],
    queryFn: async () => {
      const params = {}
      Object.keys(filters).forEach(key => {
        if (filters[key] !== '') {
          params[key] = filters[key]
        }
      })
      const { data } = await axios.get('/movements/', { params })
      return data
    },
  })

  const { data: devices = [] } = useQuery({
    queryKey: ['devices'],
    queryFn: async () => {
      const { data } = await axios.get('/devices')
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

  // Filter movements by search term
  const filteredMovements = movements.filter(movement =>
    movement.device?.serial_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.device?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.from_location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.to_location?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.performed_by_user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    movement.notes?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate movement stats
  const movementStats = {
    total: filteredMovements.length,
    uniqueLocations: new Set([
      ...filteredMovements.map(m => m.from_location?.id).filter(Boolean),
      ...filteredMovements.map(m => m.to_location?.id).filter(Boolean)
    ]).size,
    lastDay: filteredMovements.filter(m => {
      const moveDate = new Date(m.moved_at)
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return moveDate > yesterday
    }).length
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const resetFilters = () => {
    setFilters({
      device_id: '',
      performed_by: '',
      from_location_id: '',
      to_location_id: '',
      moved_from: '',
      moved_to: '',
      offset: 0,
      limit: 100
    })
  }

  // Get relative time
  const getRelativeTime = (date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ru })
  }

  return (
    <div className="p-6 animate-fadeIn">
      {/* Header Section */}
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <FiMap className="text-violet-400" />
              История перемещений
            </h2>
            <p className="text-gray-400">Отслеживайте все перемещения устройств в системе</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по перемещениям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6"
        >
          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-violet-800/20 backdrop-blur-sm border border-violet-500/20"
          >
            <div className="text-sm text-violet-300 mb-1">Всего перемещений</div>
            <div className="text-2xl font-bold text-white">{movementStats.total}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 backdrop-blur-sm border border-emerald-500/20"
          >
            <div className="text-sm text-emerald-300 mb-1">Локаций задействовано</div>
            <div className="text-2xl font-bold text-white">{movementStats.uniqueLocations}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-800/20 backdrop-blur-sm border border-amber-500/20"
          >
            <div className="text-sm text-amber-300 mb-1">За последние 24ч</div>
            <div className="text-2xl font-bold text-white">{movementStats.lastDay}</div>
          </Motion.div>
        </Motion.div>

        {/* Filters Section */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="bg-[#1f1f25] border border-violet-500/20 rounded-xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-violet-500/20 bg-gradient-to-r from-violet-900/30 via-violet-800/20 to-violet-900/30">
              <div className="flex items-center gap-2">
                <FiFilter className="text-violet-400" />
                <h3 className="text-lg font-medium text-white">Фильтры</h3>
              </div>
            </div>
            
            <div className="p-6 space-y-6 bg-gradient-to-b from-violet-900/10 to-transparent">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    С даты
                  </label>
                  <input
                    type="datetime-local"
                    value={filters.moved_from}
                    onChange={(e) => handleFilterChange('moved_from', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    По дату
                  </label>
                  <input
                    type="datetime-local"
                    value={filters.moved_to}
                    onChange={(e) => handleFilterChange('moved_to', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Устройство
                  </label>
                  <select
                    value={filters.device_id}
                    onChange={(e) => handleFilterChange('device_id', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">Все устройства</option>
                    {devices.map(device => (
                      <option key={device.id} value={device.id}>
                        {device.name || device.serial_number}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-2 px-4 py-2 bg-violet-900/20 hover:bg-violet-900/40 text-violet-300 rounded-lg transition-colors border border-violet-500/20"
                >
                  <FiRefreshCw className="text-sm" /> Сбросить
                </button>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Main Content */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-violet-500/20 overflow-hidden backdrop-blur-sm bg-[#1f1f25]/90 relative"
        >
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 grid grid-cols-10 grid-rows-10 opacity-5 pointer-events-none">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border border-white/20"></div>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-500/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <FiBox className="w-16 h-16 mb-4 text-gray-500/50" />
              <p className="text-lg">
                {searchTerm ? 'Перемещения не найдены' : 'Нет перемещений'}
              </p>
              <p className="text-sm text-gray-500">
                {searchTerm ? 'Попробуйте изменить параметры поиска' : 'Здесь будут отображаться перемещения устройств'}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 p-6 relative z-10">
              <AnimatePresence>
                {filteredMovements.map((movement) => (
                  <Motion.div
                    key={movement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.01 }}
                    className="bg-gradient-to-r from-violet-900/10 via-violet-800/5 to-violet-900/10 hover:from-violet-900/20 hover:via-violet-800/10 hover:to-violet-900/20 border border-violet-500/20 hover:border-violet-500/40 rounded-xl p-6 space-y-4 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1" title={format(new Date(movement.moved_at), 'd MMMM yyyy HH:mm', { locale: ru })}>
                            <FiCalendar className="text-violet-400" />
                            {getRelativeTime(movement.moved_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiUser className="text-violet-400" />
                            {movement.performed_by_user?.full_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-black/20 backdrop-blur-sm">
                      <div className="flex items-center gap-6 flex-1">
                        <div className="flex items-center gap-2 min-w-[200px]">
                          <div className="p-2 bg-red-500/10 rounded-lg">
                            <FiMapPin className="text-red-400" />
                          </div>
                          <span className="text-sm text-gray-300">
                            {movement.from_location?.name || 'Начальное размещение'}
                          </span>
                        </div>
                        
                        <div className="flex-shrink-0">
                          <div className="p-2 bg-violet-500/10 rounded-lg">
                            <FiArrowRight className="text-violet-400" />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <FiMapPin className="text-emerald-400" />
                          </div>
                          <span className="text-sm text-gray-300">
                            {movement.to_location?.name}
                          </span>
                        </div>
                      </div>
                    </div>

                    {movement.notes && (
                      <div className="text-sm text-gray-400 italic bg-black/10 backdrop-blur-sm p-4 rounded-lg border border-violet-500/10">
                        {movement.notes}
                      </div>
                    )}
                  </Motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </Motion.div>
      </Motion.div>
    </div>
  )
} 