
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
  default_vat_percentage: string;
  base_currency: Currency;
  currencies: Currency[];
}

export interface CountriesResponse {
  countries: Country[];
}

export interface CountryResponse {
  country: Country;
}

export interface CreateCountryRequest {
  name: string;
  flag: string;
  iso_code: string;
  base_currency_id: number;
  default_vat_percentage: number;
  currencies: number[];
}

export interface UpdateCountryRequest {
  name?: string;
  flag: string; // Required for updates
  iso_code?: string;
  base_currency_id?: number;
  default_vat_percentage?: number;
  currencies?: number[]; // Should be array of integers, not strings
}

class CountryService extends BaseApiService {
  async getCountries(): Promise<ApiResponse<CountriesResponse>> {
    return this.get<ApiResponse<CountriesResponse>>('/admin/countries');
  }

  async getCountry(id: number): Promise<ApiResponse<CountryResponse>> {
    return this.get<ApiResponse<CountryResponse>>(`/admin/countries/${id}`);
  }

  async createCountry(data: CreateCountryRequest): Promise<ApiResponse<CountryResponse>> {
    return this.post<ApiResponse<CountryResponse>>('/admin/countries', data);
  }

  async updateCountry(id: number, data: UpdateCountryRequest): Promise<ApiResponse<CountryResponse>> {
    return this.put<ApiResponse<CountryResponse>>(`/admin/countries/${id}`, data);
  }

  async deleteCountry(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/admin/countries/${id}`);
  }
}

export const countryService = new CountryService();
