import { useAuth } from './useAuth'

export function usePermissions() {
  const { user } = useAuth()
  
  return {
    isAdmin: user?.role === 'admin',
    isLoggedIn: !!user,
    user
  }
} 