import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StarRating } from '@/components/ui/star-rating';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, Flag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { type Review } from '@/services/reviewService';
import { reviewService } from '@/services/reviewService';
import { toast } from 'sonner';
import { useState, memo } from 'react';
import { ImageZoom } from '@/components/store/ImageZoom';

interface ReviewCardProps {
  review: Review;
  productId: string;
  onEdit: (review: Review) => void;
  onDelete: () => void;
  mode?: 'simple' | 'enhanced';
}

const ReviewCardComponent = ({ review, productId, onEdit, onDelete, mode = 'simple' }: ReviewCardProps) => {
  const { user } = useAuth();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isReporting, setIsReporting] = useState(false);
  const [isHelpful, setIsHelpful] = useState(review.interactions?.is_helpful || false);
  const [helpfulCount, setHelpfulCount] = useState(review.helpful_count || 0);
  const [isToggling, setIsToggling] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportDetails, setReportDetails] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return date.toLocaleDateString();
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageZoom(true);
  };

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await reviewService.deleteReview(productId);

      toast.success("Review deleted successfully", {
        description: "Your review has been removed from this product.",
        duration: 3000,
      });
      onDelete();
    } catch (error) {
      toast.error("Failed to delete review", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleHelpfulToggle = async () => {
    if (!user) {
      toast.error("Please log in to mark reviews as helpful");
      return;
    }

    if (String(user.id) === String(review.user?.id)) {
      toast.error("You cannot mark your own review as helpful");
      return;
    }

    setIsToggling(true);

    try {
      const result = await reviewService.toggleHelpful(review.id);
      setIsHelpful(result.is_helpful);
      setHelpfulCount(result.helpful_count);

      toast.success(result.is_helpful ? "Review marked as helpful" : "Helpful mark removed");
    } catch (error) {
      toast.error("Failed to update helpful status", {
        description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
        duration: 4000,
      });
    } finally {
      setIsToggling(false);
    }
  };

  const handleReport = async () => {
    // Clear previous validation errors
    setValidationErrors({});

    const errors: Record<string, string[]> = {};

    // Validation
    if (!reportReason) {
      errors.reason = ["Please select a reason for reporting"];
    }

    if (reportDetails && reportDetails.length > 500) {
      errors.details = ["Additional details cannot exceed 500 characters"];
    }

    if (Object.keys(errors).length > 0) {
      console.log('Validation errors found:', errors);
      setValidationErrors(errors);
      return;
    }

    setIsReporting(true);

    try {
      await reviewService.reportReview(review.id, {
        reason: reportReason,
        details: reportDetails || undefined
      });

      toast.success("Review reported successfully", {
        description: "Our team will review your report. Thank you for helping keep our community safe.",
        duration: 4000,
      });
      setValidationErrors({});
      setReportReason('');
      setReportDetails('');
      setShowReportDialog(false);
    } catch (error: any) {
      console.error('Report submission failed:', error);

      // Handle specific error cases
      if (error.message && error.message.includes("already reported")) {
        toast.error("Already reported", {
          description: "You have already reported this review. Thank you for helping keep our community safe.",
          duration: 4000,
        });
        // Close dialog since this is not a validation error
        setReportReason('');
        setReportDetails('');
        setShowReportDialog(false);
      } else if (error.response && error.response.details) {
        // Handle validation errors from backend
        console.log('Setting validation errors:', error.response.details);
        setValidationErrors(error.response.details);
      } else {
        toast.error("Failed to report review", {
          description: error instanceof Error ? error.message : "Something went wrong. Please try again.",
          duration: 4000,
        });
      }
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <Card className="border border-gray-200 hover:border-gray-300 transition-colors duration-200">
      <CardContent className="p-4 md:p-5">
        {/* Header with Avatar and Rating */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* User Avatar from DiceBear - Personas style */}
            <img
              src={`https://api.dicebear.com/7.x/personas/svg?seed=${encodeURIComponent(review.user?.name || 'Anonymous User')}&backgroundColor=b6fffa,ffd93d,6bcf7f,4d4d4d,ffb3ba`}
              alt={review.user?.name || 'Anonymous User'}
              className="w-10 h-10 rounded-full shadow-md bg-gray-100"
            />

            {/* User Info */}
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-sm md:text-base text-gray-900">
                  {review.user?.name || 'Anonymous User'}
                </span>
                {review.is_verified_purchase && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200">
                    ✓ Verified Purchase
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-3 mt-1">
                <StarRating
                  rating={review.rating}
                  variant="full"
                  size="md"
                />
                <div className="flex items-center space-x-1 text-xs text-gray-500">
                  <span>•</span>
                  <span>{formatTimeAgo(review.created_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* User Actions - Original style */}
          {user && String(user.id) === String(review.user?.id) && (
            <div className="flex space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(review)}
                className="text-xs h-7 px-2 text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50"
              >
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDeleteDialog(true)}
                className="text-xs h-7 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Delete
              </Button>
            </div>
          )}
        </div>

        {/* Review Comment */}
        {review.comment && (
          <div className={`mb-3 ${
            mode === 'enhanced'
              ? 'p-3 bg-cyan-500/5 border-l-4 border-cyan-500/30 rounded-lg relative'
              : ''
          }`}>
            {mode === 'enhanced' && (
              <>
                {/* Opening Quote - Top Left */}
                <span className="absolute top-1 left-2 text-2xl text-cyan-500/40 font-serif leading-none">"</span>
                {/* Closing Quote - Bottom Right */}
                <span className="absolute bottom-1 right-2 text-2xl text-cyan-500/40 font-serif leading-none">"</span>
              </>
            )}
            <p className={`text-gray-700 text-sm md:text-base leading-relaxed ${
              mode === 'enhanced' ? 'px-4' : ''
            }`}>
              {review.comment}
            </p>
          </div>
        )}

        {/* Review Images */}
        {review.images && review.images.length > 0 && (
          <div className="flex space-x-2 mb-3 overflow-x-auto pb-2">
            {review.images.map((image, index) => (
              <img
                key={image.id}
                src={image.original}
                alt={`Review ${index + 1}`}
                className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg border border-gray-200 hover:border-gray-300 transition-colors cursor-pointer flex-shrink-0"
                onError={(e) => {
                  console.log('Image failed to load:', e.currentTarget.src);
                }}
                onClick={() => handleImageClick(index)}
              />
            ))}
          </div>
        )}

        {/* Review Actions */}
        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleHelpfulToggle}
              disabled={isToggling || !user || String(user.id) === String(review.user?.id)}
              className={`text-xs transition-colors ${
                isHelpful
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isToggling ? 'Loading...' : (
                mode === 'enhanced'
                  ? `👍 Helpful (${helpfulCount})`
                  : `Helpful (${helpfulCount})`
              )}
            </button>
            <button
              onClick={() => setShowReportDialog(true)}
              disabled={!user || String(user.id) === String(review.user?.id) || review.interactions?.is_reported}
              className="text-xs text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {review.interactions?.is_reported
                ? (mode === 'enhanced' ? '🚩 Reported' : 'Reported')
                : (mode === 'enhanced' ? '🚩 Report' : 'Report')
              }
            </button>
          </div>
          <div className="text-xs text-gray-400">
            Was this helpful?
          </div>
        </div>
      </CardContent>

      {/* Image Zoom Component */}
      <ImageZoom
        images={
          review.images?.map((image) => ({
            url: image.original,
            alt: `Review image`
          })) || []
        }
        selectedIndex={selectedImageIndex}
        open={showImageZoom}
        onOpenChange={setShowImageZoom}
        onImageChange={setSelectedImageIndex}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-card border-border text-card-foreground shadow-lg">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-lg font-semibold text-foreground">
              Delete Review
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Are you sure you want to delete your review? This action cannot be undone and will permanently remove your review from this product.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isDeleting ? 'Deleting...' : 'Delete Review'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Report Dialog */}
      <AlertDialog
        open={showReportDialog}
        onOpenChange={(open) => {
          setShowReportDialog(open);
          if (!open) {
            // Reset form when dialog closes
            setReportReason('');
            setReportDetails('');
            setValidationErrors({});
          }
        }}
      >
        <AlertDialogContent className="bg-card border-border text-card-foreground shadow-lg">
          <AlertDialogHeader className="space-y-3">
            <AlertDialogTitle className="text-lg font-semibold text-foreground">
              Report Review
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Why are you reporting this review? This helps us maintain community standards.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Reason *</label>
              <Select
                value={reportReason}
                onValueChange={(value) => {
                  setReportReason(value);
                  clearFieldError('reason');
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spam">Spam</SelectItem>
                  <SelectItem value="inappropriate">Inappropriate content</SelectItem>
                  <SelectItem value="fake">Fake review</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {renderFieldError('reason')}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Additional details (optional)</label>
              <Textarea
                value={reportDetails}
                onChange={(e) => {
                  setReportDetails(e.target.value);
                  clearFieldError('details');
                }}
                placeholder="Provide more context about why you're reporting this review..."
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground">
                {reportDetails.length}/500 characters
              </p>
              {renderFieldError('details')}
            </div>
          </div>

          <AlertDialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isReporting}
              className="border-border bg-background text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
            >
              Cancel
            </AlertDialogCancel>
            <Button
              onClick={handleReport}
              disabled={isReporting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isReporting ? 'Reporting...' : 'Submit Report'}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

// Memoize ReviewCard - only re-render if review data actually changes
export const ReviewCard = memo(ReviewCardComponent, (prevProps, nextProps) => {
  // Only re-render if review ID or helpful count changes
  return prevProps.review.id === nextProps.review.id &&
         prevProps.review.helpful_count === nextProps.review.helpful_count &&
         prevProps.productId === nextProps.productId &&
         prevProps.mode === nextProps.mode;
});