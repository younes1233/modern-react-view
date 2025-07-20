import BaseApiService, { ApiResponse } from './baseApiService';

export interface Category {
  id?: number;
  name: string;
  description: string;
  parentId?: number;
  image?: string;
  status: "active" | "inactive";
  created?: string;
  updated?: string;
  children?: Category[];
  level?: number;
  products?: number;
  revenue?: number;
  isExpanded?: boolean;
}

export interface CategoryFilters {
  search?: string;
  status?: "active" | "inactive";
  parentId?: number;
  level?: number;
  page?: number;
  limit?: number;
}

class CategoryService extends BaseApiService {
  
  // Get all categories with hierarchy
  async getCategories(filters: CategoryFilters = {}): Promise<ApiResponse<Category[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.parentId) queryParams.append('parent_id', filters.parentId.toString());
    if (filters.level) queryParams.append('level', filters.level.toString());
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());

    const endpoint = `/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.get<ApiResponse<Category[]>>(endpoint);
  }

  // Get flat list of categories (for dropdowns, etc.)
  async getFlatCategories(): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>('/categories/flat');
  }

  // Get categories by parent ID
  async getCategoriesByParent(parentId: number): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>(`/categories/parent/${parentId}`);
  }

  // Get root categories only
  async getRootCategories(): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>('/categories/root');
  }

  // Get single category by ID
  async getCategory(id: number): Promise<ApiResponse<Category>> {
    return this.get<ApiResponse<Category>>(`/categories/${id}`);
  }

  // Get category by slug (if implementing slugs)
  async getCategoryBySlug(slug: string): Promise<ApiResponse<Category>> {
    return this.get<ApiResponse<Category>>(`/categories/slug/${slug}`);
  }

  // Create new category
  async createCategory(categoryData: Omit<Category, 'id' | 'created' | 'updated'>): Promise<ApiResponse<Category>> {
    const payload = {
      name: categoryData.name,
      description: categoryData.description,
      parent_id: categoryData.parentId || null,
      image: categoryData.image || null,
      status: categoryData.status || 'active'
    };

    return this.post<ApiResponse<Category>>('/categories', payload);
  }

  // Update category
  async updateCategory(id: number, categoryData: Partial<Category>): Promise<ApiResponse<Category>> {
    const payload: any = {};
    
    if (categoryData.name) payload.name = categoryData.name;
    if (categoryData.description !== undefined) payload.description = categoryData.description;
    if (categoryData.parentId !== undefined) payload.parent_id = categoryData.parentId;
    if (categoryData.image !== undefined) payload.image = categoryData.image;
    if (categoryData.status) payload.status = categoryData.status;

    return this.put<ApiResponse<Category>>(`/categories/${id}`, payload);
  }

  // Delete category
  async deleteCategory(id: number): Promise<ApiResponse<{ message: string }>> {
    return this.delete<ApiResponse<{ message: string }>>(`/categories/${id}`);
  }

  // Move category to different parent
  async moveCategory(id: number, newParentId?: number): Promise<ApiResponse<Category>> {
    const payload = {
      parent_id: newParentId || null
    };

    return this.put<ApiResponse<Category>>(`/categories/${id}/move`, payload);
  }

  // Reorder categories within same parent
  async reorderCategories(categoryOrders: { id: number; order: number }[]): Promise<ApiResponse<{ message: string }>> {
    const payload = {
      orders: categoryOrders
    };

    return this.post<ApiResponse<{ message: string }>>('/categories/reorder', payload);
  }

  // Get category tree/hierarchy
  async getCategoryTree(): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>('/categories/tree');
  }

  // Get category with all descendants
  async getCategoryWithDescendants(id: number): Promise<ApiResponse<Category>> {
    return this.get<ApiResponse<Category>>(`/categories/${id}/descendants`);
  }

  // Get category path (breadcrumb)
  async getCategoryPath(id: number): Promise<ApiResponse<Category[]>> {
    return this.get<ApiResponse<Category[]>>(`/categories/${id}/path`);
  }

  // Get category statistics
  async getCategoryStats(): Promise<ApiResponse<{
    totalCategories: number;
    activeCategories: number;
    inactiveCategories: number;
    rootCategories: number;
    deepestLevel: number;
  }>> {
    return this.get<ApiResponse<any>>('/categories/stats');
  }

  // Bulk operations
  async bulkUpdateStatus(categoryIds: number[], status: "active" | "inactive"): Promise<ApiResponse<{ message: string }>> {
    const payload = {
      category_ids: categoryIds,
      status: status
    };

    return this.post<ApiResponse<{ message: string }>>('/categories/bulk/status', payload);
  }

  async bulkDelete(categoryIds: number[]): Promise<ApiResponse<{ message: string }>> {
    const payload = {
      category_ids: categoryIds
    };

    return this.post<ApiResponse<{ message: string }>>('/categories/bulk/delete', payload);
  }

  // Search categories
  async searchCategories(query: string, filters: Partial<CategoryFilters> = {}): Promise<ApiResponse<Category[]>> {
    const queryParams = new URLSearchParams();
    queryParams.append('q', query);
    
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.parentId) queryParams.append('parent_id', filters.parentId.toString());
    if (filters.level) queryParams.append('level', filters.level.toString());

    return this.get<ApiResponse<Category[]>>(`/categories/search?${queryParams.toString()}`);
  }
}

// Create and export singleton instance
export const categoryService = new CategoryService();
export default categoryService;
