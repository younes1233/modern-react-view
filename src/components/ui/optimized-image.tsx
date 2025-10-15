import { useState, useEffect, ImgHTMLAttributes, useRef } from 'react';
import { getBestImageUrl, getImageFallbackUrls, imageLoadCache, ResponsiveImageUrls } from '@/utils/imageUtils';
import { imageRegistry } from '@/services/imageRegistry';

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'loading'> {
  src: string | ResponsiveImageUrls | null | undefined;
  alt: string;
  className?: string;
  eager?: boolean; // For hero images that should load immediately
  fetchpriority?: 'high' | 'low' | 'auto'; // Priority hint for browser (lowercase per React spec)
  productId?: number; // Optional: Register loaded image for this product
  productSlug?: string; // Optional: Product slug for slug-based lookups
  variantId?: number; // Optional: Register loaded image for this product variant
}

/**
 * OptimizedImage component with intelligent fallback system:
 * - Uses device-appropriate image (detected once on initial load)
 * - Automatically tries fallback URLs if primary fails
 * - Caches successful loads to avoid retrying failed images
 * - Lazy loading (unless eager prop is true)
 * - Async decoding for better performance
 * - Smooth transitions
 * - Auto-registers loaded images to ImageRegistry for reuse
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  eager = false,
  fetchpriority,
  productId,
  productSlug,
  variantId,
  ...props
}: OptimizedImageProps) {
  const [fallbackUrls] = useState<string[]>(() => getImageFallbackUrls(src));
  const bestUrl = getBestImageUrl(src);

  // Check cache immediately - don't wait for useEffect
  const isCached = imageLoadCache.isLoaded(bestUrl) === true;

  const [currentSrc, setCurrentSrc] = useState<string>(bestUrl);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(!isCached);
  const imgRef = useRef<HTMLImageElement>(null);

  // Update src when prop changes
  useEffect(() => {
    const newBestUrl = getBestImageUrl(src);
    setCurrentSrc(newBestUrl);

    // If already loaded, don't show loading state
    if (imageLoadCache.isLoaded(newBestUrl) === true) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
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

    // Register image in ImageRegistry if productId or variantId is provided
    if (imgRef.current?.currentSrc) {
      // Register variant image if variantId provided
      if (variantId) {
        imageRegistry.registerVariant(variantId, imgRef.current.currentSrc);
      }

      // Also register product image if productId provided
      if (productId) {
        imageRegistry.register(productId, imgRef.current.currentSrc, productSlug);
      }
    }
  };

  // Check if image loaded instantly from cache
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current?.naturalHeight !== 0) {
      // Image is already in browser cache and loaded
      setIsLoading(false);
      imageLoadCache.markAsLoaded(currentSrc);
    }
  }, [currentSrc]);

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
        ref={imgRef}
        src={currentSrc}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-${isCached ? '0' : '200'}`}
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
