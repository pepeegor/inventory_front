import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { fetchForecastReplacement, fetchSummary, fetchSummaryXlsx } from '../../api/analytics'
import AnimatedSection from '../../components/AnimatedSection'
import Loader from '../../components/ui/Loader'
import { useState } from 'react'
import { FaDownload, FaCalendarAlt, FaServer, FaTools, FaChartBar, FaCogs } from 'react-icons/fa'

export default function AnalyticsPage() {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ['summary'],
    queryFn: fetchSummary,
  })
  const { data: forecast, isLoading: loadingForecast } = useQuery({
    queryKey: ['forecast'],
    queryFn: fetchForecastReplacement,
  })
  const [downloading, setDownloading] = useState(false)

  // Скачивание xlsx
  const handleDownload = async () => {
    setDownloading(true)
    try {
      const blob = await fetchSummaryXlsx()
      const url = window.URL.createObjectURL(new Blob([blob]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', 'analytics_summary.xlsx')
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)
    } finally {
      setDownloading(false)
    }
  }

  // Форматирование даты
  const fmt = iso => iso ? format(parseISO(iso), 'dd.MM.yyyy') : '—'

  return (
    <AnimatedSection className="p-6 rounded-2xl bg-gradient-to-br from-[#181825] via-[#23233a] to-[#312e81] text-gray-100 animate-fadeIn overflow-hidden relative">
      {/* Фоновые эффекты */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-gradient-radial from-violet-600/30 to-transparent rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-radial from-amber-400/20 to-transparent rounded-full blur-2xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 w-1/2 h-1/2 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-2xl opacity-60" style={{ transform: 'translate(-50%, -50%)' }} />
      </div>
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold flex items-center gap-3 drop-shadow-glow">
            <FaChartBar className="text-violet-400" />
            Общая аналитика
          </h2>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-700 to-indigo-700 hover:from-violet-800 hover:to-indigo-800 text-white rounded-lg shadow transition-all duration-200 transform hover:scale-105 border border-violet-500/20 disabled:opacity-60"
          >
            <FaDownload />
            {downloading ? 'Скачивание...' : 'Выгрузить XLSX'}
          </button>
      </div>

        {(loadingSummary || loadingForecast) ? <Loader /> : (
          <>
            {/* Прогноз замены */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-6 items-center bg-gradient-to-r from-amber-900/30 to-amber-800/20 border border-amber-500/20 rounded-xl p-6 shadow-lg">
                <FaCalendarAlt className="text-amber-400 text-4xl mb-2 md:mb-0" />
                <div>
                  <div className="text-lg text-amber-300 font-semibold mb-1">Прогноз даты следующей замены детали</div>
                  <div className="text-3xl font-bold text-white drop-shadow-glow">
                    {forecast?.forecast_replacement_date ? fmt(forecast.forecast_replacement_date) : '—'}
                  </div>
                  <div className="text-gray-400 mt-1">На основе среднего интервала отказа по всем типам деталей</div>
                </div>
              </div>
            </div>

            {/* Карточки статистики */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="p-4 rounded-xl bg-gradient-to-br from-violet-900/30 to-violet-800/20 border border-violet-500/20">
                <div className="text-sm text-violet-300 mb-1">Всего устройств</div>
                <div className="text-2xl font-bold text-white flex items-center gap-2"><FaServer />{summary?.total_devices ?? '—'}</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-500/20">
                <div className="text-sm text-emerald-300 mb-1">Активных</div>
                <div className="text-2xl font-bold text-white flex items-center gap-2">{summary?.status_counts?.active ?? '—'}</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-500/20">
                <div className="text-sm text-amber-300 mb-1">В ремонте</div>
                <div className="text-2xl font-bold text-white flex items-center gap-2">{summary?.status_counts?.maintenance ?? '—'}</div>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-pink-900/30 to-pink-800/20 border border-pink-500/20">
                <div className="text-sm text-pink-300 mb-1">Списано</div>
                <div className="text-2xl font-bold text-white flex items-center gap-2">{summary?.status_counts?.decommissioned ?? '—'}</div>
              </div>
            </div>

            {/* Дополнительная статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Производители */}
              <div className="bg-gradient-to-br from-violet-900/30 to-violet-800/20 border border-violet-500/20 rounded-xl p-6 shadow-lg">
                <div className="text-lg font-semibold mb-2 flex items-center gap-2"><FaTools className="text-violet-400" /> Устройства по производителям</div>
                <ul className="space-y-2 mt-2">
                  {summary?.devices_by_manufacturer ? (
                    Object.entries(summary.devices_by_manufacturer).map(([man, count]) => (
                      <li key={man} className="flex justify-between items-center">
                        <span className="text-gray-200">{man}</span>
                        <span className="font-bold text-violet-300">{count}</span>
                </li>
                    ))
                  ) : <li className="text-gray-400">Нет данных</li>}
                </ul>
              </div>
              {/* Обслуживание */}
              <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/20 border border-amber-500/20 rounded-xl p-6 shadow-lg">
                <div className="text-lg font-semibold mb-2 flex items-center gap-2"><FaCogs className="text-amber-400" /> Обслуживание</div>
                <ul className="space-y-2 mt-2">
                  {summary?.maintenance_counts ? (
                    Object.entries(summary.maintenance_counts).map(([type, count]) => (
                      <li key={type} className="flex justify-between items-center">
                        <span className="text-gray-200">{type}</span>
                        <span className="font-bold text-amber-300">{count}</span>
                </li>
                    ))
                  ) : <li className="text-gray-400">Нет данных</li>}
              </ul>
              </div>
          </div>

            {/* Прочие метрики */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div className="bg-gradient-to-br from-pink-900/30 to-pink-800/20 border border-pink-500/20 rounded-xl p-6 shadow-lg flex flex-col gap-2">
                <div className="text-lg font-semibold mb-2 text-pink-300">Средний возраст устройств</div>
                <div className="text-3xl font-bold text-white">{summary?.avg_device_age_days != null ? `${summary.avg_device_age_days.toFixed(1)} дн.` : '—'}</div>
              </div>
              <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-500/20 rounded-xl p-6 shadow-lg flex flex-col gap-2">
                <div className="text-lg font-semibold mb-2 text-emerald-300">Всего отказов</div>
                <div className="text-3xl font-bold text-white">{summary?.total_failures ?? '—'}</div>
              </div>
          </div>
        </>
      )}
      </div>
    </AnimatedSection>
  )
}
