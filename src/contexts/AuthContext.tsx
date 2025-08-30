import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '@/services/apiService';
import { Country } from '@/services/countryService';
import { Warehouse } from '@/services/warehouseService';

/**
 * User represents the authenticated user returned from the backend. The
 * existing interface has been preserved from the original code. Extra
 * properties can be added here to match your API response.
 */
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

/**
 * AuthContextType defines everything that will be exposed from the context.
 * In addition to the user authentication actions, we now include
 * localization fields (country, store and warehouse) and setter functions
 * for each. These allow any component in the admin application to read
 * and update the current localization selections.
 */
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
  /**
   * The currently selected country. Null if no selection has been made.
   */
  country: Country | null;
  /**
   * The currently selected store identifier or name. A string is used
   * because the repository did not expose a storeService. If you have
   * explicit store types, replace this with your own interface.
   */
  store: string | null;
  /**
   * The currently selected warehouse. Null if no selection has been made.
   */
  warehouse: Warehouse | null;
  /**
   * Update the selected country.
   */
  setCountry: (country: Country | null) => void;
  /**
   * Update the selected store.
   */
  setStore: (store: string | null) => void;
  /**
   * Update the selected warehouse.
   */
  setWarehouse: (warehouse: Warehouse | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Localization state. These values are persisted in localStorage so that
  // the user’s selection survives page reloads. See the useEffect hooks
  // below for persistence logic.
  const [country, setCountry] = useState<Country | null>(null);
  const [store, setStore] = useState<string | null>(null);
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);

  /**
   * Load the persisted localization values on mount. If there is no saved
   * localization information, the defaults will remain null.
   */
  useEffect(() => {
    const saved = localStorage.getItem('localization');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.country) setCountry(parsed.country);
        if (parsed.store) setStore(parsed.store);
        if (parsed.warehouse) setWarehouse(parsed.warehouse);
      } catch (err) {
        console.error('Failed to parse saved localization:', err);
      }
    }
  }, []);

  /**
   * Persist localization changes whenever any of the fields change. This
   * ensures that the selections are restored when the user returns to the
   * application later.
   */
  useEffect(() => {
    const toSave = JSON.stringify({ country, store, warehouse });
    localStorage.setItem('localization', toSave);
  }, [country, store, warehouse]);

  // Initialize authentication on mount. Check for a stored token and
  // validate it with the server. If valid, set the user. Otherwise remove
  // the token and any persisted user data. Note: error handling is minimal
  // here and can be expanded based on your API response structure.
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const token = apiService.getToken();
        if (token) {
          const response = await apiService.getMe();
          if (!response.error && response.details?.user) {
            setUser(response.details.user);
          } else {
            apiService.removeToken();
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        apiService.removeToken();
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  // Auth actions. These methods wrap the apiService and update local state
  // accordingly. They mirror the existing implementations in the original
  // project and have been kept intact. Additional error handling or
  // side-effects can be added as required.
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      if (!response.error && response.details?.user && response.details?.token) {
        setUser(response.details.user);
        localStorage.setItem('user', JSON.stringify(response.details.user));
        apiService.setToken(response.details.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
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
        apiService.setToken(response.details.token);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return { success: false, message: error instanceof Error ? error.message : 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('user');
      apiService.removeToken();
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<{ success: boolean; message: string; waitingPeriod?: number }> => {
    try {
      const response = await apiService.forgotPassword(email);
      return {
        success: !response.error,
        message: response.message,
        waitingPeriod: response.details?.waiting_period_secondes,
      };
    } catch (error) {
      console.error('Forgot password failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to send OTP',
      };
    }
  };

  const verifyOtp = async (email: string, otp: number): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await apiService.verifyOtp(email, otp);
      return {
        success: !response.error,
        message: response.message,
      };
    } catch (error) {
      console.error('OTP verification failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'OTP verification failed',
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
        message: response.message,
      };
    } catch (error) {
      console.error('Password reset failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Password reset failed',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        forgotPassword,
        verifyOtp,
        resetPassword,
        isLoading,
        country,
        store,
        warehouse,
        setCountry,
        setStore,
        setWarehouse,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * useAuth returns the current authentication context. If you attempt to use
 * this hook outside of an AuthProvider, it will return null (rather than
 * throwing) to allow store pages that don’t require auth to render.
 */
export function useAuth(): AuthContextType | null {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return null;
  }
  return context;
}