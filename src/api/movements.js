import axios from './axiosClient'

export const fetchMovementsByDevice = (deviceId) =>
  axios.get(`/devices/${deviceId}/movements`)
export const createMovement = (deviceId, data) =>
  axios.post(`/devices/${deviceId}/movements`, data)