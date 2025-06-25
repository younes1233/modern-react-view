
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  avatar?: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  sellerId?: string;
  sellerStatus?: string;
  addresses?: any[];
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    passwordConfirmation: string,
    gender: string,
    dateOfBirth?: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; waitingPeriod?: number }>;
  verifyOtp: (email: string, otp: number) => Promise<{ success: boolean; message: string }>;
  resetPassword: (email: string, password: string, passwordConfirmation: string) => Promise<{ success: boolean; message: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const initializeAuth = async () => {
      setIsLoading(true);
      
      try {
        const token = apiService.getToken();
        if (token) {
          // Validate token with the server
          const response = await apiService.getMe();
          if (!response.error && response.details?.user) {
            setUser(response.details.user);
          } else {
            // Clear invalid token
            apiService.removeToken();
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        // Clear invalid token
        apiService.removeToken();
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.login(email, password);
      
      if (!response.error && response.details?.user && response.details?.token) {
        setUser(response.details.user);
        localStorage.setItem('user', JSON.stringify(response.details.user));
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    passwordConfirmation: string,
    gender: string,
    dateOfBirth?: string
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.register(
        firstName,
        lastName,
        email,
        phone,
        password,
        passwordConfirmation,
        gender,
        dateOfBirth
      );
      
      if (!response.error && response.details?.user && response.details?.token) {
        setUser(response.details.user);
        localStorage.setItem('user', JSON.stringify(response.details.user));
        setIsLoading(false);
        return { success: true, message: response.message };
      } else {
        setIsLoading(false);
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Registration failed:', error);
      setIsLoading(false);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string; waitingPeriod?: number }> => {
    try {
      const response = await apiService.forgotPassword(email);
      return {
        success: !response.error,
        message: response.message,
        waitingPeriod: response.details?.waiting_period_secondes
      };
    } catch (error) {
      console.error('Forgot password failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send OTP'
      };
    }
  };

  const verifyOtp = async (email: string, otp: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.verifyOtp(email, otp);
      return {
        success: !response.error,
        message: response.message
      };
    } catch (error) {
      console.error('OTP verification failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'OTP verification failed'
      };
    }
  };

  const resetPassword = async (
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.resetPassword(email, password, passwordConfirmation);
      return {
        success: !response.error,
        message: response.message
      };
    } catch (error) {
      console.error('Password reset failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed'
      };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      forgotPassword, 
      verifyOtp, 
      resetPassword, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
