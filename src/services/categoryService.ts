import BaseApiService, { ApiResponse } from './baseApiService';

export interface Category {
  id?: number;
  name: string;
  slug: string;
  image: string;
  icon: string;
  description?: string;
  category_image?: string;
  order: number;
  is_active: boolean;
  featured: boolean;
  seo_title?: string;
  seo_description?: string;
  parent_id?: number;
  created_at?: string;
  updated_at?: string;
  children?: Category[];
  level?: number;
  products?: number;
  revenue?: number;
  isExpanded?: boolean;
}

export interface CategoryFilters {
  search?: string;
  is_active?: boolean;
  parent_id?: number;
  level?: number;
  page?: number;
  limit?: number;
}

class CategoryService extends BaseApiService {
  constructor() {
    super();
    // Ensure token is loaded from localStorage if available
    const token = localStorage.getItem('auth_token');
    if (token && !this.getToken()) {
      this.setToken(token);
    }
  }
  
  // Get all categories with hierarchy
  async getCategories(filters: CategoryFilters = {}): Promise<ApiResponse<Category[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString());
    if (filters.parent_id) queryParams.append('parent_id', filters.parent_id.toString());
    if (filters.level) queryParams.append('level', filters.level.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = `/admin/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<ApiResponse<Category[]>>(endpoint);
  }

  // Get flat list of categories (for dropdowns, etc.)
  async getFlatCategories(): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>('/admin/categories');
  }

  // Get categories by parent ID
  async getCategoriesByParent(parentId: number): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>(`/admin/categories/parent/${parentId}`);
  }

  // Get root categories only
  async getRootCategories(): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>('/admin/categories/root');
  }

  // Get single category by ID
  async getCategory(id: number): Promise<ApiResponse<Category>> {
    return this.get<ApiResponse<Category>>(`/admin/categories/${id}`);
  }

  // Get category by slug (if implementing slugs)
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    return this.get<ApiResponse<Category>>(`/admin/categories/slug/${slug}`);
  }

  // Create new category
  async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>): Promise<ApiResponse<Category>> {
    const payload = {
      name: categoryData.name,
      slug: categoryData.slug,
      image: categoryData.image,
      icon: categoryData.icon,
      description: categoryData.description || null,
      category_image: categoryData.category_image || null,
      order: categoryData.order,
      is_active: categoryData.is_active,
      featured: categoryData.featured,
      seo_title: categoryData.seo_title || null,
      seo_description: categoryData.seo_description || null,
      parent_id: categoryData.parent_id || null
    };

    return this.post<ApiResponse<Category>>('/admin/categories', payload);
  }

  // Update category
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    const payload: any = {};
    
    if (categoryData.name) payload.name = categoryData.name;
    if (categoryData.slug) payload.slug = categoryData.slug;
    if (categoryData.image !== undefined) payload.image = categoryData.image;
    if (categoryData.icon) payload.icon = categoryData.icon;
    if (categoryData.description !== undefined) payload.description = categoryData.description;
    if (categoryData.category_image !== undefined) payload.category_image = categoryData.category_image;
    if (categoryData.order !== undefined) payload.order = categoryData.order;
    if (categoryData.is_active !== undefined) payload.is_active = categoryData.is_active;
    if (categoryData.featured !== undefined) payload.featured = categoryData.featured;
    if (categoryData.seo_title !== undefined) payload.seo_title = categoryData.seo_title;
    if (categoryData.seo_description !== undefined) payload.seo_description = categoryData.seo_description;
    if (categoryData.parent_id !== undefined) payload.parent_id = categoryData.parent_id;

    return this.put<ApiResponse<Category>>(`/admin/categories/${id}`, payload);
  }

  // Delete category
  async deleteCategory(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.delete<ApiResponse<{ message: string }>>(`/admin/categories/${id}`);
  }

  // Move category to different parent
  async moveCategory(id: number, newParentId?: number): Promise<ApiResponse<Category>> {
    const payload = {
      parent_id: newParentId || null
    };

    return this.put<ApiResponse<Category>>(`/admin/categories/${id}/move`, payload);
  }

  // Reorder categories within same parent
  async reorderCategories(categoryOrders: { id: number; order: number }[]): Promise<ApiResponse<{ message: string }>> {
    const payload = {
      orders: categoryOrders
    };

    return this.post<ApiResponse<{ message: string }>>('/admin/categories/reorder', payload);
  }

  // Get category tree/hierarchy
  async getCategoryTree(): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>('/admin/categories');
  }

  // Get category with all descendants
  async getCategoryWithDescendants(id: number): Promise<ApiResponse<Category>> {
    return this.get<ApiResponse<Category>>(`/admin/categories/${id}/descendants`);
  }

  // Get category path (breadcrumb)
  async getCategoryPath(id: number): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>(`/admin/categories/${id}/path`);
  }

  // Get category statistics
  async getCategoryStats(): Promise<ApiResponse<{
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    rootCategories: number;
    deepestLevel: number;
  }>> {
    return this.get<ApiResponse<any>>('/admin/categories');
  }

  // Bulk operations
  async bulkUpdateStatus(categoryIds: number[], is_active: boolean): Promise<ApiResponse<{ message: string }>> {
    const payload = {
      category_ids: categoryIds,
      is_active: is_active
    };

    return this.post<ApiResponse<{ message: string }>>('/admin/categories/bulk/status', payload);
  }

  async bulkDelete(categoryIds: number[]): Promise<ApiResponse<{ message: string }>> {
    const payload = {
      category_ids: categoryIds
    };

    return this.post<ApiResponse<{ message: string }>>('/admin/categories/bulk/delete', payload);
  }

  // Search categories
  async searchCategories(query: string, filters: Partial<CategoryFilters> = {}): Promise<ApiResponse<Category[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (filters.is_active !== undefined) queryParams.append('is_active', filters.is_active.toString());
    if (filters.parent_id) queryParams.append('parent_id', filters.parent_id.toString());
    if (filters.level) queryParams.append('level', filters.level.toString());

    return this.get<ApiResponse<Category[]>>(`/admin/categories/search?${queryParams.toString()}`);
  }

  // Store API: Get all active categories for store frontend
  async getStoreCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
    return this.get<ApiResponse<{ categories: Category[] }>>('/categories');
  }
}

// Create and export singleton instance
export const categoryService = new CategoryService();
export default categoryService;
