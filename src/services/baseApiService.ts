
export interface ApiResponse<T = any> {
  error: boolean;
  message: string;
  details?: T;
}

class BaseApiService {
  protected baseURL = 'https://meemhome.com/api';
  private static token: string | null = null;
  private apiSecret = 'qpBRMrOphIamxNVLNyzsHCCQGTBmLV33';

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
  }

  // Generic request method
  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Build headers with required API secret and optional Bearer token
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-API-SECRET': this.apiSecret,
    };

    // Add Bearer token if available
    if (BaseApiService.token) {
      headers['Authorization'] = `Bearer ${BaseApiService.token}`;
    }

    // Merge with any additional headers
    if (options.headers) {
      Object.assign(headers, options.headers);
    }
    
    const config: RequestInit = {
      ...options,
      headers,
    };

    console.log('API Request:', {
      method: config.method || 'GET',
      url,
      headers: {
        ...headers,
        'X-API-SECRET': '[HIDDEN]', // Don't log the actual secret
        'Authorization': BaseApiService.token ? '[HIDDEN]' : 'Not set'
      }
    });

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // GET request
  protected async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  // POST request
  protected async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  protected async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  protected async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
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
