import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import axios from '../../api/axiosClient'
import AnimatedSection from '../../components/AnimatedSection'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Loader from '../../components/ui/Loader'
import { format } from 'date-fns'
import { usePermissions } from '../../hooks/usePermissions'
import Button from '../../components/ui/Button'
import { toast } from 'react-toastify'

export default function WriteOffReportsPage() {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [status, setStatus] = useState('')
  const [disposedBy, setDisposedBy] = useState('')

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['writeOffReports', dateFrom, dateTo, status, disposedBy],
    queryFn: async () => {
      const params = {}
      if (dateFrom) params.date_from = dateFrom
      if (dateTo) params.date_to = dateTo
      if (status) params.status = status
      if (disposedBy) params.disposed_by = disposedBy

      const { data } = await axios.get('/write-off-reports', { params })
      return data
    },
  })

  const { data: users = [], error: usersError } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await axios.get('/users')
      return data
    },
    staleTime: 5 * 60 * 1000,
  })

  const { canApproveWriteoffs } = usePermissions();

  const queryClient = useQueryClient()

  const { mutate: approveReport } = useMutation({
    mutationFn: async (reportId) => {
      return axios.post(`/write-off-reports/${reportId}/approve`)
    },
    onSuccess: () => {
      toast.success('Отчет успешно утвержден')
      queryClient.invalidateQueries(['writeOffReports'])
    },
    onError: (error) => {
      toast.error(error.response?.data?.detail || 'Не удалось утвердить отчет')
    }
  })

  useEffect(() => {
    if (usersError) {
      console.error("Error fetching users:", usersError);
      toast.error("Ошибка при загрузке пользователей");
    }
  }, [usersError]);

  return (
    <AnimatedSection className="p-6">
      <h2 className="text-2xl font-bold mb-6">Отчёты по списанию</h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          label="С даты"
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          label="По дату"
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <Select
          label="Статус"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={[
            { label: 'Все', value: '' },
            { label: 'Утверждено', value: 'approved' },
            { label: 'Не утверждено', value: 'pending' },
          ]}
        />
        <Select
          label="Списал"
          value={disposedBy}
          onChange={(e) => setDisposedBy(e.target.value)}
          options={[{ label: 'Все', value: '' }, ...users.map(u => ({
            label: u.name || u.email,
            value: u.id
          }))]}
        />
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid gap-4">
          {reports.length === 0 && (
            <div className="text-gray-400 text-center py-12">Нет отчётов</div>
          )}
          {reports.map(report => {
            // Находим пользователей по ID
            const disposedByUser = users.find(u => u.id === report.disposed_by);
            const approvedByUser = users.find(u => u.id === report.approved_by);
            
            return (
              <div
                key={report.id}
                className="bg-[#1f2937] border border-gray-700 p-4 rounded-lg shadow-sm"
              >
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-lg font-semibold">
                    Устройство: {report.device.serial_number}
                  </h4>
                  <span
                    className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                      report.approved_by_user
                        ? 'bg-green-800 text-green-300'
                        : 'bg-yellow-800 text-yellow-200'
                    }`}
                  >
                    {report.approved_by_user ? 'Утверждено' : 'Ожидает'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-1">
                  Причина: <span className="text-white">{report.reason}</span>
                </p>
                <p className="text-sm text-gray-400">
                  Дата: {format(new Date(report.report_date), 'dd.MM.yyyy')}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Списал: {disposedByUser ? disposedByUser.full_name : 'Неизвестно'}
                </p>
                {report.approved_by && (
                  <p className="text-sm text-gray-500">
                    Утвердил: {approvedByUser ? approvedByUser.full_name : 'Неизвестно'}
                  </p>
                )}
                
                {/* Only show approval button to admins and only for non-approved reports */}
                {canApproveWriteoffs && !report.approved_by_user && (
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <Button 
                      onClick={() => approveReport(report.id)}
                      variant="success"
                      size="sm"
                    >
                      Утвердить списание
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AnimatedSection>
  )
}
