import { useState, useEffect } from 'react';
import { countryService, Country, CreateCountryRequest, UpdateCountryRequest } from '../services/countryService';
import { useToast } from '@/hooks/use-toast';

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
        toast({
          title: "Success",
          description: "Country created successfully",
        });
        return response.details.country;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create country",
          variant: "destructive",
        });
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
        toast({
          title: "Success",
          description: "Country updated successfully",
        });
        return response.details.country;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update country",
          variant: "destructive",
        });
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
        toast({
          title: "Success",
          description: "Country deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete country",
          variant: "destructive",
        });
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
