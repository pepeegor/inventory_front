import axiosClient from './axiosClient'

export const getAllLocations = async () => {
  const response = await axiosClient.get('/locations/')
  return response.data
}

export const getLocationById = async (id) => {
  const response = await axiosClient.get(`/locations/${id}`)
  return response.data
}

export const createLocation = async (data) => {
  const response = await axiosClient.post('/locations/', data)
  return response.data
}

export const updateLocation = async (id, data) => {
  const response = await axiosClient.put(`/locations/${id}`, data)
  return response.data
}

export const deleteLocation = async (id) => {
  await axiosClient.delete(`/locations/${id}`)
}
