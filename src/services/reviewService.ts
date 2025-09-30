import BaseApiService from './baseApiService';

export interface ReviewUser {
  id: number;
  name: string;
}

export interface ReviewImage {
  id: number;
  original: string;
  thumbnail: string;
  display: string;
  display_jpeg: string;
  responsive?: {
    srcset: string;
    urls: Record<string, string>;
  } | null;
}

export interface ReviewInteractions {
  is_helpful: boolean;
  is_reported: boolean;
  can_interact: boolean;
}

export interface Review {
  id: number;
  user: ReviewUser;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  images: ReviewImage[];
  helpful_count: number;
  interactions?: ReviewInteractions | null;
  created_at: string;
  updated_at: string;
}

export interface ReviewStatistics {
  average_rating: number;
  total_reviews: number;
  rating_breakdown: Record<string, number>;
}

export interface ReviewPagination {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
  from: number | null;
  to: number | null;
  has_more_pages: boolean;
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
  path: string;
}

export interface ApiResponse<T> {
  error: boolean;
  message: string;
  details: T;
}

export interface AddReviewRequest {
  rating: number;
  comment?: string;
  images?: File[];
}

export interface UpdateReviewRequest {
  rating: number;
  comment?: string;
  images?: File[];
}

export interface ReportReviewRequest {
  reason: string;
  details?: string;
}

class ReviewService extends BaseApiService {
  /**
   * Get reviews for a product
   */
  async getProductReviews(productId: string, page: number = 1, perPage: number = 10): Promise<{
    reviews: Review[];
    statistics: ReviewStatistics;
    pagination: ReviewPagination;
  }> {
    const params = new URLSearchParams();
    if (page > 1) params.append('page', page.toString());
    if (perPage !== 10) params.append('per_page', perPage.toString());

    const url = `/products/${productId}/reviews${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await this.get<ApiResponse<{
      reviews: Review[];
      statistics: ReviewStatistics;
      pagination: ReviewPagination;
    }>>(url);
    return response.details;
  }

  /**
   * Add a new review for a product
   */
  async addReview(productId: string, reviewData: AddReviewRequest): Promise<Review> {
    const formData = new FormData();
    formData.append('rating', reviewData.rating.toString());

    if (reviewData.comment) {
      formData.append('comment', reviewData.comment);
    }

    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach((image) => {
        formData.append('images[]', image);
      });
    }

    const response = await this.postFormData<ApiResponse<Review>>(
      `/auth/products/${productId}/reviews`,
      formData,
      true
    );
    return response.details;
  }

  /**
   * Update an existing review
   */
  async updateReview(productId: string, reviewData: UpdateReviewRequest): Promise<Review> {
    const formData = new FormData();
    formData.append('rating', reviewData.rating.toString());

    if (reviewData.comment) {
      formData.append('comment', reviewData.comment);
    }

    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach((image) => {
        formData.append('images[]', image);
      });
    }

    const response = await this.putFormData<ApiResponse<Review>>(
      `/auth/products/${productId}/reviews`,
      formData,
      true
    );
    return response.details;
  }

  /**
   * Delete a review
   */
  async deleteReview(productId: string, reviewId?: number): Promise<void> {
    await this.delete<ApiResponse<any>>(`/auth/products/${productId}/reviews`, true);
  }

  /**
   * Toggle helpful status for a review
   */
  async toggleHelpful(reviewId: number): Promise<{ helpful_count: number; is_helpful: boolean }> {
    const response = await this.post<ApiResponse<{ helpful_count: number; is_helpful: boolean }>>(
      `/auth/reviews/${reviewId}/toggle-helpful`,
      undefined,
      true
    );
    return response.details;
  }

  /**
   * Report a review
   */
  async reportReview(reviewId: number, reportData: ReportReviewRequest): Promise<{ is_reported: boolean }> {
    const response = await this.post<ApiResponse<{ is_reported: boolean }>>(
      `/auth/reviews/${reviewId}/report`,
      reportData,
      true
    );
    return response.details;
  }

  /**
   * Get interaction status for a review
   */
  async getReviewStatus(reviewId: number): Promise<{
    helpful_count: number;
    is_helpful: boolean;
    is_reported: boolean;
    can_interact: boolean;
  }> {
    const response = await this.get<ApiResponse<{
      helpful_count: number;
      is_helpful: boolean;
      is_reported: boolean;
      can_interact: boolean;
    }>>(`/auth/reviews/${reviewId}/status`, true);
    return response.details;
  }
}

export const reviewService = new ReviewService();