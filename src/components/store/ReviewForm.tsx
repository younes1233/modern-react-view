import React, { useState, memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Star, Upload, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { reviewService } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';

interface ReviewFormProps {
  productId: string;
  existingReview?: {
    id: number;
    rating: number;
    comment: string;
    images?: string;
  };
  onReviewSubmitted: () => void;
  onCancel: () => void;
}

const ReviewFormComponent: React.FC<ReviewFormProps> = ({
  productId,
  existingReview,
  onReviewSubmitted,
  onCancel
}) => {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [images, setImages] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});

  
  const { user } = useAuth();

  // Helper function to render validation errors for a field
  const renderFieldError = (fieldName: string) => {
    const errors = validationErrors[fieldName];
    if (!errors || errors.length === 0) return null;

    return (
      <div className="validation-error text-red-600 text-sm mt-1" data-field={fieldName}>
        {errors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </div>
    );
  };

  // Clear validation errors when user starts typing/interacting
  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">
            Please sign in to leave a review.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.slice(0, 3 - images.length); // Max 3 images

    setImages(prev => [...prev, ...validFiles]);
    clearFieldError('images');

    // Create preview URLs
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImages(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous validation errors
    setValidationErrors({});

    const errors: Record<string, string[]> = {};

    // Validation
    if (rating === 0) {
      errors.rating = ["Please select a rating"];
    }

    if (comment.length > 255) {
      errors.comment = ["Comment must be 255 characters or less"];
    }

    if (images.length > 3) {
      errors.images = ["Maximum 3 images allowed"];
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        rating,
        comment: comment.trim() || undefined,
        images: images.length > 0 ? images : undefined,
      };

      await reviewService.addReview(productId, reviewData);

      toast({
        title: "Success",
        description: existingReview ? "Review updated successfully" : "Review submitted successfully",
      });

      setValidationErrors({});
      onReviewSubmitted();
    } catch (error: any) {
      console.error('Review submission failed:', error);

      // Extract validation errors from the error response
      if (error.response && error.response.details) {
        console.log('Setting validation errors:', error.response.details);
        setValidationErrors(error.response.details);
      } else {
        // Generic error handling
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to submit review",
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {existingReview ? 'Edit Your Review' : 'Write a Review'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium mb-2">Rating *</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1"
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => {
                    setRating(star);
                    clearFieldError('rating');
                  }}
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= (hoveredStar || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {renderFieldError('rating')}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Comment (optional)
            </label>
            <Textarea
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
                clearFieldError('comment');
              }}
              placeholder="Share your thoughts about this product..."
              className="min-h-[100px]"
              maxLength={255}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {comment.length}/255 characters
            </p>
            {renderFieldError('comment')}
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Images (optional, max 3)
            </label>
            
            {images.length < 3 && (
              <div className="mb-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                  id="review-images"
                />
                <label
                  htmlFor="review-images"
                  className="flex items-center gap-2 p-3 border-2 border-dashed border-muted-foreground/25 rounded-lg cursor-pointer hover:border-muted-foreground/50 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span>Upload images</span>
                </label>
              </div>
            )}

            {previewImages.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {previewImages.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {renderFieldError('images')}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? (existingReview ? 'Updating...' : 'Submitting...')
                : (existingReview ? 'Update Review' : 'Submit Review')
              }
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

// Memoize ReviewForm - only re-render if productId or existingReview changes
export const ReviewForm = memo(ReviewFormComponent, (prevProps, nextProps) => {
  return prevProps.productId === nextProps.productId &&
         prevProps.existingReview?.id === nextProps.existingReview?.id;
});