import axios from './axiosClient'

export const getAllInventoryEvents = async (params = {}) => {
  const { data } = await axios.get('/inventory-events/', { params })
  return data
}

export const getInventoryEvent = async (eventId) => {
  const { data } = await axios.get(`/inventory-events/${eventId}`)
  return data
}

export const createInventoryEvent = async (eventData) => {
  const { data } = await axios.post('/inventory-events/', eventData)
  return data
}

export const updateInventoryEvent = async (eventId, eventData) => {
  const { data } = await axios.put(`/inventory-events/${eventId}`, eventData)
  return data
}

export const deleteInventoryEvent = async (eventId) => {
  await axios.delete(`/inventory-events/${eventId}`)
}

export const createInventoryItem = async (eventId, itemData) => {
  const { data } = await axios.post(`/inventory-events/${eventId}/items`, itemData)
  return data
}

export const updateInventoryItem = async (itemId, itemData) => {
  const { data } = await axios.put(`/inventory-items/${itemId}`, itemData)
  return data
}

export const deleteInventoryItem = async (itemId) => {
  await axios.delete(`/inventory-items/${itemId}`)
}

export const getFailureRecords = async (eventId) => {
  const { data } = await axios.get(`/inventory-events/${eventId}/failure-records`)
  return data
}

export const createFailureRecord = async (recordData) => {
  const { data } = await axios.post('/failure-records', recordData)
  return data
}

export const updateFailureRecord = async (recordId, recordData) => {
  const { data } = await axios.put(`/failure-records/${recordId}`, recordData)
  return data
}

export const deleteFailureRecord = async (recordId) => {
  await axios.delete(`/failure-records/${recordId}`)
}