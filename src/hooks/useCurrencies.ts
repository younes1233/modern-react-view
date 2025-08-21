
import { useState, useEffect } from 'react';
import { currencyService, Currency, CreateCurrencyRequest, UpdateCurrencyRequest } from '../services/currencyService';
import { useToast } from '@/hooks/use-toast';

export const useCurrencies = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCurrencies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await currencyService.getCurrencies();
      
      if (!response.error && response.details?.currencies) {
        setCurrencies(response.details.currencies);
      } else {
        setError(response.message || 'Failed to load currencies');
        setCurrencies([]);
      }
    } catch (err) {
      console.error('Error fetching currencies:', err);
      setError('Failed to load currencies');
      setCurrencies([]);
    } finally {
      setLoading(false);
    }
  };

  const createCurrency = async (currencyData: {
    code: string;
    name: string;
    symbol: string;
    is_active: boolean;
  }) => {
    try {
      const requestData: CreateCurrencyRequest = {
        code: currencyData.code.trim().toUpperCase(),
        name: currencyData.name.trim(),
        symbol: currencyData.symbol.trim(),
        is_active: currencyData.is_active,
      };

      console.log('Creating currency with data:', requestData);

      const response = await currencyService.createCurrency(requestData);
      
      if (!response.error && response.details?.currency) {
        setCurrencies([...currencies, response.details.currency]);
        toast({
          title: "Success",
          description: "Currency created successfully",
        });
        return response.details.currency;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create currency",
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error creating currency:', error);
      throw error;
    }
  };

  const updateCurrency = async (id: number, currencyData: {
    name?: string;
    symbol?: string;
    is_active?: boolean;
  }) => {
    try {
      const requestData: UpdateCurrencyRequest = {};
      
      if (currencyData.name !== undefined) {
        requestData.name = currencyData.name.trim();
      }
      if (currencyData.symbol !== undefined) {
        requestData.symbol = currencyData.symbol.trim();
      }
      if (currencyData.is_active !== undefined) {
        requestData.is_active = currencyData.is_active;
      }

      console.log('Updating currency with data:', requestData);

      const response = await currencyService.updateCurrency(id, requestData);
      
      if (!response.error && response.details?.currency) {
        setCurrencies(currencies.map(currency => 
          currency.id === id ? response.details!.currency : currency
        ));
        toast({
          title: "Success",
          description: "Currency updated successfully",
        });
        return response.details.currency;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update currency",
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating currency:', error);
      throw error;
    }
  };

  const deleteCurrency = async (id: number) => {
    try {
      const response = await currencyService.deleteCurrency(id);
      
      if (!response.error) {
        setCurrencies(currencies.filter(currency => currency.id !== id));
        toast({
          title: "Success",
          description: "Currency deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete currency",
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting currency:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  return {
    currencies,
    loading,
    error,
    refetch: fetchCurrencies,
    createCurrency,
    updateCurrency,
    deleteCurrency,
  };
};
