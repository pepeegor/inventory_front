import axiosClient from './axiosClient'

export const getAllDevices = async (params = {}) => {
  const response = await axiosClient.get('/devices/', { params })
  return response.data
}

export const getDeviceById = async (id) => {
  const response = await axiosClient.get(`/devices/${id}`)
  return response.data
}

export const createDevice = async (data) => {
  const response = await axiosClient.post('/devices/', data)
  return response.data
}

export const updateDevice = async (id, data) => {
  const response = await axiosClient.put(`/devices/${id}`, data)
  return response.data
}

export const deleteDevice = async (id) => {
  await axiosClient.delete(`/devices/${id}`)
}
