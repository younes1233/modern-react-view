import BaseApiService, { ApiResponse } from './baseApiService';

export interface StoreCountry {
  id: number;
  name: string;
  flag: string;
  iso_code: string;
  default_vat_percentage: number;
  base_currency: {
    id: number;
    code: string;
    name: string;
    symbol: string;
    is_active: number;
  };
  currencies: {
    id: number;
    code: string;
    name: string;
    symbol: string;
    is_active: number;
  }[];
}

export interface StoreCountriesResponse {
  data: StoreCountry[];
  meta: {
    current_page: string;
    per_page: string;
    total: string;
    last_page: string;
  };
}

class StoreCountryService extends BaseApiService {
  async getCountries(): Promise<StoreCountriesResponse> {
    return this.get<StoreCountriesResponse>('/countries');
  }
}

export const storeCountryService = new StoreCountryService();