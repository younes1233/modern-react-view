import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  setSelectedCountry: (country: SelectedCountry | null) => void;
  setSelectedCurrency: (currency: SelectedCurrency | null) => void;
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
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCountry = localStorage.getItem('selectedCountry');
    const savedCurrency = localStorage.getItem('selectedCurrency');
    
    if (savedCountry) {
      try {
        setSelectedCountry(JSON.parse(savedCountry));
      } catch (e) {
        console.error('Error parsing saved country:', e);
      }
    }
    
    if (savedCurrency) {
      try {
        setSelectedCurrency(JSON.parse(savedCurrency));
      } catch (e) {
        console.error('Error parsing saved currency:', e);
      }
    }
  }, []);

  const handleSetSelectedCountry = (country: SelectedCountry | null) => {
    setSelectedCountry(country);
    if (country) {
      localStorage.setItem('selectedCountry', JSON.stringify(country));
    } else {
      localStorage.removeItem('selectedCountry');
    }
  };

  const handleSetSelectedCurrency = (currency: SelectedCurrency | null) => {
    setSelectedCurrency(currency);
    if (currency) {
      localStorage.setItem('selectedCurrency', JSON.stringify(currency));
    } else {
      localStorage.removeItem('selectedCurrency');
    }
  };

  return (
    <CountryCurrencyContext.Provider
      value={{
        selectedCountry,
        selectedCurrency,
        setSelectedCountry: handleSetSelectedCountry,
        setSelectedCurrency: handleSetSelectedCurrency,
      }}
    >
      {children}
    </CountryCurrencyContext.Provider>
  );
}