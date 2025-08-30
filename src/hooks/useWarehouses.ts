import { useState, useEffect } from 'react';
import {
  warehouseService,
  Warehouse,
  CreateWarehouseRequest,
  UpdateWarehouseRequest,
} from '../services/warehouseService';
import { useToast } from '@/hooks/use-toast';

/**
 * A hook that manages the lifecycle of warehouse data within the UI. It can
 * optionally take a `countryId` parameter to fetch warehouses scoped to
 * a particular country. If no countryId is provided, all warehouses are
 * returned. The returned object contains the current list of warehouses,
 * loading and error states, as well as helpers for create, update and
 * delete operations.
 */
export const useWarehouses = (countryId?: number | string) => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      // If a countryId is provided, fetch warehouses scoped to that country
      if (countryId) {
        const id = typeof countryId === 'string' ? parseInt(countryId, 10) : countryId;
        response = await warehouseService.getWarehousesByCountry(id);
      } else {
        response = await warehouseService.getWarehouses();
      }

      if (!response.error && response.details) {
        // The admin API returns { country, warehouses } for country-specific queries
        const details: any = response.details;
        const list = details.warehouses ?? details.warehouses;
        setWarehouses(list || []);
      } else {
        setError(response.message || 'Failed to load warehouses');
        setWarehouses([]);
      }
    } catch (err) {
      console.error('Error fetching warehouses:', err);
      setError('Failed to load warehouses');
      setWarehouses([]);
    } finally {
      setLoading(false);
    }
  };

  const createWarehouse = async (warehouseData: {
    name: string;
    country_id: number;
    location: string;
    zone_structure_id?: number;
    code: string;
  }) => {
    try {
      const requestData: CreateWarehouseRequest = {
        name: warehouseData.name.trim(),
        country_id: warehouseData.country_id,
        location: warehouseData.location.trim(),
        code: warehouseData.code.trim().toUpperCase(),
        ...(warehouseData.zone_structure_id && { zone_structure_id: warehouseData.zone_structure_id }),
      };

      const response = await warehouseService.createWarehouse(requestData);

      if (!response.error && response.details?.warehouse) {
        setWarehouses([...warehouses, response.details.warehouse]);
        toast({
          title: 'Success',
          description: 'Warehouse created successfully',
        });
        return response.details.warehouse;
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to create warehouse',
          variant: 'destructive',
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error creating warehouse:', error);
      throw error;
    }
  };

  const updateWarehouse = async (id: number, warehouseData: {
    name: string;
    country_id: number;
    location: string;
    zone_structure_id?: number;
    code: string;
  }) => {
    try {
      const requestData: UpdateWarehouseRequest = {
        name: warehouseData.name.trim(),
        country_id: warehouseData.country_id,
        location: warehouseData.location.trim(),
        code: warehouseData.code.trim().toUpperCase(),
        ...(warehouseData.zone_structure_id && { zone_structure_id: warehouseData.zone_structure_id }),
      };

      const response = await warehouseService.updateWarehouse(id, requestData);

      if (!response.error && response.details?.warehouse) {
        setWarehouses(
          warehouses.map((warehouse) => (warehouse.id === id ? response.details!.warehouse : warehouse))
        );
        toast({
          title: 'Success',
          description: 'Warehouse updated successfully',
        });
        return response.details.warehouse;
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to update warehouse',
          variant: 'destructive',
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating warehouse:', error);
      throw error;
    }
  };

  const deleteWarehouse = async (id: number) => {
    try {
      const response = await warehouseService.deleteWarehouse(id);

      if (!response.error) {
        setWarehouses(warehouses.filter((warehouse) => warehouse.id !== id));
        toast({
          title: 'Success',
          description: 'Warehouse deleted successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: response.message || 'Failed to delete warehouse',
          variant: 'destructive',
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  };

  // Refetch when the selected country changes
  useEffect(() => {
    fetchWarehouses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countryId]);

  return {
    warehouses,
    loading,
    error,
    refetch: fetchWarehouses,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
  };
};