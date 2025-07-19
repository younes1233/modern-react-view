
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

interface ApiResponse<T> {
  error: boolean;
  message: string;
  details: T;
}

class BaseApiService {
  protected baseURL = 'https://meemhome.com/api';
  private token: string | null = null;
  private apiSecret = 'qpBRMrOphIamxNVLNyzsHCCQGTBmLV33';
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add token to requests if available
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error);
        console.error('API Error Response:', error.response);
        return Promise.reject(error);
      }
    );
  }

  private async request<T>(method: string, endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.request<T>({
        method,
        url: endpoint,
        data,
        ...config,
      });
      return response.data;
    } catch (error: any) {
      console.error(`API request failed for ${method} ${endpoint}:`, error);
      throw error;
    }
  }

  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  protected async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, data, config);
  }

  protected async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, data, config);
  }

  protected async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, config);
  }

  protected async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, config);
  }

  // Token management methods
  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  removeToken(): void {
    localStorage.removeItem('authToken');
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }
}

export default BaseApiService;
export type { ApiResponse };
