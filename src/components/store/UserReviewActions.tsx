import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Edit, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { reviewService } from '@/services/reviewService';
import { useAuth } from '@/contexts/AuthContext';

interface UserReviewActionsProps {
  productId: string;
  review: {
    id: number;
    rating: number;
    comment: string;
    images?: string;
    user: {
      id: number;
      name: string;
    };
  };
  onEditReview: () => void;
  onReviewDeleted: () => void;
}

export const UserReviewActions: React.FC<UserReviewActionsProps> = ({
  productId,
  review,
  onEditReview,
  onReviewDeleted
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const { user } = useAuth();

  // Only show actions if the current user owns this review
  if (!user || user.id !== review.user.id.toString()) {
    return null;
  }

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      await reviewService.deleteReview(productId);

      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      onReviewDeleted();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete review",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="flex gap-2 mt-3">
      <Button
        variant="outline"
        size="sm"
        onClick={onEditReview}
        className="flex items-center gap-1"
      >
        <Edit className="w-3 h-3" />
        Edit
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowDeleteDialog(true)}
        className="flex items-center gap-1 text-destructive hover:text-destructive"
      >
        <Trash2 className="w-3 h-3" />
        Delete
      </Button>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};