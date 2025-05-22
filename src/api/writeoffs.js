import axiosClient from './axiosClient'

export const fetchWriteOffReports = (params) => {
  return axiosClient.get('/write-off-reports', { params })
}

export const fetchWriteOffReportById = (reportId) => {
  return axiosClient.get(`/write-off-reports/${reportId}`)
}

export const createWriteOffReport = (data) => {
  return axiosClient.post('/write-off-reports', data)
}

export const updateWriteOffReport = (reportId, data) => {
  return axiosClient.put(`/write-off-reports/${reportId}`, data)
}

export const deleteWriteOffReport = (reportId) => {
  return axiosClient.delete(`/write-off-reports/${reportId}`)
}

export const approveWriteOffReport = (reportId) => {
  return axiosClient.post(`/write-off-reports/${reportId}/approve`)
}
