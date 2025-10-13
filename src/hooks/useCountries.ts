import { useState, useEffect } from 'react';
import { countryService, Country, CreateCountryRequest, UpdateCountryRequest } from '../services/countryService';
import { toast } from '@/components/ui/sonner';

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await countryService.getCountries();
      
      if (!response.error && response.details?.countries) {
        setCountries(response.details.countries);
      } else {
        setError(response.message || 'Failed to load countries');
        setCountries([]);
      }
    } catch (err) {
      console.error('Error fetching countries:', err);
      setError('Failed to load countries');
      setCountries([]);
    } finally {
      setLoading(false);
    }
  };

  const createCountry = async (countryData: {
    name: string;
    flag?: string;
    iso_code: string;
    default_vat_percentage: string;
    base_currency_id?: number;
    currencies?: number[];
  }) => {
    try {
      const requestData: CreateCountryRequest = {
        name: countryData.name.trim(),
        flag: countryData.flag || getFlagEmoji(countryData.iso_code),
        iso_code: countryData.iso_code.trim().toUpperCase(),
        base_currency_id: countryData.base_currency_id || 1,
        default_vat_percentage: parseFloat(countryData.default_vat_percentage) || 0,
        currencies: countryData.currencies || [countryData.base_currency_id || 1],
      };

      console.log('Creating country with data:', requestData);

      const response = await countryService.createCountry(requestData);
      
      if (!response.error && response.details?.country) {
        setCountries([...countries, response.details.country]);
        toast.success("Country created successfully", { duration: 2000 });
        return response.details.country;
      } else {
        toast.error(response.message || "Failed to create country", { duration: 2500 });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error creating country:', error);
      throw error;
    }
  };

  const updateCountry = async (id: number, countryData: {
    name: string;
    flag?: string;
    iso_code: string;
    default_vat_percentage: string;
    base_currency_id?: number;
    currencies?: string[] | number[];
  }) => {
    try {
      // Convert currencies to number array as required by the API
      const currenciesAsNumbers = countryData.currencies?.map(c => 
        typeof c === 'string' ? parseInt(c) : c
      ) || [1];

      const requestData: UpdateCountryRequest = {
        name: countryData.name.trim(),
        flag: countryData.flag || getFlagEmoji(countryData.iso_code), // Required field
        iso_code: countryData.iso_code.trim().toUpperCase(),
        base_currency_id: countryData.base_currency_id || 1,
        default_vat_percentage: parseFloat(countryData.default_vat_percentage) || 0,
        currencies: currenciesAsNumbers, // Must be array of integers
      };

      console.log('Updating country with data:', requestData);

      const response = await countryService.updateCountry(id, requestData);
      
      if (!response.error && response.details?.country) {
        setCountries(countries.map(country =>
          country.id === id ? response.details!.country : country
        ));
        toast.success("Country updated successfully", { duration: 2000 });
        return response.details.country;
      } else {
        toast.error(response.message || "Failed to update country", { duration: 2500 });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating country:', error);
      throw error;
    }
  };

  const deleteCountry = async (id: number) => {
    try {
      const response = await countryService.deleteCountry(id);
      
      if (!response.error) {
        setCountries(countries.filter(country => country.id !== id));
        toast.success("Country deleted successfully", { duration: 2000 });
      } else {
        toast.error(response.message || "Failed to delete country", { duration: 2500 });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting country:', error);
      throw error;
    }
  };

  const getCountry = async (id: number) => {
    try {
      const response = await countryService.getCountry(id);
      
      if (!response.error && response.details?.country) {
        return response.details.country;
      } else {
        throw new Error(response.message || 'Failed to fetch country');
      }
    } catch (error) {
      console.error('Error fetching country:', error);
      throw error;
    }
  };

  const getFlagEmoji = (isoCode: string) => {
    const flagMap: Record<string, string> = {
      'US': '🇺🇸',
      'GB': '🇬🇧', 
      'DE': '🇩🇪',
      'CA': '🇨🇦',
      'FR': '🇫🇷',
      'AU': '🇦🇺',
      'JP': '🇯🇵',
      'CN': '🇨🇳',
      'IN': '🇮🇳',
      'LB': '🇱🇧',
      'SY': '🇸🇾',
    };
    return flagMap[isoCode] || '🌍';
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  return {
    countries,
    loading,
    error,
    refetch: fetchCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    getCountry,
  };
};
