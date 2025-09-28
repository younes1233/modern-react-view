
import { useRoleAuth } from '@/contexts/RoleAuthContext';
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/authService';
import { useQuery } from '@tanstack/react-query';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function RoleProtectedRoute({
  children,
  redirectTo = '/role-login'
}: RoleProtectedRouteProps) {
  const { user, isLoading } = useRoleAuth();

  // Always check dashboard access from backend
  const { data: dashboardAccess, isLoading: isDashboardLoading, error } = useQuery({
    queryKey: ['dashboard-access'],
    queryFn: () => authService.canAccessDashboard(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Debug logging
  console.log('RoleProtectedRoute Debug:', {
    user,
    isLoading,
    isDashboardLoading,
    dashboardAccess,
    error,
    userRole: user?.role,
    canAccess: dashboardAccess?.details?.can_access
  });

  if (isLoading || isDashboardLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to login');
    return <Navigate to={redirectTo} replace />;
  }

  // Handle query error
  if (error) {
    console.error('Dashboard access query error:', error);
    return <Navigate to="/unauthorized" replace />;
  }

  // Use backend endpoint to check dashboard access
  if (!dashboardAccess?.details?.can_access) {
    console.log('Dashboard access denied:', {
      dashboardAccess,
      reason: dashboardAccess?.details?.reason,
      userRoles: dashboardAccess?.details?.user_roles
    });
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Dashboard access granted for user:', user.role);

  return <>{children}</>;
}
