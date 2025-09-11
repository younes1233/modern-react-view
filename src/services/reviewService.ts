import BaseApiService from './baseApiService';

interface ReviewUser {
  id: number;
  name: string;
}

interface ReviewResponse {
  id: number;
  user: ReviewUser;
  rating: number;
  comment: string;
  is_verified_purchase: boolean;
  images: string;
  created_at: string;
  updated_at: string;
}

interface AddReviewRequest {
  rating: number;
  comment?: string;
  images?: File[];
}

interface UpdateReviewRequest {
  rating: number;
  comment?: string;
  images?: File[];
}

interface ReviewApiResponse {
  error: boolean;
  message: string;
  details: ReviewResponse | ReviewResponse[] | null;
}

class ReviewService extends BaseApiService {
  /**
   * Add a new review for a product
   */
  async addReview(productId: string, reviewData: AddReviewRequest): Promise<ReviewApiResponse> {
    const formData = new FormData();
    formData.append('rating', reviewData.rating.toString());
    
    if (reviewData.comment) {
      formData.append('comment', reviewData.comment);
    }
    
    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    return this.request<ReviewApiResponse>(
      `/auth/products/${productId}/reviews`,
      {
        method: 'POST',
        body: formData,
      },
      true // include credentials for authentication
    );
  }

  /**
   * Update an existing review
   */
  async updateReview(productId: string, reviewData: UpdateReviewRequest): Promise<ReviewApiResponse> {
    const formData = new FormData();
    formData.append('rating', reviewData.rating.toString());
    
    if (reviewData.comment) {
      formData.append('comment', reviewData.comment);
    }
    
    if (reviewData.images && reviewData.images.length > 0) {
      reviewData.images.forEach((image, index) => {
        formData.append(`images[${index}]`, image);
      });
    }

    return this.request<ReviewApiResponse>(
      `/auth/products/${productId}/reviews`,
      {
        method: 'PUT',
        body: formData,
      },
      true // include credentials for authentication
    );
  }

  /**
   * Delete a review
   */
  async deleteReview(productId: string): Promise<ReviewApiResponse> {
    return this.request<ReviewApiResponse>(
      `/auth/products/${productId}/reviews`,
      {
        method: 'DELETE',
      },
      true // include credentials for authentication
    );
  }
}

export const reviewService = new ReviewService();