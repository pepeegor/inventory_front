import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import axios from '../../api/axiosClient'
import AnimatedSection from '../../components/AnimatedSection'
import Loader from '../../components/ui/Loader'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import { format } from 'date-fns'

export default function ReplacementSuggestionsPage() {
  const [status, setStatus] = useState('')
  const [partTypeId, setPartTypeId] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  const { data: suggestions = [], isLoading } = useQuery({
    queryKey: ['replacementSuggestions', status, partTypeId, dateFrom, dateTo],
    queryFn: async () => {
      const params = {}
      if (status) params.status = status
      if (partTypeId) params.part_type_id = partTypeId
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo

      const { data } = await axios.get('/replacement-suggestions', { params })
      return data
    },
  })

  const { data: parts = [] } = useQuery({
    queryKey: ['partTypes'],
    queryFn: async () => {
      const { data } = await axios.get('/part-types')
      return data
    },
    staleTime: 1000 * 60 * 5,
  })

  return (
    <AnimatedSection className="p-6">
      <h2 className="text-2xl font-bold mb-6">Предложения по замене</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Select
          label="Статус"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: 'Все', value: '' },
            { label: 'Ожидает', value: 'pending' },
            { label: 'Одобрено', value: 'approved' },
            { label: 'Отклонено', value: 'rejected' },
          ]}
        />
        <Select
          label="Тип детали"
          value={partTypeId}
          onChange={(e) => setPartTypeId(e.target.value)}
          options={[{ label: 'Все', value: '' }, ...parts.map(p => ({
            label: p.name,
            value: p.id,
          }))]}
        />
        <Input
          type="date"
          label="С даты"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          type="date"
          label="По дату"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid gap-4">
          {suggestions.length === 0 && (
            <div className="text-gray-400 text-center py-12">Нет предложений</div>
          )}
          {suggestions.map((s) => (
            <div
              key={s.id}
              className="bg-[#1f2937] border border-gray-700 p-4 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center mb-1">
                <h4 className="text-lg font-semibold">{s.part_type.name}</h4>
                <span
                  className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                    s.status === 'approved'
                      ? 'bg-green-800 text-green-300'
                      : s.status === 'rejected'
                      ? 'bg-red-800 text-red-300'
                      : 'bg-yellow-800 text-yellow-200'
                  }`}
                >
                  {s.status}
                </span>
              </div>
              <p className="text-sm text-gray-400">
                Замена прогнозируется на:{' '}
                <span className="text-white font-medium">
                  {format(new Date(s.forecast_replacement_date), 'dd.MM.yyyy')}
                </span>
              </p>
              {s.comments && (
                <p className="mt-2 text-sm text-gray-300">Комментарий: {s.comments}</p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Сгенерировано: {s.generated_by || 'система'}
              </p>
            </div>
          ))}
        </div>
      )}
    </AnimatedSection>
  )
}
