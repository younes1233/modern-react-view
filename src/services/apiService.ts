
import { authService } from './authService';
import { bannerService } from './bannerService';

// Export all services
export { authService, bannerService };

// Legacy compatibility - combine all services into one object
class ApiService {
  // Auth methods
  async apiLogin(email: string, password: string) {
    return authService.login(email, password);
  }

  async apiLogout() {
    return authService.logout();
  }

  async login(email: string, password: string) {
    return authService.login(email, password);
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
  ) {
    return authService.register(firstName, lastName, email, phone, password, passwordConfirmation, gender, dateOfBirth);
  }

  async logout() {
    return authService.logout();
  }

  async forgotPassword(email: string) {
    return authService.forgotPassword(email);
  }

  async verifyOtp(email: string, otp: number) {
    return authService.verifyOtp(email, otp);
  }

  async resetPassword(email: string, password: string, passwordConfirmation: string) {
    return authService.resetPassword(email, password, passwordConfirmation);
  }

  async getMe() {
    return authService.getMe();
  }

  async refreshToken() {
    return authService.refreshToken();
  }

  // Banner methods
  async getBanners() {
    return bannerService.getBanners();
  }

  async createBanner(bannerData: any) {
    return bannerService.createBanner(bannerData);
  }

  async updateBanner(id: number, bannerData: any) {
    return bannerService.updateBanner(id, bannerData);
  }

  async deleteBanner(id: number) {
    return bannerService.deleteBanner(id);
  }

  async reorderBanners(bannerIds: number[]) {
    return bannerService.reorderBanners(bannerIds);
  }

  // Token management
  setToken(token: string) {
    authService.setToken(token);
    bannerService.setToken(token);
  }

  removeToken() {
    authService.removeToken();
    bannerService.removeToken();
  }

  getToken() {
    return authService.getToken();
  }

  isAuthenticated() {
    return authService.isAuthenticated();
  }
}

// Create and export a singleton instance for backward compatibility
export const apiService = new ApiService();
export default apiService;
