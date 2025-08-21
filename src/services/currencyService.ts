
import BaseApiService, { ApiResponse } from './baseApiService';

export interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
}

export interface CurrenciesResponse {
  currencies: Currency[];
}

export interface CurrencyResponse {
  currency: Currency;
}

export interface CreateCurrencyRequest {
  code: string;
  name: string;
  symbol: string;
  is_active: boolean;
}

export interface UpdateCurrencyRequest {
  name?: string;
  symbol?: string;
  is_active?: boolean;
}

class CurrencyService extends BaseApiService {
  async getCurrencies(): Promise<ApiResponse<CurrenciesResponse>> {
    return this.get<ApiResponse<CurrenciesResponse>>('/admin/currencies');
  }

  async getCurrency(id: number): Promise<ApiResponse<CurrencyResponse>> {
    return this.get<ApiResponse<CurrencyResponse>>(`/admin/currencies/${id}`);
  }

  async createCurrency(data: CreateCurrencyRequest): Promise<ApiResponse<CurrencyResponse>> {
    return this.post<ApiResponse<CurrencyResponse>>('/admin/currencies', data);
  }

  async updateCurrency(id: number, data: UpdateCurrencyRequest): Promise<ApiResponse<CurrencyResponse>> {
    return this.put<ApiResponse<CurrencyResponse>>(`/admin/currencies/${id}`, data);
  }

  async deleteCurrency(id: number): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/admin/currencies/${id}`);
  }
}

export const currencyService = new CurrencyService();
