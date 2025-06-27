interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  details?: T;
}

interface AuthResponse {
  error: boolean;
  message: string;
  details: {
    user: any;
    token: string;
  };
}

interface LogoutResponse {
  error: boolean;
  message: string;
}

interface ForgotPasswordResponse {
  error: boolean;
  message: string;
  details?: {
    waiting_period_secondes?: number;
  };
}

interface VerifyOtpResponse {
  error: boolean;
  message: string;
  details?: {};
}

interface ResetPasswordResponse {
  error: boolean;
  message: string;
  details: {
    user: any;
  };
}

interface RefreshTokenResponse {
  error: boolean;
  message: string;
  details: {
    token: string;
  };
}

interface BannerResponse {
  error: boolean;
  message: string;
  details: {
    banners: BannerAPIData[];
  };
}

interface BannerCreateResponse {
  error: boolean;
  message: string;
  details: {
    banner: BannerAPIData;
  };
}

interface BannerAPIData {
  id: number;
  title: string;
  subtitle?: string;
  image: string;
  alt?: string;
  cta_text?: string;
  cta_link?: string;
  position: 'hero' | 'secondary' | 'sidebar';
  is_active: boolean;
  order: number;
}

class ApiService {
  private baseURL = 'https://meemhome.com/api';
  private token: string | null = null;
  private apiSecret = 'qpBRMrOphIamxNVLNyzsHCCQGTBmLV33';

  constructor() {
    // Get token from localStorage on initialization
    this.token = localStorage.getItem('auth_token');
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Remove authentication token
  removeToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-API-SECRET': this.apiSecret,
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }

  // Banner API methods
  async getBanners(): Promise<BannerResponse> {
    return this.get<BannerResponse>('/banners');
  }

  async createBanner(bannerData: {
    title: string;
    subtitle?: string;
    image: string;
    alt?: string;
    cta_text?: string;
    cta_link?: string;
    position: 'hero' | 'secondary' | 'sidebar';
    is_active?: boolean;
  }): Promise<BannerCreateResponse> {
    return this.post<BannerCreateResponse>('/banners', bannerData);
  }

  async updateBanner(
    id: number,
    bannerData: Partial<{
      title: string;
      subtitle: string;
      image: string;
      alt: string;
      cta_text: string;
      cta_link: string;
      position: 'hero' | 'secondary' | 'sidebar';
      is_active: boolean;
    }>
  ): Promise<BannerCreateResponse> {
    return this.put<BannerCreateResponse>(`/banners/${id}`, bannerData);
  }

  async deleteBanner(id: number): Promise<BannerResponse> {
    return this.delete<BannerResponse>(`/banners/${id}`);
  }

  async reorderBanners(bannerIds: number[]): Promise<BannerResponse> {
    return this.put<BannerResponse>('/banners/reorder', bannerIds);
  }

  // Authentication methods
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    if (response.details?.token) {
      this.setToken(response.details.token);
    }
    
    return response;
  }

  async register(
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    password: string,
    passwordConfirmation: string,
    gender: string,
    dateOfBirth?: string
  ): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/register', {
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      password,
      password_confirmation: passwordConfirmation,
      gender,
      ...(dateOfBirth && { date_of_birth: dateOfBirth }),
    });
    
    if (response.details?.token) {
      this.setToken(response.details.token);
    }
    
    return response;
  }

  async logout(): Promise<LogoutResponse> {
    const response = await this.post<LogoutResponse>('/auth/logout');
    this.removeToken();
    return response;
  }

  async forgotPassword(email: string): Promise<ForgotPasswordResponse> {
    return this.post<ForgotPasswordResponse>('/auth/forgot-password', {
      email,
    });
  }

  async verifyOtp(email: string, otp: number): Promise<VerifyOtpResponse> {
    return this.post<VerifyOtpResponse>('/auth/verify-otp', {
      email,
      otp,
    });
  }

  async resetPassword(
    email: string,
    password: string,
    passwordConfirmation: string
  ): Promise<ResetPasswordResponse> {
    return this.post<ResetPasswordResponse>('/auth/reset-password', {
      email,
      password,
      password_confirmation: passwordConfirmation,
    });
  }

  async getMe(): Promise<ApiResponse<{ user: any }>> {
    return this.get<ApiResponse<{ user: any }>>('/auth/me');
  }

  async refreshToken(): Promise<RefreshTokenResponse> {
    const response = await this.post<RefreshTokenResponse>('/auth/refresh');
    if (response.details?.token) {
      this.setToken(response.details.token);
    }
    return response;
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
