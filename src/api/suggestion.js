import axiosClient from './axiosClient'

export const fetchSuggestions = (params) => {
  return axiosClient.get('/replacement-suggestions', { params })
}

export const fetchSuggestionsByPartType = (partTypeId) => {
  return axiosClient.get(`/part-types/${partTypeId}/replacement-suggestions`)
}

export const createSuggestion = (data) => {
  return axiosClient.post('/replacement-suggestions', data)
}

export const updateSuggestion = (suggestionId, data) => {
  return axiosClient.put(`/replacement-suggestions/${suggestionId}`, data)
}

export const deleteSuggestion = (suggestionId) => {
  return axiosClient.delete(`/replacement-suggestions/${suggestionId}`)
}
