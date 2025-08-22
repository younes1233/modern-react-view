
import { useState, useEffect } from 'react';
import { warehouseService, Warehouse, CreateWarehouseRequest, UpdateWarehouseRequest } from '../services/warehouseService';
import { useToast } from '@/hooks/use-toast';

export const useWarehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching warehouses...');
      const response = await warehouseService.getWarehouses();
      console.log('Warehouses API response:', response);
      
      if (!response.error && response.details?.warehouses) {
        setWarehouses(response.details.warehouses);
        console.log('Warehouses set successfully:', response.details.warehouses);
      } else {
        console.error('Failed to fetch warehouses:', response.message);
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

      console.log('Creating warehouse with data:', requestData);

      const response = await warehouseService.createWarehouse(requestData);
      
      if (!response.error && response.details?.warehouse) {
        setWarehouses([...warehouses, response.details.warehouse]);
        toast({
          title: "Success",
          description: "Warehouse created successfully",
        });
        return response.details.warehouse;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create warehouse",
          variant: "destructive",
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

      console.log('Updating warehouse with data:', requestData);

      const response = await warehouseService.updateWarehouse(id, requestData);
      
      if (!response.error && response.details?.warehouse) {
        setWarehouses(warehouses.map(warehouse => 
          warehouse.id === id ? response.details!.warehouse : warehouse
        ));
        toast({
          title: "Success",
          description: "Warehouse updated successfully",
        });
        return response.details.warehouse;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update warehouse",
          variant: "destructive",
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
        setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
        toast({
          title: "Success",
          description: "Warehouse deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete warehouse",
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

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
