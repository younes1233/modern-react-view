import { useState, useEffect, ImgHTMLAttributes } from 'react';
import { getBestImageUrl, getImageFallbackUrls, imageLoadCache, ResponsiveImageUrls } from '@/utils/imageUtils';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'loading'> {
  src: string | ResponsiveImageUrls | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean; // For hero images that should load immediately
  fetchpriority?: 'high' | 'low' | 'auto'; // Priority hint for browser (lowercase per React spec)
}

/**
 * OptimizedImage component with intelligent fallback system:
 * - Uses device-appropriate image (detected once on initial load)
 * - Automatically tries fallback URLs if primary fails
 * - Caches successful loads to avoid retrying failed images
 * - Lazy loading (unless eager prop is true)
 * - Async decoding for better performance
 * - Smooth transitions
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  eager = false,
  fetchpriority,
  ...props
}: OptimizedImageProps) {
  const [currentSrc, setCurrentSrc] = useState<string>('');
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [fallbackUrls] = useState<string[]>(() => getImageFallbackUrls(src));

  // Initialize with best URL on mount
  useEffect(() => {
    const bestUrl = getBestImageUrl(src);
    setCurrentSrc(bestUrl);

    // Check if this URL was previously loaded successfully
    if (imageLoadCache.isLoaded(bestUrl) === true) {
      setIsLoading(false);
    }
  }, [src]);

  const handleError = () => {
    // Mark current URL as failed
    imageLoadCache.markAsFailed(currentSrc);

    // Try next fallback URL
    const nextIndex = fallbackIndex + 1;
    if (nextIndex < fallbackUrls.length) {
      setFallbackIndex(nextIndex);
      setCurrentSrc(fallbackUrls[nextIndex]);
    } else {
      // All fallbacks exhausted, use placeholder
      setCurrentSrc('/placeholder-product.png');
      setIsLoading(false);
    }
  };

  const handleLoad = () => {
    // Mark as successfully loaded
    imageLoadCache.markAsLoaded(currentSrc);
    setIsLoading(false);
  };

  if (!currentSrc) {
    return (
      <div className="relative w-full h-full">
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}
      <img
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        loading={eager ? 'eager' : 'lazy'}
        fetchpriority={fetchpriority || (eager ? 'high' : 'auto')}
        decoding="async"
        onError={handleError}
        onLoad={handleLoad}
        {...props}
      />
    </div>
  );
}
