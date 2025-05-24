import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AuthContext from './AuthContext'
import { getUserProfile, loginUser, logoutUser } from '../api/auth'
import { toast } from 'react-toastify'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    setLoading(true)
    try {
      const userData = await getUserProfile()
      setUser(userData)
    } catch {
      setUser(null)
      
      // Redirect to login if not on login or register page
      const publicPaths = ['/login', '/register', '/home', '/']
      if (!publicPaths.includes(location.pathname)) {
        navigate('/home', { replace: true })
      }
    } finally {
      setLoading(false)
    }
  }, [navigate, location.pathname])

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  // Login function
  const login = async (email, password) => {
    setLoading(true)
    try {
      const userData = await loginUser(email, password)
      setUser(userData)
      toast.success('Успешный вход в систему')
      
      // Redirect to dashboard or intended page
      const from = location.state?.from?.pathname || '/'
      navigate(from, { replace: true })
      return userData
    } catch (error) {
      const message = error.response?.data?.detail || 'Ошибка входа'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      await logoutUser()
      toast.info('Вы вышли из системы')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setUser(null)
      navigate('/login', { replace: true })
    }
  }

  // Update user information
  const updateUserInfo = (newInfo) => {
    setUser(current => ({
      ...current,
      ...newInfo
    }))
  }

  // Auth context value
  const value = {
    user,
    loading,
    login,
    logout,
    updateUserInfo,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 