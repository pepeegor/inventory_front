import axios from 'axios'
import { toast } from 'react-toastify'

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add in error handling that provides feedback about permission issues
axiosClient.interceptors.response.use(
  response => response,
  error => {
    // Handle auth errors (401)
    if (error.response?.status === 401) {
      // If we're not already on the login page
      if (window.location.pathname !== '/login') {
        localStorage.setItem('redirectPath', window.location.pathname)
      }
    }
    
    // Handle permission errors (403)
    if (error.response?.status === 403) {
      toast.error("У вас нет прав для выполнения этого действия");
    }
    
    return Promise.reject(error)
  }
)

export default axiosClient