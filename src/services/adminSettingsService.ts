import BaseApiService from './baseApiService';

export interface AdminSettings {
  selected_store_id: number | null;
  selected_warehouse_id: number | null;
  selected_country_id: number | null;
}

export interface AdminSettingsResponse {
  error: boolean;
  message: string;
  details: AdminSettings;
}

export interface UpdateAdminSettingsRequest {
  selected_store_id?: number | null;
  selected_warehouse_id?: number | null;
  selected_country_id?: number | null;
}

export interface UpdateAdminSettingsResponse {
  error: boolean;
  message: string;
  data: AdminSettings;
}

class AdminSettingsService extends BaseApiService {
  /**
   * Get current admin settings
   */
  async getAdminSettings(): Promise<AdminSettingsResponse> {
    return this.get<AdminSettingsResponse>('/auth/admin-settings');
  }

  /**
   * Update admin settings
   */
  async updateAdminSettings(settings: UpdateAdminSettingsRequest): Promise<UpdateAdminSettingsResponse> {
    return this.put<UpdateAdminSettingsResponse>('/auth/admin-settings', settings);
  }
}

export const adminSettingsService = new AdminSettingsService();