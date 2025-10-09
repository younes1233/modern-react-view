import BaseApiService from './baseApiService';
import { Country } from './countryService';
import { Warehouse } from './warehouseService';

export interface DashboardBootstrapData {
  countries: Country[];
  warehouses: Warehouse[];
  selected_country_id: number | null;
  settings: {
    preferred_country?: any;
    preferred_currency?: any;
  };
  user: {
    country: any;
    currency: any;
  };
}

export interface DashboardBootstrapResponse {
  error: boolean;
  message: string;
  details: DashboardBootstrapData;
}

class DashboardService extends BaseApiService {
  /**
   * Get all dashboard initialization data in a single request
   * Replaces multiple API calls (countries, warehouses, settings)
   */
  async bootstrap(): Promise<DashboardBootstrapResponse> {
    return this.get<DashboardBootstrapResponse>('/auth/dashboard/bootstrap');
  }

  /**
   * Clear dashboard cache after settings change
   */
  async clearCache(): Promise<{ error: boolean; message: string }> {
    return this.post('/auth/dashboard/clear-cache', {});
  }
}

export const dashboardService = new DashboardService();
