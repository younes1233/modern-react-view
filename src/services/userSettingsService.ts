import BaseApiService, { ApiResponse } from './baseApiService';

export interface UserSetting {
  id: number;
  user_id: number;
  key: string;
  value: any;
  type: string;
  created_at: string;
  updated_at: string;
}

export interface UserSettingsResponse {
  settings: UserSetting[];
}

export interface UserSettingResponse {
  key: string;
  value: any;
}

export interface CreateUserSettingRequest {
  key: string;
  value: any;
}

export interface UpdateUserSettingRequest {
  value: any;
}

class UserSettingsService extends BaseApiService {
  async getUserSettings(): Promise<ApiResponse<UserSettingsResponse>> {
    return this.get<ApiResponse<UserSettingsResponse>>('/auth/user-settings');
  }

  async getUserSetting(key: string): Promise<ApiResponse<UserSettingResponse>> {
    return this.get<ApiResponse<UserSettingResponse>>(`/auth/user-settings/${key}`);
  }

  async createUserSetting(data: CreateUserSettingRequest): Promise<ApiResponse<UserSetting>> {
    return this.post<ApiResponse<UserSetting>>('/auth/user-settings', data);
  }

  async updateUserSetting(key: string, data: UpdateUserSettingRequest): Promise<ApiResponse<UserSetting>> {
    return this.put<ApiResponse<UserSetting>>(`/auth/user-settings/${key}`, data);
  }

  async deleteUserSetting(key: string): Promise<ApiResponse<void>> {
    return this.delete<ApiResponse<void>>(`/auth/user-settings/${key}`);
  }

  async setUserSetting(key: string, value: any): Promise<ApiResponse<UserSetting>> {
    // Try to update first, if not found, create
    try {
      return await this.updateUserSetting(key, { value });
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return await this.createUserSetting({ key, value });
      }
      throw error;
    }
  }
}

export const userSettingsService = new UserSettingsService();
