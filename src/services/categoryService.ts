import BaseApiService, { ApiResponse } from './baseApiService';

export interface Category {
  id?: number;
  name: string;
  slug: string;
  image?: string; // Keep for backward compatibility
  images?: {
    urls: {
      original: string;
      category_image: {
        desktop: string;
        tablet: string;
        mobile: string;
      };
    };
  };
  icon: string;
  description?: string;
  category_image?: string;
  order?: number;
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

  // Create new category with file upload
  async createCategory(categoryData: Omit<Category, 'id' | 'created_at' | 'updated_at'>, imageFile?: File, iconFile?: File): Promise<ApiResponse<Category>> {
    const formData = new FormData();
    
    // Add text fields (exclude order field for creation)
    formData.append('name', categoryData.name);
    formData.append('slug', categoryData.slug);
    formData.append('is_active', categoryData.is_active ? '1' : '0');
    formData.append('featured', categoryData.featured ? '1' : '0');
    
    if (categoryData.description) formData.append('description', categoryData.description);
    if (categoryData.seo_title) formData.append('seo_title', categoryData.seo_title);
    if (categoryData.seo_description) formData.append('seo_description', categoryData.seo_description);
    if (categoryData.parent_id) formData.append('parent_id', categoryData.parent_id.toString());
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (categoryData.image) {
      formData.append('image_url', categoryData.image);
    }
    
    // Add icon file if provided  
    if (iconFile) {
      formData.append('icon', iconFile);
    } else if (categoryData.icon) {
      formData.append('icon_url', categoryData.icon);
    }

    return this.postFormData<ApiResponse<Category>>('/admin/categories', formData);
  }

  // Update category with file upload - only send changed fields
  async updateCategory(id: number, categoryData: Partial<Category>, imageFile?: File, iconFile?: File): Promise<ApiResponse<Category>> {
    console.log('CategoryService.updateCategory called with:', {
      id,
      categoryData,
      imageFile: imageFile?.name,
      iconFile: iconFile?.name
    });

    const formData = new FormData();
    
    // Only add fields that are provided (changed)
    if (categoryData.name !== undefined) formData.append('name', categoryData.name);
    if (categoryData.slug !== undefined) formData.append('slug', categoryData.slug);
    if (categoryData.is_active !== undefined) formData.append('is_active', categoryData.is_active ? '1' : '0');
    if (categoryData.featured !== undefined) formData.append('featured', categoryData.featured ? '1' : '0');
    if (categoryData.description !== undefined) formData.append('description', categoryData.description || '');
    if (categoryData.seo_title !== undefined) formData.append('seo_title', categoryData.seo_title || '');
    if (categoryData.seo_description !== undefined) formData.append('seo_description', categoryData.seo_description || '');
    if (categoryData.parent_id !== undefined) formData.append('parent_id', categoryData.parent_id ? categoryData.parent_id.toString() : '');
    
    // Add image file if provided
    if (imageFile) {
      formData.append('image', imageFile);
    } else if (categoryData.image !== undefined) {
      formData.append('image_url', categoryData.image || '');
    }
    
    // Add icon file if provided  
    if (iconFile) {
      formData.append('icon', iconFile);
    } else if (categoryData.icon !== undefined) {
      formData.append('icon_url', categoryData.icon || '');
    }

    // Log FormData contents
    console.log('FormData being sent:');
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const result = await this.putFormData<ApiResponse<Category>>(`/admin/categories/${id}`, formData);
    console.log('Update API response:', result);
    return result;
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
