import { useAuth } from './useAuth';

export function useRoleBasedAccess() {
  const { user } = useAuth();
  
  const isAdmin = user?.role === 'admin';
  
  // Permission-specific checks
  const canAccessAnalytics = isAdmin;
  const canApproveWriteoffs = isAdmin;
  const canManageUsers = isAdmin;
  
  // Feature flags based on permissions
  const features = {
    analytics: canAccessAnalytics,
    approveWriteoffs: canApproveWriteoffs,
    manageUsers: canManageUsers,
    // Regular features available to all users
    inventory: true,
    maintenance: true,
    failures: true,
    writeoffs: true,
    replacements: true,
    profile: true,
  };
  
  return { isAdmin, features };
} 