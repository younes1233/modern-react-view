
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

interface User {
  id: string;
  email: string;
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

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await authService.login(email, password);
      
      if (!response.error && response.details?.user && response.details?.token) {
        const apiUser = response.details.user;
        
        const transformedUser: User = {
          id: apiUser.id,
          email: apiUser.email,
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
    }
  };

  useEffect(() => {
    // Check if user is logged in on mount
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
  }, []);

  return {
    user,
    login,
    logout,
    isLoading,
  };
};
