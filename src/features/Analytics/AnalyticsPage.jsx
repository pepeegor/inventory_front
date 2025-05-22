import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import axios from '../../api/axiosClient'
import AnimatedSection from '../../components/AnimatedSection'
import Select from '../../components/ui/Select'
import Input from '../../components/ui/Input'
import Loader from '../../components/ui/Loader'

export default function AnalyticsPage() {
  const [partTypeId, setPartTypeId] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  // загрузить список типов деталей
  const { data: partTypes = [] } = useQuery({
    queryKey: ['partTypes'],
    queryFn: () => axios.get('/part-types').then(res => res.data),
    staleTime: 5 * 60 * 1000,
  })

  // статистика отказов
  const {
    data: stats,
    isLoading: statsLoading,
  } = useQuery({
    queryKey: ['failureStats', partTypeId, from, to],
    queryFn: () => {
      const params = {}
      if (from) params.from = from
      if (to) params.to = to
      return axios
        .get(`/analytics/part-types/${partTypeId}/failure-stats`, { params })
        .then(res => res.data)
    },
    enabled: Boolean(partTypeId),
  })

  // прогноз следующей замены
  const {
    data: forecast,
    isLoading: forecastLoading,
  } = useQuery({
    queryKey: ['forecastReplacement', partTypeId],
    queryFn: () =>
      axios
        .get(`/analytics/part-types/${partTypeId}/forecast-replacement`)
        .then(res => res.data),
    enabled: Boolean(partTypeId),
  })

  // хелпер для безопасного форматирования ISO-строки
  const fmt = iso =>
    iso
      ? format(parseISO(iso), 'dd.MM.yyyy')
      : '—'

  return (
    <AnimatedSection className="p-6 bg-[#1f2937] rounded-lg text-gray-100">
      <h2 className="text-2xl font-bold mb-6">Аналитика и прогноз</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          label="Тип детали"
          value={partTypeId}
          onChange={e => setPartTypeId(e.target.value)}
          options={[
            { label: 'Выберите...', value: '' },
            ...partTypes.map(p => ({ label: p.name, value: String(p.id) })),
          ]}
        />
        <Input
          label="С даты"
          type="date"
          value={from}
          onChange={e => setFrom(e.target.value)}
        />
        <Input
          label="По дату"
          type="date"
          value={to}
          onChange={e => setTo(e.target.value)}
        />
      </div>

      {statsLoading || forecastLoading ? (
        <Loader />
      ) : !partTypeId ? (
        <p className="text-gray-400">Выберите тип детали для анализа.</p>
      ) : (
        <>
          <div className="mb-6 p-4 border border-gray-700 rounded-lg bg-[#111827]">
            <h3 className="text-xl font-semibold mb-2 text-white">Статистика отказов</h3>
            {stats ? (
              <ul className="space-y-1 text-gray-300">
                <li>
                  Количество отказов: <span className="text-white">{stats.count}</span>
                </li>
                <li>
                  Среднее время до отказа:{' '}
                  <span className="text-white">
                    {stats.avg_time_to_failure != null
                      ? `${stats.avg_time_to_failure.toFixed(1)} дней`
                      : '—'}
                  </span>
                </li>
              </ul>
            ) : (
              <p className="text-gray-500">Нет данных за выбранный период</p>
            )}
          </div>

          <div className="p-4 border border-gray-700 rounded-lg bg-[#111827]">
            <h3 className="text-xl font-semibold mb-2 text-white">Прогноз замены</h3>
            {forecast?.forecast_replacement_date ? (
              <p className="text-white">
                Ожидаемая дата: <strong>{fmt(forecast.forecast_replacement_date)}</strong>
              </p>
            ) : (
              <p className="text-gray-500">Нет доступного прогноза</p>
            )}
          </div>
        </>
      )}
    </AnimatedSection>
  )
}
