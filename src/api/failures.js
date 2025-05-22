import axiosClient from './axiosClient'

export const fetchFailuresByDeviceId = (deviceId) => {
  return axiosClient.get(`/devices/${deviceId}/failures`)
}

export const fetchFailuresByPartTypeId = (partTypeId) => {
  return axiosClient.get(`/part-types/${partTypeId}/failures`)
}

export const createFailureRecord = (data) => {
  return axiosClient.post('/failure-records', data)
}

export const updateFailureRecord = (failureId, data) => {
  return axiosClient.put(`/failure-records/${failureId}`, data)
}

export const deleteFailureRecord = (failureId) => {
  return axiosClient.delete(`/failure-records/${failureId}`)
}

export function getFailuresByDeviceId(deviceId) {
  return axiosClient
    .get(`/devices/${deviceId}/failures`)
    .then(res => res.data)
}