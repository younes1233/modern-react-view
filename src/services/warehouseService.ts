import BaseApiService, { ApiResponse } from './baseApiService';

/*
 * Service and type definitions for interacting with warehouses via the admin API.
 *
 * This file mirrors the structure of the warehouse service found in the original
 * project. It defines several TypeScript interfaces to describe the shape of
 * warehouse related data returned from the API and exposes a WarehouseService
 * class that wraps the underlying API calls. In addition to the existing
 * CRUD methods, a new helper `getWarehousesByCountry` has been added to
 * retrieve warehouses scoped to a specific country.
 */

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

/**
 * The WarehouseService exposes methods to interact with warehouse resources.
 *
 * Existing methods cover basic CRUD operations on the warehouses collection. The
 * new `getWarehousesByCountry` method complements these by returning
 * warehouses filtered by a specific country. It accepts a country ID and
 * constructs the appropriate admin API endpoint.
 */
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

  async deleteWarehouse(id: number): Promise<ApiResponse<{}>> {
    return this.delete<ApiResponse<{}>>(`/admin/warehouses/${id}`);
  }

  /**
   * Fetch warehouses for a specific country. The country ID is passed as a
   * parameter and will be interpolated into the URL. The API response
   * contains a `country` object and a list of `warehouses` scoped to that
   * country. When using this method you should access `response.details
   * .warehouses` to retrieve the array.
   *
   * @param countryId ID of the country whose warehouses should be returned
   */
  async getWarehousesByCountry(countryId: number): Promise<ApiResponse<{ country: Country; warehouses: Warehouse[] }>> {
    return this.get<ApiResponse<{ country: Country; warehouses: Warehouse[] }>>(`/admin/countries/${countryId}/warehouses`);
  }
}

export const warehouseService = new WarehouseService();