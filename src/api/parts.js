import axiosClient from './axiosClient'

export const fetchPartTypes = () => {
  return axiosClient.get('/part-types')
}

export const fetchPartTypeById = (partTypeId) => {
  return axiosClient.get(`/part-types/${partTypeId}`)
}

export const createPartType = (data) => {
  return axiosClient.post('/part-types', data)
}

export const updatePartType = (partTypeId, data) => {
  return axiosClient.put(`/part-types/${partTypeId}`, data)
}

export const deletePartType = (partTypeId) => {
  return axiosClient.delete(`/part-types/${partTypeId}`)
}
