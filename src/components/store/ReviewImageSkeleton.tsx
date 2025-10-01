import React from 'react';

interface ReviewImageSkeletonProps {
  count: number;
}

export const ReviewImageSkeleton: React.FC<ReviewImageSkeletonProps> = ({ count }) => {
  return (
    <div className="flex gap-2 flex-wrap">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="w-20 h-20 bg-muted rounded-lg animate-pulse"
        />
      ))}
    </div>
  );
};
