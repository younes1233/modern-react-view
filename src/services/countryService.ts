
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
  iso_code: string;
  default_vat_percentage: string;
  base_currency: Currency;
  currencies: Currency[];
}

export interface CountriesResponse {
  countries: Country[];
}

class CountryService extends BaseApiService {
  async getCountries(): Promise<ApiResponse<CountriesResponse>> {
    return this.get<ApiResponse<CountriesResponse>>('/countries');
  }

  async getCountry(id: number): Promise<ApiResponse<Country>> {
    return this.get<ApiResponse<Country>>(`/countries/${id}`);
  }

  async createCountry(data: Partial<Country>): Promise<ApiResponse<Country>> {
    return this.post<ApiResponse<Country>>('/countries', data);
  }

  async updateCountry(id: number, data: Partial<Country>): Promise<ApiResponse<Country>> {
    return this.put<ApiResponse<Country>>(`/countries/${id}`, data);
  }

  async deleteCountry(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/countries/${id}`);
  }
}

export const countryService = new CountryService();
