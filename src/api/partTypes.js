import axiosClient from './axiosClient'

export const getAllPartTypes = async () => {
  const response = await axiosClient.get('/part-types/')
  return response.data
}

export const getPartTypeById = async (id) => {
  const response = await axiosClient.get(`/part-types/${id}`)
  return response.data
}

export const createPartType = async (data) => {
  const response = await axiosClient.post('/part-types/', data)
  return response.data
}

export const updatePartType = async (id, data) => {
  const response = await axiosClient.put(`/part-types/${id}`, data)
  return response.data
}

export const deletePartType = async (id) => {
  await axiosClient.delete(`/part-types/${id}`)
} 