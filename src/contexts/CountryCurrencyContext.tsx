import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { userSettingsService } from '@/services/userSettingsService';
import { useAuth } from '@/hooks/useAuth';

interface SelectedCountry {
  id: number;
  name: string;
  flag: string;
  iso_code: string;
}

interface SelectedCurrency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

interface CountryCurrencyContextType {
  selectedCountry: SelectedCountry | null;
  selectedCurrency: SelectedCurrency | null;
  setSelectedCountry: (country: SelectedCountry | null) => Promise<void>;
  setSelectedCurrency: (currency: SelectedCurrency | null) => Promise<void>;
  isLoading: boolean;
}

const CountryCurrencyContext = createContext<CountryCurrencyContextType | undefined>(undefined);

export function useCountryCurrency() {
  const context = useContext(CountryCurrencyContext);
  if (context === undefined) {
    throw new Error('useCountryCurrency must be used within a CountryCurrencyProvider');
  }
  return context;
}

interface CountryCurrencyProviderProps {
  children: ReactNode;
}

export function CountryCurrencyProvider({ children }: CountryCurrencyProviderProps) {
  const [selectedCountry, setSelectedCountryState] = useState<SelectedCountry | null>(null);
  const [selectedCurrency, setSelectedCurrencyState] = useState<SelectedCurrency | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load preferences from user object or localStorage
  const loadPreferences = useCallback(() => {
    // If user is logged in and has preferences in their profile, use those
    if (user?.preferences) {
      if (user.preferences.country) {
        setSelectedCountryState(user.preferences.country);
        localStorage.setItem('selectedCountry', JSON.stringify(user.preferences.country));
      }
      if (user.preferences.currency) {
        setSelectedCurrencyState(user.preferences.currency);
        localStorage.setItem('selectedCurrency', JSON.stringify(user.preferences.currency));
      }
    } else {
      // Otherwise, load from localStorage (for guests or if DB has no data)
      const savedCountry = localStorage.getItem('selectedCountry');
      const savedCurrency = localStorage.getItem('selectedCurrency');

      if (savedCountry) {
        try {
          setSelectedCountryState(JSON.parse(savedCountry));
        } catch (e) {
          console.error('Error parsing saved country:', e);
        }
      }

      if (savedCurrency) {
        try {
          setSelectedCurrencyState(JSON.parse(savedCurrency));
        } catch (e) {
          console.error('Error parsing saved currency:', e);
        }
      }
    }
  }, [user]);

  // Load preferences when user changes
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const setSelectedCountry = useCallback(async (country: SelectedCountry | null) => {
    setSelectedCountryState(country);

    // Update localStorage
    if (country) {
      localStorage.setItem('selectedCountry', JSON.stringify(country));
    } else {
      localStorage.removeItem('selectedCountry');
    }

    // Sync to database if authenticated
    if (user) {
      try {
        setIsLoading(true);
        if (country) {
          await userSettingsService.setUserSetting('preferred_country', country);
        } else {
          await userSettingsService.deleteUserSetting('preferred_country').catch(() => {});
        }
      } catch (error) {
        console.error('Error syncing country to database:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  const setSelectedCurrency = useCallback(async (currency: SelectedCurrency | null) => {
    setSelectedCurrencyState(currency);

    // Update localStorage
    if (currency) {
      localStorage.setItem('selectedCurrency', JSON.stringify(currency));
    } else {
      localStorage.removeItem('selectedCurrency');
    }

    // Sync to database if authenticated
    if (user) {
      try {
        setIsLoading(true);
        if (currency) {
          await userSettingsService.setUserSetting('preferred_currency', currency);
        } else {
          await userSettingsService.deleteUserSetting('preferred_currency').catch(() => {});
        }
      } catch (error) {
        console.error('Error syncing currency to database:', error);
      } finally {
        setIsLoading(false);
      }
    }
  }, [user]);

  const contextValue = useMemo(() => ({
    selectedCountry,
    selectedCurrency,
    setSelectedCountry,
    setSelectedCurrency,
    isLoading,
  }), [selectedCountry, selectedCurrency, setSelectedCountry, setSelectedCurrency, isLoading]);

  return (
    <CountryCurrencyContext.Provider value={contextValue}>
      {children}
    </CountryCurrencyContext.Provider>
  );
}