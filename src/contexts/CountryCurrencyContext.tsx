import React from 'react';
import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { userSettingsService } from '@/services/userSettingsService';
import { useAuth } from '@/contexts/AuthContext';
import { geoDetectionService } from '@/services/geoDetectionService';
import { countryService } from '@/services/countryService';

interface SelectedCountry {
  id: number;
  name: string;
  flag: string;
  iso_code: string;
  base_currency?: SelectedCurrency; // Include base currency for easy access
}

interface SelectedCurrency {
  id: number;
  code: string;
  name: string;
  symbol: string;
}

// Default country configuration (Lebanon)
const DEFAULT_COUNTRY_ISO = 'LB'; // Lebanon ISO code
const STORAGE_KEY_COUNTRY = 'selectedCountry';
const STORAGE_KEY_CURRENCY = 'selectedCurrency';
const STORAGE_KEY_GEO_DETECTED = 'geoDetectionCompleted';

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
  // Initialize from localStorage synchronously to avoid flash of wrong currency
  const [selectedCountry, setSelectedCountryState] = useState<SelectedCountry | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_COUNTRY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // IMPORTANT: Clear if it has L.L currency (old stale data)
        if (parsed?.base_currency?.symbol === 'L.L' || parsed?.base_currency?.code === 'LBP') {
          console.log('Clearing stale country data with L.L currency');
          localStorage.removeItem(STORAGE_KEY_COUNTRY);
          localStorage.removeItem(STORAGE_KEY_CURRENCY);
          localStorage.removeItem(STORAGE_KEY_GEO_DETECTED); // Force re-detection
          return null;
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [selectedCurrency, setSelectedCurrencyState] = useState<SelectedCurrency | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CURRENCY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // IMPORTANT: Clear if it's L.L (old stale data)
        if (parsed?.symbol === 'L.L' || parsed?.code === 'LBP') {
          console.log('Clearing stale currency data with L.L');
          localStorage.removeItem(STORAGE_KEY_CURRENCY);
          return null;
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch all countries from backend
  const fetchCountries = useCallback(async () => {
    try {
      const response = await countryService.getCountries();
      if (response.error === false && response.details?.countries) {
        return response.details.countries;
      }
      return [];
    } catch (error) {
      console.error('Error fetching countries:', error);
      return [];
    }
  }, []);

  // Load preferences with geo-detection and fallback logic
  const loadPreferences = useCallback(async () => {
    setIsLoading(true);
    let countryToSet: SelectedCountry | null = null;
    let currencyToSet: SelectedCurrency | null = null;

    try {
      // NOTE: We intentionally skip user.preferences from database because:
      // 1. Backend always sends prices in country's base currency
      // 2. Old user preferences might have wrong currency (e.g., L.L instead of $)
      // 3. localStorage + country base_currency is the source of truth

      // Priority 1: Load from localStorage (for guests and authenticated users)
      const savedCountry = localStorage.getItem(STORAGE_KEY_COUNTRY);
      if (savedCountry) {
        try {
          const parsedCountry = JSON.parse(savedCountry);

          // Fetch latest country data to ensure base_currency is up-to-date
          const countries = await fetchCountries();
          const freshCountry = countries.find(c => c.id === parsedCountry.id);

          if (freshCountry) {
            countryToSet = {
              id: freshCountry.id,
              name: freshCountry.name,
              flag: freshCountry.flag,
              iso_code: freshCountry.iso_code,
              base_currency: freshCountry.base_currency
            };
            console.log('Loaded country from localStorage and refreshed base_currency:', countryToSet.name);
          } else {
            // If country no longer exists, keep the parsed version but it will be validated later
            countryToSet = parsedCountry;
            console.log('Loaded country from localStorage (no refresh available):', countryToSet?.name);
          }
        } catch (e) {
          console.error('Error parsing saved country:', e);
        }
      }

      // Priority 2: Geo-detection (only if not already done and no saved preference)
      if (!countryToSet && !localStorage.getItem(STORAGE_KEY_GEO_DETECTED)) {
        console.log('No saved country found, attempting geo-detection...');

        const detectedIsoCode = await geoDetectionService.detectCountry();
        localStorage.setItem(STORAGE_KEY_GEO_DETECTED, 'true'); // Mark detection as attempted

        if (detectedIsoCode) {
          console.log('Geo-detected country:', detectedIsoCode);

          // Fetch all countries to find the matching one
          const countries = await fetchCountries();
          const matchedCountry = countries.find(
            c => c.iso_code?.toUpperCase() === detectedIsoCode.toUpperCase()
          );

          if (matchedCountry) {
            countryToSet = {
              id: matchedCountry.id,
              name: matchedCountry.name,
              flag: matchedCountry.flag,
              iso_code: matchedCountry.iso_code,
              base_currency: matchedCountry.base_currency
            };
            console.log('Matched country from geo-detection:', countryToSet.name);
          }
        }
      }

      // Priority 3: Fallback to default country (Lebanon)
      if (!countryToSet) {
        console.log('No country found, falling back to default (Lebanon)...');
        const countries = await fetchCountries();
        const defaultCountry = countries.find(
          c => c.iso_code?.toUpperCase() === DEFAULT_COUNTRY_ISO
        );

        if (defaultCountry) {
          countryToSet = {
            id: defaultCountry.id,
            name: defaultCountry.name,
            flag: defaultCountry.flag,
            iso_code: defaultCountry.iso_code,
            base_currency: defaultCountry.base_currency
          };
          console.log('Using default country:', countryToSet.name);
        } else {
          // Ultimate fallback: use first available country
          const firstCountry = countries[0];
          if (firstCountry) {
            countryToSet = {
              id: firstCountry.id,
              name: firstCountry.name,
              flag: firstCountry.flag,
              iso_code: firstCountry.iso_code,
              base_currency: firstCountry.base_currency
            };
            console.log('Using first available country:', countryToSet.name);
          }
        }
      }

      // Set currency to country's base currency (always)
      if (countryToSet?.base_currency) {
        currencyToSet = countryToSet.base_currency;
        console.log('Using country base currency:', currencyToSet.code);
      }

      // Apply the selections
      if (countryToSet) {
        setSelectedCountryState(countryToSet);
        localStorage.setItem(STORAGE_KEY_COUNTRY, JSON.stringify(countryToSet));
      }

      if (currencyToSet) {
        setSelectedCurrencyState(currencyToSet);
        localStorage.setItem(STORAGE_KEY_CURRENCY, JSON.stringify(currencyToSet));
      }

    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, fetchCountries]);

  // Load preferences when user changes
  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

  const setSelectedCountry = useCallback(async (country: SelectedCountry | null) => {
    setSelectedCountryState(country);

    // Automatically set currency to country's base currency
    if (country?.base_currency) {
      setSelectedCurrencyState(country.base_currency);
      localStorage.setItem(STORAGE_KEY_CURRENCY, JSON.stringify(country.base_currency));
      console.log('Auto-set currency to country base currency:', country.base_currency.code);

      // Sync currency to database if authenticated
      if (user) {
        try {
          await userSettingsService.setUserSetting('preferred_currency', country.base_currency);
        } catch (error) {
          console.error('Error syncing currency to database:', error);
        }
      }
    }

    // Update localStorage
    if (country) {
      localStorage.setItem(STORAGE_KEY_COUNTRY, JSON.stringify(country));
    } else {
      localStorage.removeItem(STORAGE_KEY_COUNTRY);
    }

    // Sync country to database if authenticated
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
    // Note: Currency should always match the country's base currency
    // This function is kept for compatibility but will log a warning
    console.warn('Direct currency changes are discouraged. Currency should match country base currency.');

    setSelectedCurrencyState(currency);

    // Update localStorage
    if (currency) {
      localStorage.setItem(STORAGE_KEY_CURRENCY, JSON.stringify(currency));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENCY);
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