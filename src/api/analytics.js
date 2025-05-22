import axios from './axios'

export function getFailureStats(partTypeId, filters = {}) {
  return axios
    .get(`/analytics/part-types/${partTypeId}/failure-stats`, { params: filters })
    .then(res => res.data)
}


export function getForecastReplacement(partTypeId) {
  return axios
    .get(`/analytics/part-types/${partTypeId}/forecast-replacement`)
    .then(res => res.data)
}
