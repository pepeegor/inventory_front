import axiosClient from './axiosClient'

export const getAllMovements = async (params = {}) => {
  const response = await axiosClient.get('/movements/', { params })
  return response.data
}

export const getDeviceMovements = async (deviceId) => {
  const response = await axiosClient.get(`/devices/${deviceId}/movements/`)
  return response.data
}

export const addDeviceMovement = async (deviceId, movementData) => {
  const response = await axiosClient.post(`/devices/${deviceId}/movements/`, movementData)
  return response.data
} 