import axiosClient from './axiosClient';

// API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

// Get data center activity metrics
export const getDataCenterActivity = async () => {
  try {
    const response = await axiosClient.get('/stats/datacenter-activity');
    return response.data;
  } catch (error) {
    console.error('Error fetching data center activity:', error);
    return {
      // Fallback data if API fails
      timestamps: Array(24).fill(0).map((_, i) => new Date(Date.now() - (23-i) * 3600000).toISOString()),
      values: Array(24).fill(0).map(() => Math.floor(20 + Math.random() * 60))
    };
  }
};

export const fetchDeviceLifecycle = (months = 12) =>
  axiosClient.get('/stats/device-lifecycle', { params: { months } }).then(res => res.data);

export const fetchReliabilityMap = () =>
  axiosClient.get('/stats/reliability-map').then(res => res.data);

export const fetchMaintenanceEfficiency = (months = 12) =>
  axiosClient.get('/stats/maintenance-efficiency', { params: { months } }).then(res => res.data);

export const fetchFailureAnalysis = () =>
  axiosClient.get('/stats/failure-analysis').then(res => res.data); 