import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { FiRefreshCw, FiFilter, FiSearch, FiCalendar, FiCpu, FiClock, FiUser, FiMessageSquare } from 'react-icons/fi'
import { motion as Motion } from 'framer-motion'
import axios from '../../api/axiosClient'
import { format, differenceInDays, isBefore } from 'date-fns'
import { ru } from 'date-fns/locale'

export default function ReplacementSuggestionsPage() {
  const [filters, setFilters] = useState({
    part_type_id: '',
    date_from: '',
    date_to: ''
  })
  const [searchTerm, setSearchTerm] = useState('')

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['replacementSuggestions', filters],
    queryFn: async () => {
      const params = {}
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params[key] = filters[key]
        }
      })
      const { data } = await axios.get('/replacement-suggestions', { params })
      return data
    },
  })

  const { data: partTypes = [] } = useQuery({
    queryKey: ['partTypes'],
    queryFn: async () => {
      const { data } = await axios.get('/part-types')
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

  // Filter suggestions by search term
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.part_type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suggestion.comments?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    suggestion.generated_by?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate suggestion stats
  const suggestionStats = {
    total: filteredSuggestions.length,
    urgent: filteredSuggestions.filter(s => {
      const daysUntilReplacement = differenceInDays(
        new Date(s.forecast_replacement_date),
        new Date()
      )
      return daysUntilReplacement <= 7
    }).length
  }

  // Get urgency indicator
  const getUrgencyIndicator = (date) => {
    const daysUntilReplacement = differenceInDays(new Date(date), new Date())
    
    if (isBefore(new Date(date), new Date())) {
      return { text: 'Просрочено', color: 'red' }
    }
    
    if (daysUntilReplacement <= 7) {
      return { text: 'Срочно', color: 'amber' }
    }
    
    if (daysUntilReplacement <= 30) {
      return { text: 'Скоро', color: 'yellow' }
    }
    
    return { text: 'В порядке', color: 'emerald' }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
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
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <FiRefreshCw className="text-violet-400" />
            Предложения по замене
          </h2>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Поиск по предложениям..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-violet-400" />
            </div>
          </div>
        </div>

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
                    Тип детали
                  </label>
                  <select
                    value={filters.part_type_id}
                    onChange={(e) => handleFilterChange('part_type_id', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  >
                    <option value="">Все типы</option>
                    {partTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    С даты
                  </label>
                  <input
          type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
        />
      </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    По дату
                  </label>
                  <input
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#1f1f25]/90 border border-violet-500/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>
        </Motion.div>

        {/* Stats Cards */}
        <Motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
        >
          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-violet-800/20 backdrop-blur-sm border border-violet-500/20"
          >
            <div className="text-sm text-violet-300 mb-1">Всего предложений</div>
            <div className="text-2xl font-bold text-white">{suggestionStats.total}</div>
          </Motion.div>

          <Motion.div
            whileHover={{ scale: 1.02 }}
            className="p-4 rounded-xl bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 backdrop-blur-sm border border-yellow-500/20"
          >
            <div className="text-sm text-yellow-300 mb-1">Срочных</div>
            <div className="text-2xl font-bold text-white">{suggestionStats.urgent}</div>
          </Motion.div>
        </Motion.div>

        {/* Main Content */}
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-violet-500/20 overflow-hidden backdrop-blur-sm bg-[#1f1f25]/90"
        >
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="relative w-16 h-16">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-500/20 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-violet-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            </div>
          ) : filteredSuggestions.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              {searchTerm ? 'Предложения не найдены' : 'Нет предложений'}
            </div>
          ) : (
            <div className="grid gap-4 p-6">
              {filteredSuggestions.map((suggestion) => {
                const urgency = getUrgencyIndicator(suggestion.forecast_replacement_date)
                
                return (
                  <Motion.div
                    key={suggestion.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#2d2d36] border border-violet-500/20 rounded-xl p-6 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <FiCpu className="text-violet-400" />
                          <h3 className="text-lg font-semibold text-white">
                            {suggestion.part_type.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <FiCalendar className="text-violet-400" />
                            {format(new Date(suggestion.suggestion_date), 'd MMMM yyyy', { locale: ru })}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiUser className="text-violet-400" />
                            {suggestion.generated_by || 'Система'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg bg-black/20">
                      <div className="flex items-center gap-2">
                        <FiClock className="text-violet-400" />
                        <span className="text-sm text-gray-300">
                          Прогноз замены:
                        </span>
                        <span className="text-sm font-medium text-white">
                          {format(new Date(suggestion.forecast_replacement_date), 'd MMMM yyyy', { locale: ru })}
                        </span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium bg-${urgency.color}-900/50 text-${urgency.color}-300`}>
                        {urgency.text}
                      </span>
                    </div>

                    {suggestion.comments && (
                      <div className="flex items-start gap-2 text-sm text-gray-300">
                        <FiMessageSquare className="text-violet-400 mt-1" />
                        <p>{suggestion.comments}</p>
        </div>
      )}
                  </Motion.div>
                )
              })}
            </div>
          )}
        </Motion.div>
      </Motion.div>
    </div>
  )
}
