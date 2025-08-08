
import { useState, useEffect } from 'react';
import { countryService, Country } from '../services/countryService';
import { useToast } from '@/components/ui/use-toast';

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

  const createCountry = async (countryData: Partial<Country>) => {
    try {
      const response = await countryService.createCountry(countryData);
      
      if (!response.error && response.details) {
        setCountries([...countries, response.details]);
        toast({
          title: "Success",
          description: "Country created successfully",
        });
        return response.details;
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

  const updateCountry = async (id: number, countryData: Partial<Country>) => {
    try {
      const response = await countryService.updateCountry(id, countryData);
      
      if (!response.error && response.details) {
        setCountries(countries.map(country => 
          country.id === id ? response.details! : country
        ));
        toast({
          title: "Success",
          description: "Country updated successfully",
        });
        return response.details;
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
  };
};
