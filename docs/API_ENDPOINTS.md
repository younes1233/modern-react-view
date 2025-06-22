
# API Endpoints Documentation

Complete list of API endpoints needed to replace mock data functionality.

## Products APIs

### Product Management
```
GET    /api/products                    - Get all products with pagination
GET    /api/products/{id}               - Get product by ID
GET    /api/products/slug/{slug}        - Get product by slug
POST   /api/products                    - Create new product (admin/seller)
PUT    /api/products/{id}               - Update product (admin/seller)  
DELETE /api/products/{id}               - Delete product (admin only)

# Filtered Product Endpoints
GET    /api/products?featured=true      - Get featured products
GET    /api/products?new_arrivals=true  - Get new arrivals
GET    /api/products?on_sale=true       - Get sale products
GET    /api/products/search             - Search products with filters
```

### Query Parameters for Search
```
?q=search_term
&category=category_slug
&min_price=0
&max_price=1000
&sort=price_asc|price_desc|rating|newest|featured
&page=1
&limit=12
```

## Categories APIs

```
GET    /api/categories                  - Get all active categories
GET    /api/categories/all              - Get all categories (admin)
POST   /api/categories                  - Create category (admin)
PUT    /api/categories/{id}             - Update category (admin)
DELETE /api/categories/{id}             - Delete category (admin)
PUT    /api/categories/reorder          - Reorder categories (admin)
```

## User Management APIs

### Authentication
```
POST   /api/auth/login                  - User login
POST   /api/auth/logout                 - User logout  
POST   /api/auth/register               - User registration
GET    /api/auth/me                     - Get current user
POST   /api/auth/refresh                - Refresh token
POST   /api/auth/forgot-password        - Password reset request
POST   /api/auth/reset-password         - Reset password
```

### User Management (Admin)
```
GET    /api/users                       - Get all users (admin)
GET    /api/users/{id}                  - Get user by ID
PUT    /api/users/{id}                  - Update user
DELETE /api/users/{id}                  - Delete user (admin)
PUT    /api/users/{id}/status           - Update user status
```

## Cart APIs

```
GET    /api/cart                        - Get user's cart
POST   /api/cart/items                  - Add item to cart
PUT    /api/cart/items/{id}             - Update cart item quantity
DELETE /api/cart/items/{id}             - Remove item from cart
DELETE /api/cart                        - Clear entire cart
```

## Wishlist APIs

```
GET    /api/wishlist                    - Get user's wishlist
POST   /api/wishlist/items              - Add item to wishlist
DELETE /api/wishlist/items/{productId}  - Remove item from wishlist
DELETE /api/wishlist                    - Clear wishlist
```

## Orders APIs

```
GET    /api/orders                      - Get user's orders
GET    /api/orders/{id}                 - Get order details
POST   /api/orders                      - Create new order
PUT    /api/orders/{id}/status          - Update order status (admin)
GET    /api/orders/admin                - Get all orders (admin)
```

## Store Management APIs

### Banners
```
GET    /api/banners                     - Get all banners
POST   /api/banners                     - Create banner (admin)
PUT    /api/banners/{id}                - Update banner (admin)
DELETE /api/banners/{id}                - Delete banner (admin)
PUT    /api/banners/reorder             - Reorder banners (admin)
```

### Hero Section
```
GET    /api/hero-section                - Get hero section data
PUT    /api/hero-section                - Update hero section (admin)
```

### Product Listings
```
GET    /api/product-listings            - Get all product listings
POST   /api/product-listings            - Create listing (admin)
PUT    /api/product-listings/{id}       - Update listing (admin)
DELETE /api/product-listings/{id}       - Delete listing (admin)
```

## Analytics APIs

```
GET    /api/analytics/sales             - Sales analytics
GET    /api/analytics/products          - Product analytics  
GET    /api/analytics/customers         - Customer analytics
GET    /api/analytics/dashboard         - Dashboard overview
```

## File Upload APIs

```
POST   /api/upload/product-images       - Upload product images
POST   /api/upload/category-images      - Upload category images
POST   /api/upload/banner-images        - Upload banner images
DELETE /api/upload/{filename}           - Delete uploaded file
```

## Seller APIs (for multi-vendor)

```
GET    /api/seller/products             - Get seller's products
POST   /api/seller/products             - Submit product for approval
PUT    /api/seller/products/{id}        - Update pending product
GET    /api/seller/orders               - Get seller's orders
GET    /api/seller/analytics            - Seller analytics
```

## Admin APIs

```
GET    /api/admin/product-approvals     - Products pending approval
PUT    /api/admin/products/{id}/approve - Approve product
PUT    /api/admin/products/{id}/reject  - Reject product
GET    /api/admin/sellers               - Manage sellers
PUT    /api/admin/sellers/{id}/status   - Update seller status
```

## Response Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized  
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Server Error

All endpoints should return consistent error format:
```json
{
  "error": true,
  "message": "Error description",
  "details": {}
}
```
