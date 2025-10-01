import { useEffect, useRef } from 'react';
import { reviewService, Review } from '../services/reviewService';

interface UseReviewImagePollingProps {
  productId: string;
  reviewId: number | null;
  expectedImageCount: number;
  onImagesReady: (review: Review) => void;
  enabled: boolean;
}

/**
 * Polls for review images after submission until they're processed by the queue
 * This provides smooth UX when images are processed asynchronously
 */
export function useReviewImagePolling({
  productId,
  reviewId,
  expectedImageCount,
  onImagesReady,
  enabled,
}: UseReviewImagePollingProps) {
  const pollCountRef = useRef(0);
  const maxPolls = 15; // Poll for up to 30 seconds (15 * 2s)
  const pollInterval = 2000; // 2 seconds

  useEffect(() => {
    console.log('🔄 Polling hook state:', { enabled, reviewId, expectedImageCount });

    if (!enabled || !reviewId || expectedImageCount === 0) {
      console.log('❌ Polling disabled or invalid params');
      return;
    }

    console.log('✅ Starting polling for review images...');
    pollCountRef.current = 0;

    const pollForImages = async () => {
      try {
        console.log(`📡 Poll attempt ${pollCountRef.current + 1}/${maxPolls}`);
        const review = await reviewService.getUserReview(productId);
        console.log('📥 Received review:', review);

        if (review && review.images && review.images.length >= expectedImageCount) {
          // Images are ready!
          console.log('✅ Images ready!', review.images);
          onImagesReady(review);
          return true;
        }

        console.log(`⏳ Still waiting... (${review?.images?.length || 0}/${expectedImageCount} images)`);
        return false;
      } catch (error) {
        console.error('❌ Error polling for review images:', error);
        return false;
      }
    };

    const intervalId = setInterval(async () => {
      pollCountRef.current++;

      const imagesReady = await pollForImages();

      if (imagesReady || pollCountRef.current >= maxPolls) {
        console.log(imagesReady ? '✅ Polling complete - images ready' : '⏱️ Polling timeout');
        clearInterval(intervalId);
      }
    }, pollInterval);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up polling interval');
      clearInterval(intervalId);
    };
  }, [productId, reviewId, expectedImageCount, enabled, onImagesReady]);
}
