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