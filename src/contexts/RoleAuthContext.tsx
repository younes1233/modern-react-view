import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '@/services/authService';

interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  avatar: string | null;
  role: string;
  permissions: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  sellerId: string | null;
  sellerStatus: string | null;
}

interface RoleAuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  hasPermission: (permission: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}

const RoleAuthContext = createContext<RoleAuthContextType | undefined>(undefined);

export function RoleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount - use same 'user' key as AuthContext
    const token = authService.getToken();
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
        authService.removeToken();
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authService.login(email, password);
      
      if (!response.error && response.details?.user && response.details?.token) {
        const apiUser = response.details.user;
        
        // Transform API user to our User interface
        const transformedUser: User = {
          id: apiUser.id,
          email: apiUser.email,
          name: `${apiUser.firstName} ${apiUser.lastName}`,
          firstName: apiUser.firstName,
          lastName: apiUser.lastName,
          phone: apiUser.phone,
          avatar: apiUser.avatar,
          role: apiUser.role,
          permissions: apiUser.permissions,
          isActive: apiUser.isActive,
          isEmailVerified: apiUser.isEmailVerified,
          createdAt: apiUser.createdAt,
          updatedAt: apiUser.updatedAt,
          lastLogin: apiUser.lastLogin,
          sellerId: apiUser.sellerId,
          sellerStatus: apiUser.sellerStatus,
        };
        
        setUser(transformedUser);
        localStorage.setItem('user', JSON.stringify(transformedUser));
        setIsLoading(false);
        return true;
      }
      
      setIsLoading(false);
      return false;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      authService.removeToken();
      // Redirect to store home page after logout
      window.location.href = '/store';
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.permissions.includes('*') || user.role === 'super_admin') return true;
    
    return user.permissions.includes(permission);
  };

  const canAccess = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    const permission = `${resource}:${action}`;
    return hasPermission(permission);
  };

  return (
    <RoleAuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      hasPermission, 
      canAccess 
    }}>
      {children}
    </RoleAuthContext.Provider>
  );
}

export function useRoleAuth() {
  const context = useContext(RoleAuthContext);
  if (context === undefined) {
    throw new Error('useRoleAuth must be used within a RoleAuthProvider');
  }
  return context;
}
