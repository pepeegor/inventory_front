import axiosClient from './axiosClient'

export const fetchForecastReplacement = async () => {
  const { data } = await axiosClient.get('/analytics/forecast')
  return data
}

export const fetchSummary = async () => {
  const { data } = await axiosClient.get('/analytics/summary')
  return data
}

export const fetchSummaryXlsx = async () => {
  // Получаем файл как blob
  const response = await axiosClient.get('/analytics/summary-xlsx', { responseType: 'blob' })
  return response.data
}
