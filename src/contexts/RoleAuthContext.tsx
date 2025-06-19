
import React, { createContext, useContext, useState, useEffect } from 'react';
import { demoUsers, User, rolePermissions } from '@/data/users';

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
    // Check if user is logged in on mount
    const savedUser = localStorage.getItem('roleUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      // Verify user still exists in demo data
      const currentUser = demoUsers.find(u => u.id === userData.id);
      if (currentUser) {
        setUser(currentUser);
      } else {
        localStorage.removeItem('roleUser');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Demo authentication - find user by email
    const foundUser = demoUsers.find(u => u.email === email && u.isActive);
    
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('roleUser', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('roleUser');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    const userPermissions = rolePermissions[user.role];
    
    // Super admin has all permissions
    if (userPermissions.includes('*')) return true;
    
    return userPermissions.includes(permission);
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
