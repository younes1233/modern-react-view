import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'badge' | 'full' | 'narrow';
  className?: string;
  showText?: boolean;
}

export const StarRating = ({
  rating,
  maxRating = 5,
  size = 'sm',
  variant = 'badge',
  className = '',
  showText = true
}: StarRatingProps) => {
  const sizeClasses = {
    sm: {
      star: 'w-3 h-3',
      text: 'text-xs',
      container: 'px-1.5 py-0.5'
    },
    md: {
      star: 'w-2.5 h-2.5 md:w-3.5 md:h-3.5',
      text: 'text-xs',
      container: 'px-1 py-0.5 md:px-2 md:py-1'
    },
    lg: {
      star: 'w-3.5 h-3.5 md:w-4 md:h-4',
      text: 'text-xs md:text-sm',
      container: 'px-2 py-1 md:px-3 md:py-1.5'
    }
  };

  const variantClasses = {
    badge: 'bg-amber-50 border border-amber-200 rounded-full',
    full: 'bg-amber-50 border border-amber-200 rounded-full',
    narrow: 'bg-amber-50 border border-amber-200 rounded-md'
  };

  const renderStars = () => {
    if (variant === 'badge') {
      // Original single star for badge
      return (
        <Star className={`${sizeClasses[size].star} text-amber-500 fill-current mr-1`} />
      );
    } else {
      // Multiple stars for full/narrow variants
      return Array.from({ length: maxRating }, (_, index) => (
        <Star
          key={index}
          className={`${sizeClasses[size].star} ${
            index < Math.floor(rating)
              ? 'text-amber-500 fill-current'
              : 'text-gray-300'
          }`}
        />
      ));
    }
  };

  return (
    <div className={`flex items-center ${variantClasses[variant]} ${sizeClasses[size].container} ${className}`}>
      {variant === 'narrow' ? (
        // Narrow version - just stars, no text
        <div className="flex items-center space-x-0.5">
          {renderStars()}
        </div>
      ) : (
        // Badge/Full versions - stars + optional text
        <>
          {variant === 'full' ? (
            <div className="flex items-center space-x-0.5 mr-1">
              {renderStars()}
            </div>
          ) : (
            renderStars()
          )}
          {showText && (
            <span className={`${sizeClasses[size].text} font-medium text-amber-700`}>
              {variant === 'full' ? `${Math.round(rating)}/${maxRating}` : (rating ? Math.round(rating).toString() : '0')}
            </span>
          )}
        </>
      )}
    </div>
  );
};