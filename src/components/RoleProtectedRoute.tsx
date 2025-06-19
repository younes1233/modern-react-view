
import { useRoleAuth } from '@/contexts/RoleAuthContext';
import { Navigate } from 'react-router-dom';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  redirectTo?: string;
}

export function RoleProtectedRoute({ 
  children, 
  allowedRoles = [], 
  redirectTo = '/role-login' 
}: RoleProtectedRouteProps) {
  const { user, isLoading } = useRoleAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Check if user role is allowed
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Customers should only access store routes
  if (user.role === 'customer' && !window.location.pathname.startsWith('/store')) {
    return <Navigate to="/store" replace />;
  }

  return <>{children}</>;
}
