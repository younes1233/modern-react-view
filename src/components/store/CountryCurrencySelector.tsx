import { useState, useEffect } from 'react';
import { ChevronDown, Globe, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useStoreCountries } from '@/hooks/useStoreCountries';
import { useCountryCurrency } from '@/contexts/CountryCurrencyContext';

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

interface CountryCurrencySelectorProps {
  variant?: 'desktop' | 'mobile';
}

export function CountryCurrencySelector({ variant = 'desktop' }: CountryCurrencySelectorProps) {
  const { countries, loading } = useStoreCountries();
  const { selectedCountry, selectedCurrency, setSelectedCountry, setSelectedCurrency } = useCountryCurrency();
  const [availableCurrencies, setAvailableCurrencies] = useState<SelectedCurrency[]>([]);

  // Set default country and currency on first load
  useEffect(() => {
    if (countries.length > 0 && !selectedCountry) {
      const firstCountry = countries[0];
      const countryData = {
        id: firstCountry.id,
        name: firstCountry.name,
        flag: firstCountry.flag,
        iso_code: firstCountry.iso_code,
      };
      setSelectedCountry(countryData);
      
      // Set base currency for the first country
      const baseCurrency = {
        id: firstCountry.base_currency.id,
        code: firstCountry.base_currency.code,
        name: firstCountry.base_currency.name,
        symbol: firstCountry.base_currency.symbol,
      };
      setSelectedCurrency(baseCurrency);
    }
  }, [countries, selectedCountry, setSelectedCountry, setSelectedCurrency]);

  // Update available currencies when country changes
  useEffect(() => {
    if (selectedCountry && countries.length > 0) {
      const country = countries.find(c => c.id === selectedCountry.id);
      if (country) {
        setAvailableCurrencies(country.currencies.filter(c => c.is_active));
        
        // If no currency selected or current currency not available, set base currency
        if (!selectedCurrency || !country.currencies.find(c => c.id === selectedCurrency.id)) {
          const baseCurrency = {
            id: country.base_currency.id,
            code: country.base_currency.code,
            name: country.base_currency.name,
            symbol: country.base_currency.symbol,
          };
          setSelectedCurrency(baseCurrency);
        }
      }
    }
  }, [selectedCountry, countries, selectedCurrency, setSelectedCurrency]);

  const handleCountryChange = (countryId: string) => {
    const country = countries.find(c => c.id === parseInt(countryId));
    if (country) {
      const countryData = {
        id: country.id,
        name: country.name,
        flag: country.flag,
        iso_code: country.iso_code,
      };
      setSelectedCountry(countryData);
    }
  };

  const handleCurrencyChange = (currencyId: string) => {
    const currency = availableCurrencies.find(c => c.id === parseInt(currencyId));
    if (currency) {
      const currencyData = {
        id: currency.id,
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
      };
      setSelectedCurrency(currencyData);
    }
  };

  if (loading) {
    if (variant === 'mobile') {
      return (
        <div className="lg:hidden flex items-center justify-center gap-3 px-4 py-2">
          <div className="w-[120px] h-8 bg-gray-100 animate-pulse rounded"></div>
          <div className="w-[80px] h-8 bg-gray-100 animate-pulse rounded"></div>
        </div>
      );
    }
    return (
      <div className="hidden lg:flex items-center gap-2 text-sm">
        <div className="w-[140px] h-8 bg-gray-100 animate-pulse rounded"></div>
        <div className="w-[100px] h-8 bg-gray-100 animate-pulse rounded"></div>
      </div>
    );
  }

  if (countries.length === 0) {
    return null;
  }

  // Unified icon-only design for both mobile and desktop
  const containerClass = variant === 'mobile'
    ? "lg:hidden flex items-center justify-center gap-2 px-4 py-2 bg-white border-b border-gray-100"
    : "hidden lg:flex items-center gap-2 text-sm";

  return (
    <div className={containerClass}>
      {/* Country Selector - Icon Only */}
      <Select
        value={selectedCountry?.id.toString() || ''}
        onValueChange={handleCountryChange}
      >
        <SelectTrigger className="w-10 h-8 border-gray-200 bg-white hover:bg-gray-50 transition-colors p-0 justify-center">
          <SelectValue placeholder="🌍">
            {selectedCountry && (
              <span className="text-lg">{selectedCountry.flag}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-[100]">
          {countries.map((country) => (
            <SelectItem
              key={country.id}
              value={country.id.toString()}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span className="text-sm">{country.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Currency Selector - Icon Only */}
      <Select
        value={selectedCurrency?.id.toString() || ''}
        onValueChange={handleCurrencyChange}
        disabled={!selectedCountry || availableCurrencies.length === 0}
      >
        <SelectTrigger className="w-10 h-8 border-gray-200 bg-white hover:bg-gray-50 transition-colors p-0 justify-center">
          <SelectValue placeholder="💰">
            {selectedCurrency && (
              <span className="text-sm font-medium">{selectedCurrency.symbol}</span>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent className="bg-white border border-gray-200 shadow-lg z-[100]">
          {availableCurrencies.map((currency) => (
            <SelectItem
              key={currency.id}
              value={currency.id.toString()}
              className="hover:bg-gray-50 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{currency.code}</span>
                <span className="text-xs text-gray-500">({currency.symbol})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}