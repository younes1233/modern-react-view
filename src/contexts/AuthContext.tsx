
import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  [key: string]: any; // Allow for additional user properties from API
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    name: string,
    email: string,
    phone: string,
    password: string,
    passwordConfirmation: string,
    referralToken?: string
  ) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
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
          // If token exists, you might want to validate it with the server
          // For now, we'll just check if token exists
          // You can add a /auth/me endpoint later to get current user
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
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
      
      if (!response.error && response.user && response.token) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
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
    name: string,
    email: string,
    phone: string,
    password: string,
    passwordConfirmation: string,
    referralToken?: string
  ): Promise<{ success: boolean; message: string }> => {
    setIsLoading(true);
    
    try {
      const response = await apiService.register(
        name,
        email,
        phone,
        password,
        passwordConfirmation,
        referralToken
      );
      
      if (!response.error && response.user && response.token) {
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
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

  const logout = () => {
    setUser(null);
    apiService.removeToken();
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>
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
