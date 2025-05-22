import axiosClient from './axiosClient'

export const fetchMaintenanceTasks = (params = {}) => {
  return axiosClient.get('/maintenance-tasks', { params })
}

export const fetchMaintenanceTaskById = (taskId) => {
  return axiosClient.get(`/maintenance-tasks/${taskId}`)
}

export const createMaintenanceTask = (data) => {
  return axiosClient.post('/maintenance-tasks', data)
}

export const updateMaintenanceTask = (taskId, data) => {
  return axiosClient.put(`/maintenance-tasks/${taskId}`, data)
}

export const deleteMaintenanceTask = (taskId) => {
  return axiosClient.delete(`/maintenance-tasks/${taskId}`)
}
