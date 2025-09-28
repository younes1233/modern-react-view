
import BaseApiService, { ApiResponse } from './baseApiService';

interface AuthResponse {
  error: boolean;
  message: string;
  details: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      phone: string;
      avatar: string | null;
      role: string;
      permissions: string[];
      isActive: boolean;
      isEmailVerified: boolean;
      createdAt: string;
      updatedAt: string;
      lastLogin: string;
      sellerId: string | null;
      sellerStatus: string | null;
      orders: any[];
      whishlist: any[];
      cart: any[];
      addresses: any[];
    };
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

interface DashboardAccessResponse {
  error: boolean;
  message: string;
  details: {
    can_access: boolean;
    user_roles: string[];
    user_permissions: string[];
    reason: string;
  };
}

class AuthService extends BaseApiService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    
    if (response.details?.token && !response.error) {
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

  async canAccessDashboard(): Promise<DashboardAccessResponse> {
    return this.get<DashboardAccessResponse>('/auth/can-access-dashboard');
  }
}

// Create and export a singleton instance
export const authService = new AuthService();
export default authService;
