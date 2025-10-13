export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  details?: T;
}

class BaseApiService {
  protected baseURL = import.meta.env.VITE_API_BASE_URL || 'https://meemhome.com/api';
  private static token: string | null = null;
  private apiSecret = import.meta.env.VITE_API_SECRET || '';
  private static isRefreshing = false;
  private static refreshPromise: Promise<string> | null = null;

  constructor() {
    // Get token from localStorage on initialization if not already loaded
    if (!BaseApiService.token) {
      const storedToken = localStorage.getItem('auth_token');
      if (storedToken) {
        BaseApiService.token = storedToken;
        console.log('Token loaded from localStorage on service initialization');
      }
    }
  }

  // Set authentication token - make it public so child classes can access it
  setToken(token: string) {
    BaseApiService.token = token;
    localStorage.setItem('auth_token', token);
  }

  // Remove authentication token - make it public so child classes can access it
  removeToken() {
    BaseApiService.token = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Refresh the authentication token
  private async refreshToken(): Promise<string> {
    console.log('🔄 Attempting to refresh token...');

    // If already refreshing, return the existing promise
    if (BaseApiService.isRefreshing && BaseApiService.refreshPromise) {
      console.log('⏳ Token refresh already in progress, waiting...');
      return BaseApiService.refreshPromise;
    }

    BaseApiService.isRefreshing = true;
    BaseApiService.refreshPromise = (async () => {
      try {
        const response = await fetch(`${this.baseURL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-API-SECRET': this.apiSecret,
            'Authorization': `Bearer ${BaseApiService.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Token refresh failed');
        }

        const data = await response.json();

        if (data.error || !data.details?.token) {
          throw new Error('Invalid refresh response');
        }

        const newToken = data.details.token;
        this.setToken(newToken);
        console.log('✅ Token refreshed successfully');

        return newToken;
      } catch (error) {
        console.error('❌ Token refresh failed:', error);
        // Clear everything on refresh failure
        this.removeToken();

        // For store frontend, just clear auth and stay on current page
        // Don't redirect to login as this is a store app, not admin
        console.log('🔒 Token refresh failed, clearing authentication');
        // Let the app handle the unauthenticated state gracefully

        throw error;
      } finally {
        BaseApiService.isRefreshing = false;
        BaseApiService.refreshPromise = null;
      }
    })();

    return BaseApiService.refreshPromise;
  }

  // Generic request method
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeCredentials: boolean = false
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Build headers with required API secret and optional Bearer token
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'X-API-SECRET': this.apiSecret,
    };

    // Only add Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Add Bearer token if available
    if (BaseApiService.token) {
      headers['Authorization'] = `Bearer ${BaseApiService.token}`;
    }

    // Merge with any additional headers, but don't override Content-Type for FormData
    if (options.headers) {
      const additionalHeaders = options.headers as Record<string, string>;
      Object.keys(additionalHeaders).forEach(key => {
        if (key !== 'Content-Type' || !(options.body instanceof FormData)) {
          headers[key] = additionalHeaders[key];
        }
      });
    }
    
    const config: RequestInit = {
      ...options,
      headers,
      ...(includeCredentials && { credentials: 'include' }), // Only include credentials when needed
    };

    console.log('API Request:', {
      method: config.method || 'GET',
      url,
      includeCredentials,
      isFormData: options.body instanceof FormData,
      headers: {
        ...headers,
        'X-API-SECRET': '[HIDDEN]', // Don't log the actual secret
        'Authorization': BaseApiService.token ? '[HIDDEN]' : 'Not set'
      }
    });

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // Handle 401 Unauthorized - try to refresh token
        if (response.status === 401 && endpoint !== '/auth/refresh' && endpoint !== '/auth/login') {
          console.warn('🔒 Received 401, attempting token refresh...');

          try {
            // Attempt token refresh
            await this.refreshToken();

            // Retry the original request with new token
            console.log('🔁 Retrying original request with new token...');
            const newHeaders = { ...headers };
            if (BaseApiService.token) {
              newHeaders['Authorization'] = `Bearer ${BaseApiService.token}`;
            }

            const retryConfig: RequestInit = {
              ...config,
              headers: newHeaders,
            };

            const retryResponse = await fetch(url, retryConfig);

            if (!retryResponse.ok) {
              throw new Error('Retry failed after token refresh');
            }

            return await retryResponse.json();
          } catch (refreshError) {
            console.error('❌ Token refresh or retry failed:', refreshError);
            // Token refresh failed, let it fall through to normal error handling
          }
        }

        let errorData: any = {};
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

        try {
          errorData = await response.json();
          console.error('API Error Response:', errorData);

          // Build detailed error message
          if (errorData.message) {
            errorMessage = errorData.message;
          }

          // Add validation details if available
          if (errorData.errors) {
            const validationErrors = Array.isArray(errorData.errors)
              ? errorData.errors.join(', ')
              : Object.entries(errorData.errors)
                  .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
                  .join('; ');
            errorMessage += ` - Validation errors: ${validationErrors}`;
          }

          // Add details if available
          if (errorData.details && typeof errorData.details === 'object') {
            const detailsStr = JSON.stringify(errorData.details);
            errorMessage += ` - Details: ${detailsStr}`;
          }

        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
        }

        const error = new Error(errorMessage) as any;
        error.status = response.status;
        error.details = errorData.errors || errorData.details || {}; // Preserve validation errors
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // HTTP method helpers with optional credentials
  protected get<T>(endpoint: string, includeCredentials: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, includeCredentials);
  }

  protected post<T>(endpoint: string, data?: any, includeCredentials: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, includeCredentials);
  }

  protected postFormData<T>(endpoint: string, formData: FormData, includeCredentials: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: formData,
    }, includeCredentials);
  }

  protected put<T>(endpoint: string, data?: any, includeCredentials: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }, includeCredentials);
  }

  protected putFormData<T>(endpoint: string, formData: FormData, includeCredentials: boolean = false): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: formData,
    }, includeCredentials);
  }

  protected delete<T>(endpoint: string, includeCredentials: boolean = false): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeCredentials);
  }

  // Get current token
  getToken(): string | null {
    return BaseApiService.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!BaseApiService.token;
  }
}

export default BaseApiService;