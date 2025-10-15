/**
 * ImageRegistry - Global image cache service
 *
 * Automatically registers loaded product images so they can be reused
 * throughout the app without re-fetching. This is especially useful for:
 * - Cart notifications (reuse already-loaded product images)
 * - Related products (reuse images from main product)
 * - Quick navigation (instant image display)
 *
 * Usage:
 * - OptimizedImage component auto-registers images when they load
 * - CartContext uses registered images for notifications
 * - Any component can query for cached image URLs
 */

interface ImageEntry {
  url: string;
  timestamp: number;
  productSlug?: string;
}

class ImageRegistry {
  private registry = new Map<number, ImageEntry>();
  private variantRegistry = new Map<number, ImageEntry>(); // variantId -> image
  private slugIndex = new Map<string, number>(); // slug -> productId lookup
  private maxAge = 10 * 60 * 1000; // 10 minutes cache

  /**
   * Register a loaded image for a product
   * @param productId - Product ID
   * @param imageUrl - The actual loaded image URL (from img.currentSrc)
   * @param productSlug - Optional product slug for slug-based lookups
   */
  register(productId: number, imageUrl: string, productSlug?: string): void {
    if (!productId || !imageUrl) return;

    this.registry.set(productId, {
      url: imageUrl,
      timestamp: Date.now(),
      productSlug,
    });

    // Also index by slug if provided
    if (productSlug) {
      this.slugIndex.set(productSlug, productId);
    }
  }

  /**
   * Register a loaded image for a product variant
   * @param variantId - Product Variant ID
   * @param imageUrl - The actual loaded image URL (from img.currentSrc)
   */
  registerVariant(variantId: number, imageUrl: string): void {
    if (!variantId || !imageUrl) return;

    this.variantRegistry.set(variantId, {
      url: imageUrl,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached image URL by product ID
   * @param productId - Product ID
   * @returns Cached image URL or null if not found/expired
   */
  get(productId: number): string | null {
    if (!productId) return null;

    const entry = this.registry.get(productId);
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.registry.delete(productId);
      return null;
    }

    return entry.url;
  }

  /**
   * Get cached image URL for a product variant
   * @param variantId - Product Variant ID
   * @returns Cached image URL or null if not found/expired
   */
  getVariant(variantId: number): string | null {
    if (!variantId) return null;

    const entry = this.variantRegistry.get(variantId);
    if (!entry) return null;

    // Check if cache is still valid
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.variantRegistry.delete(variantId);
      return null;
    }

    return entry.url;
  }

  /**
   * Get cached image URL by product slug
   * @param slug - Product slug
   * @returns Cached image URL or null if not found/expired
   */
  getBySlug(slug: string): string | null {
    if (!slug) return null;

    const productId = this.slugIndex.get(slug);
    if (!productId) return null;

    return this.get(productId);
  }

  /**
   * Check if a product image is cached
   * @param productId - Product ID
   * @returns true if cached and not expired
   */
  has(productId: number): boolean {
    return this.get(productId) !== null;
  }

  /**
   * Check if a variant image is cached
   * @param variantId - Product Variant ID
   * @returns true if cached and not expired
   */
  hasVariant(variantId: number): boolean {
    return this.getVariant(variantId) !== null;
  }

  /**
   * Clear expired entries (called periodically)
   */
  cleanup(): void {
    const now = Date.now();
    const entriesToDelete: number[] = [];
    const variantEntriesToDelete: number[] = [];

    // Clean up product images
    this.registry.forEach((entry, productId) => {
      if (now - entry.timestamp > this.maxAge) {
        entriesToDelete.push(productId);
        if (entry.productSlug) {
          this.slugIndex.delete(entry.productSlug);
        }
      }
    });

    // Clean up variant images
    this.variantRegistry.forEach((entry, variantId) => {
      if (now - entry.timestamp > this.maxAge) {
        variantEntriesToDelete.push(variantId);
      }
    });

    entriesToDelete.forEach(id => this.registry.delete(id));
    variantEntriesToDelete.forEach(id => this.variantRegistry.delete(id));
  }

  /**
   * Clear all cached images
   */
  clear(): void {
    this.registry.clear();
    this.variantRegistry.clear();
    this.slugIndex.clear();
  }

  /**
   * Get cache statistics (for debugging)
   */
  getStats() {
    return {
      totalCached: this.registry.size,
      totalVariantsCached: this.variantRegistry.size,
      oldestEntry: Math.min(
        ...Array.from(this.registry.values()).map(e => e.timestamp)
      ),
      newestEntry: Math.max(
        ...Array.from(this.registry.values()).map(e => e.timestamp)
      ),
    };
  }
}

// Singleton instance
export const imageRegistry = new ImageRegistry();

// Cleanup expired entries every 5 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    imageRegistry.cleanup();
  }, 5 * 60 * 1000);
}
