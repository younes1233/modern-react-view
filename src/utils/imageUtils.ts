/**
 * Image utility functions for intelligent fallback and caching
 * - Detects device type only on initial load (no resize detection)
 * - Uses cached/loaded images instead of reloading on resize
 * - Provides intelligent fallback hierarchy
 */

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveImageUrls {
  desktop?: string;
  tablet?: string;
  mobile?: string;
  original?: string;
}

/**
 * Get device type ONCE on initial load - never changes during session
 */
let cachedDeviceType: DeviceType | null = null;

export const getInitialDeviceType = (): DeviceType => {
  if (cachedDeviceType) return cachedDeviceType;

  if (typeof window === 'undefined') {
    cachedDeviceType = 'desktop';
    return cachedDeviceType;
  }

  const width = window.innerWidth;
  if (width < 768) {
    cachedDeviceType = 'mobile';
  } else if (width < 1024) {
    cachedDeviceType = 'tablet';
  } else {
    cachedDeviceType = 'desktop';
  }

  return cachedDeviceType;
};

/**
 * Get the best image URL based on initial device type with intelligent fallbacks
 * Fallback priority:
 * 1. Current device size
 * 2. Larger sizes (better to scale down than up)
 * 3. Smaller sizes (if no larger available)
 * 4. Original
 * 5. Placeholder
 */
export const getBestImageUrl = (
  image: string | ResponsiveImageUrls | null | undefined
): string => {
  // Handle null/undefined
  if (!image) {
    return '/placeholder-product.png';
  }

  // Handle simple string URL
  if (typeof image === 'string') {
    return image || '/placeholder-product.png';
  }

  // Handle responsive image object
  const urls = image as ResponsiveImageUrls;
  const deviceType = getInitialDeviceType();

  // Try exact match first
  if (deviceType === 'mobile' && urls.mobile) return urls.mobile;
  if (deviceType === 'tablet' && urls.tablet) return urls.tablet;
  if (deviceType === 'desktop' && urls.desktop) return urls.desktop;

  // Fallback strategy: prefer larger images (scale down better than up)
  if (deviceType === 'mobile') {
    return urls.tablet || urls.desktop || urls.original || '/placeholder-product.png';
  }

  if (deviceType === 'tablet') {
    return urls.desktop || urls.mobile || urls.original || '/placeholder-product.png';
  }

  // Desktop fallbacks
  return urls.tablet || urls.mobile || urls.original || '/placeholder-product.png';
};

/**
 * Get all possible image URLs in priority order for fallback attempts
 */
export const getImageFallbackUrls = (
  image: string | ResponsiveImageUrls | null | undefined
): string[] => {
  if (!image) return ['/placeholder-product.png'];
  if (typeof image === 'string') return [image, '/placeholder-product.png'];

  const urls = image as ResponsiveImageUrls;
  const deviceType = getInitialDeviceType();
  const fallbacks: string[] = [];

  // Priority 1: Current device
  if (deviceType === 'mobile' && urls.mobile) fallbacks.push(urls.mobile);
  if (deviceType === 'tablet' && urls.tablet) fallbacks.push(urls.tablet);
  if (deviceType === 'desktop' && urls.desktop) fallbacks.push(urls.desktop);

  // Priority 2-3: Other sizes (larger first)
  if (deviceType === 'mobile') {
    if (urls.tablet && !fallbacks.includes(urls.tablet)) fallbacks.push(urls.tablet);
    if (urls.desktop && !fallbacks.includes(urls.desktop)) fallbacks.push(urls.desktop);
  } else if (deviceType === 'tablet') {
    if (urls.desktop && !fallbacks.includes(urls.desktop)) fallbacks.push(urls.desktop);
    if (urls.mobile && !fallbacks.includes(urls.mobile)) fallbacks.push(urls.mobile);
  } else {
    if (urls.tablet && !fallbacks.includes(urls.tablet)) fallbacks.push(urls.tablet);
    if (urls.mobile && !fallbacks.includes(urls.mobile)) fallbacks.push(urls.mobile);
  }

  // Priority 4: Original
  if (urls.original && !fallbacks.includes(urls.original)) {
    fallbacks.push(urls.original);
  }

  // Priority 5: Placeholder
  fallbacks.push('/placeholder-product.png');

  return fallbacks;
};

/**
 * Simple in-memory cache for image load status
 * Persists during session but doesn't use localStorage (lighter weight)
 */
class ImageLoadCache {
  private cache: Map<string, boolean> = new Map();

  markAsLoaded(url: string): void {
    this.cache.set(url, true);
  }

  markAsFailed(url: string): void {
    this.cache.set(url, false);
  }

  isLoaded(url: string): boolean | undefined {
    return this.cache.get(url);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const imageLoadCache = new ImageLoadCache();
