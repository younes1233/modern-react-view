import { authService } from './authService';
import { bannerService } from './bannerService';
import { productListingService } from './productListingService';
import { homeSectionService } from './homeSectionService';
import { roleService } from './roleService';
import { adminProductService } from './adminProductService';
import { categoryService } from './categoryService';

// Export all services
export { authService, bannerService, productListingService, homeSectionService, roleService, adminProductService, categoryService };

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

  // Product Listing methods
  async getProductListings() {
    return productListingService.getProductListings();
  }

  async createProductListing(listingData: any) {
    return productListingService.createProductListing(listingData);
  }

  async updateProductListing(id: number, listingData: any) {
    return productListingService.updateProductListing(id, listingData);
  }

  async deleteProductListing(id: number) {
    return productListingService.deleteProductListing(id);
  }

  async reorderProductListings(orders: number[]) {
    return productListingService.reorderProductListings(orders);
  }

  async getProductListingProducts(productListingId: number, countryId?: number, currencyId?: number) {
    return productListingService.getProductListingProducts(productListingId, countryId, currencyId);
  }

  // Home Section methods
  async getHomeSections() {
    return homeSectionService.getHomeSections();
  }

  async createHomeSection(data: any) {
    return homeSectionService.createHomeSection(data);
  }

  async updateHomeSection(id: number, data: any) {
    return homeSectionService.updateHomeSection(id, data);
  }

  async deleteHomeSection(id: number) {
    return homeSectionService.deleteHomeSection(id);
  }

  async reorderHomeSections(order: number[]) {
    return homeSectionService.reorderHomeSections(order);
  }

  // Role methods
  async getRoles() {
    return roleService.getRoles();
  }

  async createRole(name: string, description?: string, permissions?: string[]) {
    return roleService.createRole(name, description, permissions);
  }

  async updateRole(roleId: number, name: string, description?: string, permissions?: string[]) {
    return roleService.updateRole(roleId, name, description, permissions);
  }

  async deleteRole(roleId: number) {
    return roleService.deleteRole(roleId);
  }

  async getRolePermissions(roleId: number) {
    return roleService.getRolePermissions(roleId);
  }

  async getAssignableRoles() {
    return roleService.getAssignableRoles();
  }

  async getAssignableRolesAndPermissions() {
    return roleService.getAssignableRolesAndPermissions();
  }

  async assignRoleToUser(userId: number, role: string) {
    return roleService.assignRoleToUser(userId, role);
  }

  // Admin Product methods
  async getAdminProducts(filters: any = {}) {
    return adminProductService.getAdminProducts(filters);
  }

  async getAdminProduct(id: number) {
    return adminProductService.getAdminProduct(id);
  }

  async getAdminProductBySku(sku: string) {
    return adminProductService.getAdminProductBySku(sku);
  }

  async createProduct(productData: any) {
    return adminProductService.createProduct(productData);
  }

  async deleteProduct(id: number) {
    return adminProductService.deleteProduct(id);
  }

  // Category methods
  async getCategories(filters = {}) {
    return categoryService.getCategories(filters);
  }

  async getFlatCategories() {
    return categoryService.getFlatCategories();
  }

  async getCategoriesByParent(parentId: number) {
    return categoryService.getCategoriesByParent(parentId);
  }

  async getRootCategories() {
    return categoryService.getRootCategories();
  }

  async getCategory(id: number) {
    return categoryService.getCategory(id);
  }

  async getCategoryBySlug(slug: string) {
    return categoryService.getCategoryBySlug(slug);
  }

  async createCategory(categoryData: any) {
    return categoryService.createCategory(categoryData);
  }

  async updateCategory(id: number, categoryData: any) {
    return categoryService.updateCategory(id, categoryData);
  }

  async deleteCategory(id: number) {
    return categoryService.deleteCategory(id);
  }

  async moveCategory(id: number, newParentId?: number) {
    return categoryService.moveCategory(id, newParentId);
  }

  async reorderCategories(categoryOrders: { id: number; order: number }[]) {
    return categoryService.reorderCategories(categoryOrders);
  }

  async getCategoryTree() {
    return categoryService.getCategoryTree();
  }

  async getCategoryWithDescendants(id: number) {
    return categoryService.getCategoryWithDescendants(id);
  }

  async getCategoryPath(id: number) {
    return categoryService.getCategoryPath(id);
  }

  async getCategoryStats() {
    return categoryService.getCategoryStats();
  }

  async bulkUpdateCategoryStatus(categoryIds: number[], is_active: boolean) {
    return categoryService.bulkUpdateStatus(categoryIds, is_active);
  }

  async bulkDeleteCategories(categoryIds: number[]) {
    return categoryService.bulkDelete(categoryIds);
  }

  async searchCategories(query: string, filters = {}) {
    return categoryService.searchCategories(query, filters);
  }

  // Token management - ensure all services get the token
  setToken(token: string) {
    authService.setToken(token);
    bannerService.setToken(token);
    productListingService.setToken(token);
    homeSectionService.setToken(token);
    roleService.setToken(token);
    adminProductService.setToken(token);
    categoryService.setToken(token);
  }

  removeToken() {
    authService.removeToken();
    bannerService.removeToken();
    productListingService.removeToken();
    homeSectionService.removeToken();
    roleService.removeToken();
    adminProductService.removeToken();
    categoryService.removeToken();
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
