
import BaseApiService, { ApiResponse } from './baseApiService';

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_active: number;
}

export interface Country {
  id: number;
  name: string;
  flag: string;
  iso_code: string;
  default_vat_percentage: number;
  base_currency: Currency;
  currencies: Currency[];
}

export interface ZoneStructure {
  id: number;
  name: string;
  version: string;
}

export interface Shelf {
  id: number;
  warehouse_id: number;
  warehouse_zone_id: number;
  code: string;
  name: string;
  created_at: string;
}

export interface Zone {
  id: number;
  code: string;
  name: string;
  type: string;
  depth: number;
  children: Zone[];
  shelves: Shelf[];
}

export interface Warehouse {
  id: number;
  name: string;
  location: string;
  code: string;
  has_zone_structure: boolean;
  zone_structure?: ZoneStructure;
  products_count: string;
  created_at: string;
  updated_at: string;
  zone_count: string;
  shelf_count: string;
  zones: Zone[];
  shelves: Shelf[];
  country: Country;
}

export interface WarehousesResponse {
  warehouses: Warehouse[];
}

export interface WarehouseResponse {
  warehouse: Warehouse;
}

export interface CreateWarehouseRequest {
  name: string;
  country_id: number;
  location: string;
  zone_structure_id?: number;
  code: string;
}

export interface UpdateWarehouseRequest {
  name?: string;
  country_id?: number;
  location?: string;
  zone_structure_id?: number;
  code?: string;
}

class WarehouseService extends BaseApiService {
  async getWarehouses(): Promise<ApiResponse<WarehousesResponse>> {
    return this.get<ApiResponse<WarehousesResponse>>('/admin/warehouses/');
  }

  async createWarehouse(data: CreateWarehouseRequest): Promise<ApiResponse<WarehouseResponse>> {
    return this.post<ApiResponse<WarehouseResponse>>('/admin/warehouses', data);
  }

  async updateWarehouse(id: number, data: UpdateWarehouseRequest): Promise<ApiResponse<WarehouseResponse>> {
    return this.put<ApiResponse<WarehouseResponse>>(`/admin/warehouses/${id}`, data);
  }

  async deleteWarehouse(id: number): Promise<ApiResponse> {
    return this.delete<ApiResponse>(`/admin/warehouses/${id}`);
  }
}

export const warehouseService = new WarehouseService();
