import axiosClient from './axiosClient'

export const getAllDeviceTypes = async (params = {}) => {
  const response = await axiosClient.get('/device-types/', { params })
  return response.data
}

export const getDeviceTypeById = async (id) => {
  const response = await axiosClient.get(`/device-types/${id}`)
  return response.data
}

export const createDeviceType = async (data) => {
  const response = await axiosClient.post('/device-types/', data)
  return response.data
}

export const updateDeviceType = async (id, data) => {
  const response = await axiosClient.put(`/device-types/${id}`, data)
  return response.data
}

export const deleteDeviceType = async (id) => {
  await axiosClient.delete(`/device-types/${id}`)
}
