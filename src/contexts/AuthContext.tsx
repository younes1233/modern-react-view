import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiService } from '@/services/apiService';
import { Country } from '@/services/countryService';
import { Warehouse } from '@/services/warehouseService';

/**
 * User represents the authenticated user returned from the backend.
 * This interface mirrors the existing one from the original project.
 * Additional properties can be added here to match your API response.
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
  isSeller: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  sellerId?: string;
  sellerStatus?: string;
  addresses?: any[];
  [key: string]: any;
}

/**
 * The localization object groups the three location‑specific fields together.  
 * Storing them as one object allows atomic updates and easier persistence.
 */
interface Localization {
  country: Country | null;
  store: string | null;
  warehouse: Warehouse | null;
}

/**
 * AuthContextType defines everything that will be exposed from the context.  
 * In addition to the user authentication actions, we include the
 * localization fields (country, store and warehouse) and setter
 * functions for each.  These allow any component in the admin
 * application to read and update the current localization selections.
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

/**
 * Safely parse a JSON value from localStorage.  If parsing fails or
 * the value is invalid, `null` is returned.  This helper prevents
 * runtime crashes due to malformed JSON in storage.
 */
function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // ensure we only return objects (not strings or numbers)
    return parsed && typeof parsed === 'object' ? (parsed as T) : null;
  } catch {
    return null;
  }
}

/**
 * AuthProvider encapsulates authentication and localization state.  It
 * initializes state from localStorage, persists changes back to
 * localStorage, and wraps asynchronous auth actions (login, register,
 * etc.) to update local state as needed.  Localization fields are
 * stored together in a single object to prevent partial writes and
 * racing updates.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // user information and loading flag
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // hydrate localization from localStorage
  const [localization, setLocalization] = useState<Localization>(() => {
    const saved = safeParse<Localization>(localStorage.getItem('localization'));
    return saved ?? { country: null, store: null, warehouse: null };
  });

  // persist localization whenever it changes
  useEffect(() => {
    localStorage.setItem('localization', JSON.stringify(localization));
  }, [localization]);

  // initial auth check on mount
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const token = apiService.getToken();
        if (token) {
          const response = await apiService.getMe();
          if (!response.error && response.details?.user) {
            setUser(response.details.user);
            // optionally store user in localStorage as the original code did
            localStorage.setItem('user', JSON.stringify(response.details.user));
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

  // authentication actions
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      if (!response.error && response.details?.user && response.details?.token) {
        setUser({ ...response.details.user, isSeller: (response.details.user as any).isSeller || false });
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
        setUser({ ...response.details.user, isSeller: (response.details.user as any).isSeller || false });
        localStorage.setItem('user', JSON.stringify(response.details.user));
        apiService.setToken(response.details.token);
        return { success: true, message: response.message };
      }
      return { success: false, message: response.message };
    } catch (error: any) {
      console.error('Registration failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
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
      // Redirect based on current location
      const isDashboard = window.location.pathname.startsWith('/dashboard');
      window.location.href = isDashboard ? '/role-login' : '/store';
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

  // localization setters update only the relevant field while preserving others
  const setCountry = (country: Country | null) => {
    setLocalization((prev) => ({ ...prev, country }));
  };

  const setStore = (store: string | null) => {
    setLocalization((prev) => ({ ...prev, store }));
  };

  const setWarehouse = (warehouse: Warehouse | null) => {
    setLocalization((prev) => ({ ...prev, warehouse }));
  };

  // memoize the context value to avoid unnecessary re-renders
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      login,
      register,
      logout,
      forgotPassword,
      verifyOtp,
      resetPassword,
      isLoading,
      country: localization.country,
      store: localization.store,
      warehouse: localization.warehouse,
      setCountry,
      setStore,
      setWarehouse,
    }),
    [user, isLoading, localization]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth returns the current authentication context.  If used outside
 * of an AuthProvider, it returns null (rather than throwing) to allow
 * pages that don’t require auth to render.
 */
export function useAuth(): AuthContextType | null {
  const context = useContext(AuthContext);
  if (context === undefined) {
    return null;
  }
  return context;
}