import axiosClient from './axiosClient'

export const getAllMaintenanceTasks = async (params = {}) => {
  // Clean up params - remove empty strings and format dates
  const cleanParams = {}
  Object.entries(params).forEach(([key, value]) => {
    // Skip empty strings, but keep 0 values
    if (value === '' || value === undefined || value === null) {
      return
    }
    // Handle date parameters - ensure they are in YYYY-MM-DD format
    if (key === 'scheduled_from' || key === 'scheduled_to' || key === 'scheduled_date' || key === 'completed_date') {
      if (value) {
        const date = new Date(value)
        cleanParams[key] = date.toISOString().split('T')[0]
      }
    } else {
      cleanParams[key] = value
    }
  })

  try {
    const response = await axiosClient.get('/maintenance-tasks/', { params: cleanParams })
    
    if (!response.data) {
      return []
    }
    
    // Ensure we're returning an array
    const tasks = Array.isArray(response.data) ? response.data : [response.data]
    return tasks
  } catch (error) {
    console.error('API Error:', error.response?.data || error.message) // Debug log
    throw error
  }
}

export const getMaintenanceTask = async (taskId) => {
  try {
    const { data } = await axiosClient.get(`/maintenance-tasks/${taskId}`)
    return data
  } catch (error) {
    console.error(`Error fetching task ${taskId}:`, error.response?.data || error.message)
    throw error
  }
}

export const createMaintenanceTask = async (taskData) => {
  // Format dates before sending
  const formattedData = {
    ...taskData,
    status: 'pending', // Default status for new tasks
    scheduled_date: taskData.scheduled_date ? new Date(taskData.scheduled_date).toISOString().split('T')[0] : undefined,
    completed_date: taskData.completed_date ? new Date(taskData.completed_date).toISOString().split('T')[0] : undefined
  }

  try {
    const { data } = await axiosClient.post('/maintenance-tasks/', formattedData)
    return data
  } catch (error) {
    console.error('Error creating task:', error.response?.data || error.message)
    throw error
  }
}

export const updateMaintenanceTask = async (taskId, taskData) => {
  // Format dates before sending
  const formattedData = {
    ...taskData,
    scheduled_date: taskData.scheduled_date ? new Date(taskData.scheduled_date).toISOString().split('T')[0] : undefined,
    completed_date: taskData.completed_date ? new Date(taskData.completed_date).toISOString().split('T')[0] : undefined
  }

  try {
    const { data } = await axiosClient.put(`/maintenance-tasks/${taskId}`, formattedData)
    return data
  } catch (error) {
    console.error(`Error updating task ${taskId}:`, error.response?.data || error.message)
    throw error
  }
}

export const deleteMaintenanceTask = async (taskId) => {
  try {
    await axiosClient.delete(`/maintenance-tasks/${taskId}`)
  } catch (error) {
    console.error(`Error deleting task ${taskId}:`, error.response?.data || error.message)
    throw error
  }
}

export const MAINTENANCE_STATUSES = {
  pending: 'Запланировано',
  in_progress: 'В процессе',
  completed: 'Завершено'
}
