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

export function CountryCurrencySelector() {
  const { countries, loading } = useStoreCountries();
  const [selectedCountry, setSelectedCountry] = useState<SelectedCountry | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<SelectedCurrency | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<SelectedCurrency[]>([]);

  

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
          localStorage.setItem('selectedCurrency', JSON.stringify(baseCurrency));
        }
      }
    }
  }, [selectedCountry, countries, selectedCurrency]);

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
      localStorage.setItem('selectedCountry', JSON.stringify(countryData));
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
      localStorage.setItem('selectedCurrency', JSON.stringify(currencyData));
    }
  };

  if (loading) {
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

  return (
    <div className="hidden lg:flex items-center gap-2 text-sm">
      {/* Country Selector */}
      <Select
        value={selectedCountry?.id.toString() || ''}
        onValueChange={handleCountryChange}
      >
        <SelectTrigger className="w-[140px] h-8 border-gray-200 bg-white hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-gray-500" />
            <SelectValue placeholder="Country">
              {selectedCountry && (
                <div className="flex items-center gap-1">
                  <span className="text-lg">{selectedCountry.flag}</span>
                  <span className="text-xs text-gray-600 truncate">
                    {selectedCountry.name.substring(0, 8)}
                  </span>
                </div>
              )}
            </SelectValue>
          </div>
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

      {/* Currency Selector */}
      <Select
        value={selectedCurrency?.id.toString() || ''}
        onValueChange={handleCurrencyChange}
        disabled={!selectedCountry || availableCurrencies.length === 0}
      >
        <SelectTrigger className="w-[100px] h-8 border-gray-200 bg-white hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-2">
            <DollarSign className="w-3 h-3 text-gray-500" />
            <SelectValue placeholder="Currency">
              {selectedCurrency && (
                <span className="text-xs text-gray-600 font-medium">
                  {selectedCurrency.code}
                </span>
              )}
            </SelectValue>
          </div>
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