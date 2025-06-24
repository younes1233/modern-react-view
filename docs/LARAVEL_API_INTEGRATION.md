# Laravel API Integration Guide

Complete guide for integrating your React e-commerce project with Laravel backend APIs.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Laravel Backend Structure](#laravel-backend-structure)
5. [Frontend Integration Strategy](#frontend-integration-strategy)
6. [Implementation Phases](#implementation-phases)
7. [API Service Layer](#api-service-layer)
8. [Authentication Integration](#authentication-integration)
9. [Data Integration](#data-integration)
10. [Error Handling](#error-handling)
11. [Security Best Practices](#security-best-practices)
12. [Testing Strategy](#testing-strategy)
13. [Deployment Considerations](#deployment-considerations)
14. [Troubleshooting](#troubleshooting)

## Overview

Your React e-commerce project currently uses mock data and localStorage for persistence. This guide will help you integrate it with a Laravel backend API to create a production-ready application.

### Current Architecture
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **State Management**: React Context API
- **Data Storage**: Mock data + localStorage
- **Authentication**: Mock authentication system

### Target Architecture
- **Frontend**: React + TypeScript (unchanged)
- **Backend**: Laravel API
- **Database**: MySQL/PostgreSQL
- **Authentication**: Laravel Sanctum
- **File Storage**: Laravel Storage + Cloud Storage

## Prerequisites

### Laravel Requirements
- PHP 8.1+
- Composer
- Laravel 10+
- MySQL/PostgreSQL database
- Redis (recommended for caching)

### Required Laravel Packages
```bash
composer require laravel/sanctum
composer require spatie/laravel-query-builder
composer require intervention/image
composer require maatwebsite/excel
```

### Frontend Environment Variables
```env
REACT_APP_API_URL=https://your-laravel-domain.com/api
REACT_APP_AUTH_TOKEN_KEY=auth_token
REACT_APP_UPLOAD_URL=https://your-laravel-domain.com/api/upload
REACT_APP_STORAGE_URL=https://your-laravel-domain.com/storage
```

## Laravel Backend Structure

### Required Controllers

#### 1. AuthController
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $user = Auth::user();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }
    
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ], 201);
    }
    
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ]);
    }
    
    public function me(Request $request)
    {
        return response()->json($request->user());
    }
    
    public function refresh(Request $request)
    {
        $user = $request->user();
        $user->tokens()->delete();

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
        ]);
    }
}
```

#### 2. ProductController
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Spatie\QueryBuilder\QueryBuilder;
use Spatie\QueryBuilder\AllowedFilter;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $products = QueryBuilder::for(Product::class)
            ->allowedFilters([
                AllowedFilter::partial('name'),
                AllowedFilter::exact('category_id'),
                AllowedFilter::scope('featured'),
                AllowedFilter::scope('new_arrival'),
                AllowedFilter::scope('on_sale'),
            ])
            ->allowedSorts(['price', 'rating', 'created_at'])
            ->paginate($request->get('limit', 12));

        return response()->json($products);
    }
    
    public function show($id)
    {
        $product = Product::with(['thumbnails', 'variations', 'category'])->findOrFail($id);
        return response()->json($product);
    }
    
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:products,slug',
            'description' => 'required|string',
            'price' => 'required|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
            'image' => 'required|string',
            'sku' => 'nullable|string|unique:products,sku',
            'stock_quantity' => 'required|integer|min:0',
            'is_featured' => 'boolean',
            'is_new_arrival' => 'boolean',
            'is_on_sale' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $product = Product::create($validated);

        return response()->json($product, 201);
    }
    
    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:products,slug,' . $product->id,
            'description' => 'sometimes|string',
            'price' => 'sometimes|numeric|min:0',
            'original_price' => 'nullable|numeric|min:0',
            'category_id' => 'sometimes|exists:categories,id',
            'image' => 'sometimes|string',
            'sku' => 'nullable|string|unique:products,sku,' . $product->id,
            'stock_quantity' => 'sometimes|integer|min:0',
            'is_featured' => 'boolean',
            'is_new_arrival' => 'boolean',
            'is_on_sale' => 'boolean',
            'is_active' => 'boolean',
        ]);

        $product->update($validated);

        return response()->json($product);
    }
    
    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json(['message' => 'Product deleted successfully']);
    }
    
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $category = $request->get('category');
        $minPrice = $request->get('min_price');
        $maxPrice = $request->get('max_price');
        $sort = $request->get('sort', 'newest');
        $page = $request->get('page', 1);
        $limit = $request->get('limit', 12);

        $productsQuery = Product::query();

        if ($query) {
            $productsQuery->where('name', 'like', "%{$query}%")
                ->orWhere('description', 'like', "%{$query}%")
                ->orWhere('sku', 'like', "%{$query}%");
        }

        if ($category) {
            $productsQuery->whereHas('category', function ($q) use ($category) {
                $q->where('slug', $category);
            });
        }

        if ($minPrice !== null) {
            $productsQuery->where('price', '>=', $minPrice);
        }

        if ($maxPrice !== null) {
            $productsQuery->where('price', '<=', $maxPrice);
        }

        switch ($sort) {
            case 'price_asc':
                $productsQuery->orderBy('price', 'asc');
                break;
            case 'price_desc':
                $productsQuery->orderBy('price', 'desc');
                break;
            case 'rating':
                $productsQuery->orderBy('rating', 'desc');
                break;
            case 'featured':
                $productsQuery->orderBy('is_featured', 'desc');
                break;
            case 'newest':
            default:
                $productsQuery->orderBy('created_at', 'desc');
                break;
        }

        $products = $productsQuery->paginate($limit, ['*'], 'page', $page);

        return response()->json($products);
    }
    
    public function featured()
    {
        $products = Product::where('is_featured', true)->paginate(12);
        return response()->json($products);
    }
}
```

#### 3. CategoryController
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::where('is_active', true)->orderBy('order')->get();
        return response()->json($categories);
    }

    public function all()
    {
        $categories = Category::orderBy('order')->get();
        return response()->json($categories);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:categories,slug',
            'image' => 'nullable|string',
            'icon' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'order' => 'integer',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $category = Category::create($validated);

        return response()->json($category, 201);
    }

    public function update(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|unique:categories,slug,' . $category->id,
            'image' => 'nullable|string',
            'icon' => 'nullable|string',
            'description' => 'nullable|string',
            'is_active' => 'boolean',
            'order' => 'integer',
            'parent_id' => 'nullable|exists:categories,id',
        ]);

        $category->update($validated);

        return response()->json($category);
    }

    public function destroy($id)
    {
        $category = Category::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }

    public function reorder(Request $request)
    {
        $categories = $request->input('categories');

        foreach ($categories as $index => $categoryData) {
            $category = Category::find($categoryData['id']);
            if ($category) {
                $category->order = $index;
                $category->save();
            }
        }

        return response()->json(['message' => 'Categories reordered successfully']);
    }
}
```

#### 4. CartController
```php
<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Support\Facades\Auth;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $cart = $user->cart()->with('items.product')->first();

        if (!$cart) {
            $cart = Cart::create(['user_id' => $user->id]);
        }

        return response()->json($cart);
    }
    
    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $cart = $user->cart()->firstOrCreate(['user_id' => $user->id]);

        $item = $cart->items()->where('product_id', $request->product_id)->first();

        if ($item) {
            $item->quantity += $request->quantity;
            $item->save();
        } else {
            $cart->items()->create([
                'product_id' => $request->product_id,
                'quantity' => $request->quantity,
            ]);
        }

        return response()->json(['message' => 'Item added to cart']);
    }
    
    public function updateItem(Request $request, $itemId)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $item = $user->cart->items()->where('id', $itemId)->firstOrFail();

        $item->quantity = $request->quantity;
        $item->save();

        return response()->json(['message' => 'Cart item updated']);
    }
    
    public function removeItem($itemId)
    {
        $user = Auth::user();
        $item = $user->cart->items()->where('id', $itemId)->firstOrFail();
        $item->delete();

        return response()->json(['message' => 'Cart item removed']);
    }
    
    public function clear()
    {
        $user = Auth::user();
        $user->cart->items()->delete();

        return response()->json(['message' => 'Cart cleared']);
    }
    
    public function sync(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $cart = $user->cart()->firstOrCreate(['user_id' => $user->id]);

        $cart->items()->delete();

        foreach ($request->items as $item) {
            $cart->items()->create([
                'product_id' => $item['product_id'],
                'quantity' => $item['quantity'],
            ]);
        }

        return response()->json(['message' => 'Cart synced successfully']);
    }
}
```

### Required Models

#### User Model Enhancement
```php
<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable;
    
    protected $fillable = [
        'name', 'email', 'password', 'role', 'avatar',
        'first_name', 'last_name', 'phone', 'is_active'
    ];
    
    protected $hidden = ['password', 'remember_token'];
    
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_active' => 'boolean',
    ];
    
    public function cart()
    {
        return $this->hasOne(Cart::class);
    }
    
    public function wishlist()
    {
        return $this->hasOne(Wishlist::class);
    }
    
    public function orders()
    {
        return $this->hasMany(Order::class);
    }
}
```

#### Product Model
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $fillable = [
        'name', 'slug', 'description', 'price', 'original_price',
        'category_id', 'image', 'sku', 'stock_quantity',
        'is_featured', 'is_new_arrival', 'is_on_sale', 'is_active'
    ];
    
    protected $casts = [
        'price' => 'decimal:2',
        'original_price' => 'decimal:2',
        'is_featured' => 'boolean',
        'is_new_arrival' => 'boolean',
        'is_on_sale' => 'boolean',
        'is_active' => 'boolean',
    ];
    
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
    
    public function thumbnails()
    {
        return $this->hasMany(ProductThumbnail::class);
    }
    
    public function variations()
    {
        return $this->hasMany(ProductVariation::class);
    }
}
```

### Database Migrations

#### Products Migration
```php
Schema::create('products', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->text('description');
    $table->decimal('price', 10, 2);
    $table->decimal('original_price', 10, 2)->nullable();
    $table->foreignId('category_id')->constrained();
    $table->string('image');
    $table->string('sku')->unique()->nullable();
    $table->integer('stock_quantity')->default(0);
    $table->decimal('rating', 3, 2)->default(0);
    $table->integer('reviews')->default(0);
    $table->boolean('is_featured')->default(false);
    $table->boolean('is_new_arrival')->default(false);
    $table->boolean('is_on_sale')->default(false);
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

## Frontend Integration Strategy

### Phase 1: API Service Layer

Replace the existing mock data system with a centralized API service:

```typescript
// src/services/laravelApiService.ts
class LaravelApiService {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    this.loadAuthToken();
  }

  private loadAuthToken() {
    this.authToken = localStorage.getItem('auth_token') || 
                    localStorage.getItem('role_auth_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearAuthToken();
          window.location.href = '/login';
          throw new Error('Authentication required');
        }
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string) {
    const response = await this.request<{user: any, token: string}>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    this.setAuthToken(response.token);
    return response;
  }

  async register(userData: any) {
    const response = await this.request<{user: any, token: string}>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setAuthToken(response.token);
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.clearAuthToken();
    }
  }

  async getCurrentUser() {
    return this.request<any>('/auth/me');
  }

  // Product methods
  async getProducts(params: any = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request<any>(`/products?${queryString}`);
  }

  async getProduct(id: number) {
    return this.request<any>(`/products/${id}`);
  }

  async searchProducts(params: any) {
    const queryString = new URLSearchParams(params).toString();
    return this.request<any>(`/products/search?${queryString}`);
  }

  // Cart methods
  async getCart() {
    return this.request<any>('/cart');
  }

  async addToCart(productId: number, quantity: number) {
    return this.request<any>('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, quantity }),
    });
  }

  async updateCartItem(itemId: number, quantity: number) {
    return this.request<any>(`/cart/items/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }

  async removeFromCart(itemId: number) {
    return this.request<any>(`/cart/items/${itemId}`, {
      method: 'DELETE',
    });
  }

  async syncCart(items: any[]) {
    return this.request<any>('/cart/sync', {
      method: 'POST',
      body: JSON.stringify({ items }),
    });
  }

  // Wishlist methods
  async getWishlist() {
    return this.request<any>('/wishlist');
  }

  async addToWishlist(productId: number) {
    return this.request<any>('/wishlist/items', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId }),
    });
  }

  async removeFromWishlist(productId: number) {
    return this.request<any>(`/wishlist/items/${productId}`, {
      method: 'DELETE',
    });
  }

  // Categories
  async getCategories() {
    return this.request<any>('/categories');
  }

  // File upload
  async uploadFile(file: File, type: string = 'product') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<any>('/upload', {
      method: 'POST',
      body: formData,
      headers: {
        // Don't set Content-Type for FormData
        ...(this.authToken && { Authorization: `Bearer ${this.authToken}` }),
      },
    });
  }

  setAuthToken(token: string) {
    this.authToken = token;
    localStorage.setItem('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('role_auth_token');
  }
}

export const laravelApi = new LaravelApiService();
```

### Phase 2: Context Updates

Update your existing contexts to use the Laravel API:

#### AuthContext Integration
```typescript
// Update src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { laravelApi } from '@/services/laravelApiService';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  register: (userData: any) => Promise<User>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const userData = await laravelApi.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Failed to verify token:', error);
          laravelApi.clearAuthToken();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    try {
      const response = await laravelApi.login(email, password);
      setUser(response.user);
      return response.user;
    } catch (error: any) {
      throw new Error('Login failed: ' + (error.message || 'Unknown error'));
    }
  };

  const register = async (userData: any): Promise<User> => {
    try {
      const response = await laravelApi.register(userData);
      setUser(response.user);
      return response.user;
    } catch (error: any) {
      throw new Error('Registration failed: ' + (error.message || 'Unknown error'));
    }
  };

  const logout = async () => {
    try {
      await laravelApi.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

## Implementation Phases

### Phase 1: Authentication (Week 1-2)
**Priority**: High
**Files to Update**:
- `src/contexts/AuthContext.tsx`
- `src/contexts/RoleAuthContext.tsx`
- `src/components/auth/AuthModal.tsx`

**Laravel Requirements**:
- Sanctum setup
- AuthController implementation
- User model enhancement

### Phase 2: Product Data (Week 3-5)
**Priority**: High
**Files to Update**:
- `src/data/storeData.ts` (replace all functions)
- `src/contexts/SearchContext.tsx`
- Product-related components

**Laravel Requirements**:
- ProductController with search
- Category management
- File upload handling

### Phase 3: Cart & Wishlist (Week 6)
**Priority**: Medium
**Files to Update**:
- `src/contexts/CartContext.tsx`
- `src/contexts/WishlistContext.tsx`

**Laravel Requirements**:
- CartController
- WishlistController
- User relationship models

### Phase 4: Admin Features (Week 7-9)
**Priority**: Medium
**Files to Update**:
- Dashboard pages
- Admin components

**Laravel Requirements**:
- Admin middleware
- Analytics endpoints
- Bulk operations

## Error Handling Strategy

### Frontend Error Handling
```typescript
// src/utils/errorHandler.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export const handleApiError = (error: any, fallbackMessage = 'An error occurred') => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  return fallbackMessage;
};
```

### Laravel Error Responses
```php
// app/Http/Controllers/Controller.php
protected function errorResponse(string $message, int $status = 400, array $details = [])
{
    return response()->json([
        'error' => true,
        'message' => $message,
        'details' => $details,
        'timestamp' => now()->toISOString(),
    ], $status);
}
```

## Security Best Practices

### Laravel Security
1. **API Rate Limiting**
```php
// routes/api.php
Route::middleware(['throttle:api'])->group(function () {
    // Your API routes
});
```

2. **CORS Configuration**
```php
// config/cors.php
'allowed_origins' => [env('FRONTEND_URL')],
'allowed_headers' => ['*'],
'allowed_methods' => ['*'],
'supports_credentials' => true,
```

3. **Input Validation**
```php
// app/Http/Requests/StoreProductRequest.php
class StoreProductRequest extends FormRequest
{
    public function rules()
    {
        return [
            'name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
            'category_id' => 'required|exists:categories,id',
        ];
    }
}
```

### Frontend Security
1. **Token Storage**: Use secure storage for auth tokens
2. **Input Sanitization**: Validate all user inputs
3. **HTTPS Only**: Ensure all API calls use HTTPS in production

## Testing Strategy

### Backend Testing
```php
// tests/Feature/ProductApiTest.php
class ProductApiTest extends TestCase
{
    use RefreshDatabase;
    
    public function test_can_get_products()
    {
        Product::factory()->count(5)->create();
        
        $response = $this->getJson('/api/products');
        
        $response->assertOk()
                ->assertJsonStructure([
                    'data' => [
                        '*' => ['id', 'name', 'price', 'category']
                    ]
                ]);
    }
}
```

### Frontend Testing
```typescript
// src/services/__tests__/laravelApiService.test.ts
import { laravelApi } from '../laravelApiService';

describe('LaravelApiService', () => {
  test('should login successfully', async () => {
    // Mock API response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        user: { id: 1, email: 'test@example.com' },
        token: 'mock-token'
      })
    });

    const result = await laravelApi.login('test@example.com', 'password');
    expect(result.user.email).toBe('test@example.com');
  });
});
```

## Deployment Considerations

### Laravel Deployment
1. **Environment Variables**
```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-api-domain.com

DB_CONNECTION=mysql
DB_HOST=your-db-host
DB_DATABASE=your-database

SANCTUM_STATEFUL_DOMAINS=your-frontend-domain.com
FRONTEND_URL=https://your-frontend-domain.com
```

2. **Optimize for Production**
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan optimize
```

### Frontend Deployment
1. **Build with Production API URL**
```env
VITE_API_URL=https://your-api-domain.com/api
```

2. **Error Monitoring**: Set up error tracking (Sentry, etc.)

## Troubleshooting

### Common Issues

#### CORS Errors
**Problem**: Frontend can't connect to Laravel API
**Solution**: 
- Check CORS configuration in `config/cors.php`
- Ensure `FRONTEND_URL` is set in Laravel `.env`
- Verify API routes are properly defined

#### Authentication Issues
**Problem**: Token authentication failing
**Solution**:
- Verify Sanctum is properly installed
- Check token is being sent in Authorization header
- Ensure API routes are protected with `auth:sanctum`

#### File Upload Issues
**Problem**: Image uploads failing
**Solution**:
- Check file permissions on storage directory
- Verify upload limits in `php.ini`
- Ensure storage is properly linked

#### Search Not Working
**Problem**: Product search returns no results
**Solution**:
- Check database indexes on searchable fields
- Verify search query parameters
- Test search logic in isolation

### Debug Tools

1. **Laravel Telescope**: For API debugging
2. **React DevTools**: For frontend state inspection
3. **Network Tab**: For API request/response inspection
4. **Laravel Log Viewer**: For backend error tracking

## Performance Optimization

### Laravel Performance
- Use database indexes on frequently queried fields
- Implement Redis caching for expensive queries
- Use Eloquent eager loading to prevent N+1 queries
- Optimize images with Intervention Image

### Frontend Performance
- Implement API response caching
- Use React Query for better data fetching
- Lazy load images and components
- Debounce search inputs

## Maintenance Tasks

### Regular Tasks
1. **Monitor API performance** and response times
2. **Update dependencies** regularly
3. **Backup database** and files
4. **Review security logs** for suspicious activity
5. **Test API endpoints** after updates

### Health Checks
Create health check endpoints:
```php
// routes/api.php
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'database' => DB::connection()->getPdo() ? 'connected' : 'disconnected'
    ]);
});
```

This documentation provides a complete roadmap for integrating your React e-commerce project with Laravel APIs. Follow the phases sequentially and refer to your existing API documentation in the `docs/` folder for detailed endpoint specifications.
