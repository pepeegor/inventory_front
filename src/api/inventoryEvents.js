import axios from './axiosClient'

export const fetchInventoryEvents = (params) => axios.get('/inventory-events', { params })
export const fetchInventoryEvent = (id) => axios.get(`/inventory-events/${id}`)
export const createInventoryEvent = (data) => axios.post('/inventory-events', data)
export const updateInventoryEvent = (id, data) => axios.put(`/inventory-events/${id}`, data)
export const deleteInventoryEvent = (id) => axios.delete(`/inventory-events/${id}`)
export const addInventoryItem = (eventId, data) =>
  axios.post(`/inventory-events/${eventId}/items`, data)
export const updateInventoryItem = (itemId, data) =>
  axios.put(`/inventory-items/${itemId}`, data)
export const deleteInventoryItem = (itemId) =>
  axios.delete(`/inventory-items/${itemId}`)