import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Loader from '../ui/Loader'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Show loader while checking auth
  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#121212]">
        <Loader />
      </div>
    )
  }

  // If not authenticated, redirect to HomePage
  if (!user) {
    return <Navigate to="/home" state={{ from: location }} replace />
  }

  // If authenticated, show the outlet (child routes)
  return <Outlet />
} 