import { useQuery } from '@tanstack/react-query'
import { useParams } from 'react-router-dom'
import { getFailuresByDeviceId } from '../../api/failures'
import Loader from '../../components/ui/Loader'
import { FiAlertCircle } from 'react-icons/fi'
import AnimatedSection from '../../components/AnimatedSection'
import { format } from 'date-fns'

export default function FailureRecordsPage() {
  const { deviceId } = useParams()

  const { data: failures, isLoading, isError } = useQuery({
    queryKey: ['failures', deviceId],
    queryFn: () => getFailuresByDeviceId(deviceId),
    enabled: !!deviceId,
  })

  if (isLoading) return <Loader />
  if (isError) return <p className="text-red-500">Ошибка загрузки данных</p>

  return (
    <AnimatedSection animation="fade-in">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FiAlertCircle className="text-yellow-400" />
        История отказов устройства #{deviceId}
      </h1>
      {failures.length === 0 ? (
        <p className="text-gray-400">Отказов не зарегистрировано.</p>
      ) : (
        <div className="space-y-4">
          {failures.map((f) => (
            <div
              key={f.id}
              className="bg-[#1f2937] border border-gray-700 rounded-lg p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
                <span>Дата отказа: {format(new Date(f.failure_date), 'dd.MM.yyyy')}</span>
                {f.resolved_date && (
                  <span className="text-green-400">
                    Устранено: {format(new Date(f.resolved_date), 'dd.MM.yyyy')}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-300">
                <strong>Деталь:</strong> {f.part_type?.name || '—'}
              </div>
              {f.description && (
                <p className="mt-2 text-gray-400 text-sm">{f.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </AnimatedSection>
  )
}
