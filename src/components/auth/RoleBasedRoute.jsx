import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function RoleBasedRoute({ 
  children, 
  requiredRole = null
}) {
  const { user } = useAuth();
  
  // Anyone can access
  if (!requiredRole) return children;
  
  // Role-specific access
  if (requiredRole === 'admin' && user?.role === 'admin') {
    return children;
  }
  
  // Unauthorized, redirect to login
  return <Navigate to="/login" replace />;
} 