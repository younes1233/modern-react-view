/**
 * Type definitions and service methods for interacting with shelves via the admin API.
 *
 * The Shelves API allows you to fetch shelves scoped to a specific warehouse.
 * This service wraps the underlying fetch call and returns the API response
 * as an object with the same structure as other admin endpoints.
 */

export interface Shelf {
  id: number;
  warehouse_id: number;
  warehouse_zone_id: number;
  code: string;
  name: string;
  created_at: string;
}

/**
 * The shape of the data returned in the `details` property of the admin API
 * when fetching shelves for a given warehouse.
 */
export interface ShelvesDetails {
  shelves: Shelf[];
}

/**
 * Generic API response wrapper used by admin endpoints.
 */
export interface ApiResponse<T> {
  error: boolean;
  message?: string;
  details?: T;
}

/**
 * ShelfService exposes methods to retrieve shelves associated with a warehouse.
 * Unlike the WarehouseService, this service does not extend a BaseApiService
 * because that class is not present in this repository. Instead it performs
 * a simple fetch call to the admin endpoint and returns the parsed JSON.
 */
class ShelfService {
  /**
   * Fetch all shelves for a particular warehouse.
   *
   * @param warehouseId The ID of the warehouse whose shelves should be returned.
   */
  async getShelvesByWarehouse(
    warehouseId: number
  ): Promise<ApiResponse<ShelvesDetails>> {
    const response = await fetch(`/admin/warehouses/${warehouseId}/shelves`);
    const data = (await response.json()) as ApiResponse<ShelvesDetails>;
    return data;
  }
}

/**
 * A singleton instance of the ShelfService. Consumers should use this
 * instance rather than instantiating ShelfService directly.
 */
export const shelfService = new ShelfService();