// Meta Pixel Service - Following Meta's 2024 Best Practices
// Reference: https://developers.facebook.com/docs/meta-pixel/implementation

declare global {
  interface Window {
    fbq: any;
    _fbq: any;
    __META_PIXEL_INITIALIZED__?: boolean;
    __META_PIXEL_SCRIPT_LOADED__?: boolean;
  }
}

export interface ProductData {
  content_id: string;
  content_name: string;
  content_category?: string;
  quantity?: number;
  item_price?: number;
  currency?: string;
  brand?: string;
}

export interface StandardEventData {
  content_ids?: string[];
  content_type?: 'product' | 'product_group';
  contents?: ProductData[];
  currency?: string;
  value?: number;
  num_items?: number;
  search_string?: string;
  content_name?: string;
  content_category?: string;
  predicted_ltv?: number;
}

class MetaPixelService {
  private pixelId = import.meta.env.VITE_META_PIXEL_ID || '';
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  private initialPageViewTracked = false;

  async initialize(): Promise<void> {
    // Return immediately if already initialized
    if (this.isInitialized) {
      return Promise.resolve();
    }

    // Return existing promise if initialization is in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this.loadPixel();
    return this.initializationPromise;
  }

  private async loadPixel(): Promise<void> {
    if (this.isInitialized || !this.pixelId) {
      console.warn('Meta Pixel ID not provided or already initialized');
      return;
    }

    // Check global flag to prevent any duplicate initialization attempts
    if (window.__META_PIXEL_INITIALIZED__) {
      console.log('Meta Pixel already initialized globally, skipping');
      this.isInitialized = true;
      return;
    }

    // Check if script is already loaded to prevent duplicate loading
    if (window.__META_PIXEL_SCRIPT_LOADED__) {
      console.log('Meta Pixel script already loaded, skipping script injection');
      this.isInitialized = true;
      window.__META_PIXEL_INITIALIZED__ = true;
      return Promise.resolve();
    }

    // Check if fbq already exists globally to prevent duplicate initialization
    if (window.fbq && typeof window.fbq === 'function') {
      console.log('Meta Pixel already loaded, skipping script injection');
      this.isInitialized = true;
      window.__META_PIXEL_INITIALIZED__ = true;
      window.__META_PIXEL_SCRIPT_LOADED__ = true;
      return Promise.resolve();
    }

    // Additional check: look for any existing fbq initialization for our pixel ID
    if (window.fbq && window.fbq._initData && window.fbq._initData[this.pixelId]) {
      console.log(`Meta Pixel already initialized for ID: ${this.pixelId}`);
      this.isInitialized = true;
      window.__META_PIXEL_INITIALIZED__ = true;
      window.__META_PIXEL_SCRIPT_LOADED__ = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      try {
        // Check if script tag already exists
        const existingScript = document.querySelector('script[src*="fbevents.js"]');
        if (existingScript) {
          console.log('Meta Pixel script tag already exists');
          this.isInitialized = true;
          window.__META_PIXEL_INITIALIZED__ = true;
          window.__META_PIXEL_SCRIPT_LOADED__ = true;
          resolve();
          return;
        }

        // Meta Pixel Base Code - 2024 Version
        (function(f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return;
          n = f.fbq = function() {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
          };
          if (!f._fbq) f._fbq = n;
          n.push = n;
          n.loaded = !0;
          n.version = '2.0';
          n.queue = [];
          t = b.createElement(e);
          t.async = !0;
          t.src = v;
          t.onload = () => {
            console.log('Meta Pixel script loaded successfully');
            this.isInitialized = true;
            window.__META_PIXEL_INITIALIZED__ = true;
            window.__META_PIXEL_SCRIPT_LOADED__ = true;
            resolve();
          };
          t.onerror = () => {
            console.error('Failed to load Meta Pixel script');
            reject(new Error('Meta Pixel script failed to load'));
          };
          s = b.getElementsByTagName(e)[0];
          s.parentNode?.insertBefore(t, s);
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

        // Only initialize if not already initialized for this pixel ID
        if (!window.fbq.disablePushState && !window.fbq._initData?.[this.pixelId]) {
          window.fbq('init', this.pixelId);
          // Track initial page view only once during initialization
          window.fbq('track', 'PageView');
          this.initialPageViewTracked = true;
          console.log(`Meta Pixel initialized with ID: ${this.pixelId}`);
        } else {
          console.log(`Meta Pixel init skipped - already initialized for ID: ${this.pixelId}`);
          this.initialPageViewTracked = true; // Consider it tracked if already initialized
        }

        // Set up error handling
        window.fbq('set', 'autoConfig', false, this.pixelId);
        
      } catch (error) {
        console.error('Meta Pixel initialization error:', error);
        reject(error);
      }
    });
  }

  private async trackEvent(eventName: string, eventData?: StandardEventData): Promise<void> {
    await this.initialize();
    
    if (!window.fbq || !this.isInitialized) {
      console.warn('Meta Pixel not available');
      return;
    }

    try {
      if (eventData) {
        // Clean and validate event data
        const cleanedData = this.cleanEventData(eventData);
        window.fbq('track', eventName, cleanedData);
        console.log(`Meta Pixel tracked: ${eventName}`, cleanedData);
      } else {
        window.fbq('track', eventName);
        console.log(`Meta Pixel tracked: ${eventName}`);
      }
    } catch (error) {
      console.error(`Meta Pixel tracking error for ${eventName}:`, error);
    }
  }

  private cleanEventData(data: StandardEventData): StandardEventData {
    const cleaned: StandardEventData = {};
    
    // Only include defined values and ensure correct types
    if (data.content_ids?.length) cleaned.content_ids = data.content_ids;
    if (data.content_type) cleaned.content_type = data.content_type;
    if (data.contents?.length) cleaned.contents = data.contents;
    if (data.currency) cleaned.currency = data.currency;
    if (typeof data.value === 'number' && data.value >= 0) cleaned.value = Number(data.value.toFixed(2));
    if (typeof data.num_items === 'number' && data.num_items > 0) cleaned.num_items = data.num_items;
    if (data.search_string) cleaned.search_string = data.search_string.trim();
    if (data.content_name) cleaned.content_name = data.content_name;
    if (data.content_category) cleaned.content_category = data.content_category;
    if (typeof data.predicted_ltv === 'number') cleaned.predicted_ltv = data.predicted_ltv;

    return cleaned;
  }

  // Standard Events Implementation

  async trackPageView(): Promise<void> {
    // Only track PageView if this is not the initial load
    // (initial PageView is tracked during initialization)
    if (!this.initialPageViewTracked) {
      await this.trackEvent('PageView');
      this.initialPageViewTracked = true;
    } else {
      // For subsequent page views (route changes), track normally
      await this.trackEvent('PageView');
    }
  }

  async trackViewContent(product: any): Promise<void> {
    const eventData: StandardEventData = {
      content_ids: [this.getProductId(product)],
      content_type: 'product',
      content_name: product.name,
      content_category: this.getProductCategory(product),
      value: this.getProductPrice(product),
      currency: this.getProductCurrency(product)
    };
    
    await this.trackEvent('ViewContent', eventData);
  }

  async trackAddToCart(product: any, quantity = 1): Promise<void> {
    const price = this.getProductPrice(product);
    const productId = this.getProductId(product);
    const currency = this.getProductCurrency(product);
    
    const eventData: StandardEventData = {
      content_ids: [productId],
      content_type: 'product',
      contents: [{
        content_id: productId,
        content_name: product.name,
        content_category: this.getProductCategory(product),
        quantity: quantity,
        item_price: price,
        currency: currency,
        brand: this.getProductBrand(product)
      }],
      value: price * quantity,
      currency: currency
    };
    
    await this.trackEvent('AddToCart', eventData);
  }

  async trackAddToWishlist(product: any): Promise<void> {
    const eventData: StandardEventData = {
      content_ids: [this.getProductId(product)],
      content_type: 'product',
      content_name: product.name,
      content_category: this.getProductCategory(product),
      value: this.getProductPrice(product),
      currency: 'USD'
    };
    
    await this.trackEvent('AddToWishlist', eventData);
  }

  async trackInitiateCheckout(cartItems: any[], totalValue: number): Promise<void> {
    const contents = cartItems.map(item => ({
      content_id: item.product?.id?.toString() || item.id?.toString() || 'unknown',
      content_name: item.product?.name || 'Unknown Product',
      content_category: this.getProductCategory(item.product),
      quantity: item.quantity || 1,
      item_price: item.price || 0,
      currency: item.product?.pricing?.currency?.code || 'USD',
      brand: this.getProductBrand(item.product)
    }));

    // Get currency from first item or default to USD
    const currency = cartItems[0]?.product?.pricing?.currency?.code || 'USD';

    const eventData: StandardEventData = {
      content_ids: contents.map(c => c.content_id),
      content_type: 'product',
      contents: contents,
      value: totalValue,
      currency: currency,
      num_items: cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
    };
    
    await this.trackEvent('InitiateCheckout', eventData);
  }

  async trackPurchase(orderData: any): Promise<void> {
    const items = orderData.items || orderData.products || [];
    const contents = items.map((item: any) => ({
      content_id: this.getProductId(item.product || item),
      content_name: (item.product?.name || item.name || 'Unknown Product'),
      content_category: this.getProductCategory(item.product || item),
      quantity: item.quantity || 1,
      item_price: item.price || item.unit_price || 0,
      currency: orderData.currency || 'USD',
      brand: (item.product?.brand || item.brand || 'MeemHome')
    }));

    const eventData: StandardEventData = {
      content_ids: contents.map((c: any) => c.content_id),
      content_type: 'product',
      contents: contents,
      value: orderData.total || orderData.totalAmount || orderData.amount,
      currency: orderData.currency || 'USD',
      num_items: contents.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
    };
    
    await this.trackEvent('Purchase', eventData);
  }

  async trackSearch(searchQuery: string, results?: any[]): Promise<void> {
    const eventData: StandardEventData = {
      search_string: searchQuery,
      content_type: 'product'
    };

    if (results && results.length > 0) {
      eventData.content_ids = results.slice(0, 25).map(p => this.getProductId(p));
    }
    
    await this.trackEvent('Search', eventData);
  }

  async trackCompleteRegistration(method = 'email'): Promise<void> {
    const eventData: StandardEventData = {
      content_name: method
    };
    
    await this.trackEvent('CompleteRegistration', eventData);
  }

  async trackLead(leadValue?: number): Promise<void> {
    const eventData: StandardEventData = {};
    
    if (typeof leadValue === 'number') {
      eventData.value = leadValue;
      eventData.currency = 'USD';
    }
    
    await this.trackEvent('Lead', eventData);
  }

  // Custom Events for Enhanced Tracking
  async trackCustomEvent(eventName: string, parameters: Record<string, any> = {}): Promise<void> {
    await this.initialize();
    
    if (!window.fbq || !this.isInitialized) {
      console.warn('Meta Pixel not available');
      return;
    }

    try {
      window.fbq('trackCustom', eventName, parameters);
      console.log(`Meta Pixel custom event tracked: ${eventName}`, parameters);
    } catch (error) {
      console.error(`Meta Pixel custom tracking error for ${eventName}:`, error);
    }
  }

  // Enhanced E-commerce Events
  async trackProductListView(products: any[], listName?: string): Promise<void> {
    await this.trackCustomEvent('ViewCategory', {
      content_ids: products.slice(0, 25).map(p => this.getProductId(p)),
      content_type: 'product',
      num_items: products.length,
      content_category: listName
    });
  }

  async trackFilterUsage(filterType: string, filterValue: string): Promise<void> {
    await this.trackCustomEvent('ProductFilter', {
      filter_type: filterType,
      filter_value: filterValue
    });
  }

  async trackNewsletterSignup(): Promise<void> {
    await this.trackLead();
    await this.trackCustomEvent('NewsletterSignup', {
      signup_source: 'website'
    });
  }

  // Advanced Features - Updated for your User structure
  async setUserData(userData: {
    email?: string;
    phone?: string;
    firstName?: string;
    lastName?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    externalId?: string;
  }): Promise<void> {
    await this.initialize();
    
    if (!window.fbq || !this.isInitialized) return;

    try {
      const userData_clean: any = {};
      
      // Validate and clean email
      if (userData.email && this.isValidEmail(userData.email)) {
        userData_clean.em = userData.email.toLowerCase().trim();
      }
      
      // Validate and clean phone (must be at least 7 digits)
      if (userData.phone) {
        const cleanPhone = userData.phone.replace(/\D/g, '');
        if (cleanPhone.length >= 7) {
          userData_clean.ph = cleanPhone;
        }
      }
      
      if (userData.firstName && userData.firstName.trim().length > 0) {
        userData_clean.fn = userData.firstName.toLowerCase().trim();
      }
      if (userData.lastName && userData.lastName.trim().length > 0) {
        userData_clean.ln = userData.lastName.toLowerCase().trim();
      }
      if (userData.city && userData.city.trim().length > 0) {
        userData_clean.ct = userData.city.toLowerCase().trim();
      }
      if (userData.state && userData.state.trim().length > 0) {
        userData_clean.st = userData.state.toLowerCase().trim();
      }
      if (userData.country && userData.country.trim().length > 0) {
        userData_clean.country = userData.country.toLowerCase().trim();
      }
      if (userData.zipCode && userData.zipCode.trim().length > 0) {
        userData_clean.zp = userData.zipCode.replace(/\s/g, '');
      }
      if (userData.externalId && userData.externalId.trim().length > 0) {
        userData_clean.external_id = userData.externalId.toString().trim();
      }

      // Only send data if we have valid fields
      if (Object.keys(userData_clean).length > 0) {
        window.fbq('init', this.pixelId, userData_clean);
        console.log('Meta Pixel user data updated with fields:', Object.keys(userData_clean));
      }
    } catch (error) {
      console.error('Failed to set Meta Pixel user data:', error);
    }
  }

  // Helper method to validate email format
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  // Utility methods - Updated for your actual data structure
  private getProductId(product: any): string {
    return product?.id?.toString() || product?.slug || 'unknown';
  }

  private getProductCategory(product: any): string {
    // Check for category in product details or from breadcrumb path
    return product?.category?.name || 
           product?.categories?.[0]?.name || 
           product?.category?.path?.[0]?.name ||
           'Uncategorized';
  }

  private getProductPrice(product: any): number {
    // Use your actual pricing structure
    return product?.pricing?.price || 0;
  }

  private getProductCurrency(product: any): string {
    // Use your actual currency structure
    return product?.pricing?.currency?.code || 'USD';
  }

  private getProductBrand(product: any): string {
    return product?.brand || product?.seller || 'MeemHome';
  }

  // Debugging and validation
  isReady(): boolean {
    return this.isInitialized && !!window.fbq;
  }

  getPixelId(): string {
    return this.pixelId;
  }

  isInitialPageViewTracked(): boolean {
    return this.initialPageViewTracked;
  }
}

// Export singleton instance
export const metaPixelService = new MetaPixelService();