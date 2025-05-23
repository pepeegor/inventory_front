import { useState, useEffect } from 'react';
import { getDataCenterActivity } from '../api/stats';

export const useDataCenterActivity = (refreshInterval = 60000) => {
  const [activityData, setActivityData] = useState({
    timestamps: [],
    values: [],
    loading: true,
    error: null,
    serverStatus: 'online' // 'online', 'warning', 'offline'
  });

  const fetchActivityData = async () => {
    try {
      const data = await getDataCenterActivity();
      
      // Calculate server status based on the latest values
      const latestValues = data.values.slice(-5);
      const avgLoad = latestValues.reduce((sum, val) => sum + val, 0) / latestValues.length;
      
      let serverStatus = 'online';
      if (avgLoad > 80) {
        serverStatus = 'warning';
      } else if (avgLoad > 95) {
        serverStatus = 'offline';
      }
      
      setActivityData({
        timestamps: data.timestamps,
        values: data.values,
        loading: false,
        error: null,
        serverStatus
      });
    } catch (error) {
      setActivityData(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load activity data'
      }));
    }
  };

  useEffect(() => {
    fetchActivityData();
    
    // Set up periodic refresh
    const intervalId = setInterval(fetchActivityData, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  return activityData;
}; 