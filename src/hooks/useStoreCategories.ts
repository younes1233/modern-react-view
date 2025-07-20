import { useState, useEffect } from 'react';
import { categoryService, Category } from '../services/categoryService';

export const useStoreCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoryService.getStoreCategories();
      
      if (!response.error && response.details?.categories) {
        setCategories(response.details.categories);
      } else {
        setError(response.message || 'Failed to load categories');
        setCategories([]);
      }
    } catch (err) {
      console.error('Error fetching store categories:', err);
      setError('Failed to load categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};