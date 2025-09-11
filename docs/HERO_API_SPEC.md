# Hero Section API Specification

## Overview
Simple API for managing hero sections with support for single heroes and multi-slide carousels.

## Data Models

### Hero
```json
{
  "id": 1,
  "title": "Summer Sale",
  "subtitle": "Up to 50% off selected items",
  "image_url": "https://example.com/hero-image.jpg",
  "cta_text": "Shop Now",
  "cta_link": "/products",
  "is_active": true,
  "order": 1,
  "type": "single",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

### Slider (Hero with Multiple Slides)
```json
{
  "id": 2,
  "title": "Main Slider",
  "subtitle": null,
  "image_url": null,
  "cta_text": null,
  "cta_link": null,
  "is_active": true,
  "order": 2,
  "type": "slider",
  "slides": [
    {
      "id": 101,
      "title": "Slide 1",
      "subtitle": "First slide content",
      "image_url": "https://example.com/slide1.jpg",
      "cta_text": "Learn More",
      "cta_link": "/about",
      "order": 1
    },
    {
      "id": 102,
      "title": "Slide 2", 
      "subtitle": "Second slide content",
      "image_url": "https://example.com/slide2.jpg",
      "cta_text": "Get Started",
      "cta_link": "/signup",
      "order": 2
    }
  ],
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## API Endpoints

### 1. Get All Heroes (Public - Store Front)
```
GET /api/heroes
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Summer Sale",
      "subtitle": "Up to 50% off",
      "image_url": "https://example.com/hero.jpg",
      "cta_text": "Shop Now",
      "cta_link": "/products",
      "type": "single"
    },
    {
      "id": 2,
      "title": "Main Slider",
      "type": "slider",
      "slides": [
        {
          "id": 101,
          "title": "Slide 1",
          "subtitle": "First slide",
          "image_url": "https://example.com/slide1.jpg",
          "cta_text": "Learn More",
          "cta_link": "/about"
        }
      ]
    }
  ]
}
```

### 2. Get All Heroes (Admin)
```
GET /api/admin/heroes
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Summer Sale",
      "subtitle": "Up to 50% off",
      "image_url": "https://example.com/hero.jpg",
      "cta_text": "Shop Now",
      "cta_link": "/products",
      "is_active": true,
      "order": 1,
      "type": "single",
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": 2,
      "title": "Main Slider",
      "is_active": true,
      "order": 2,
      "type": "slider",
      "slides": [
        {
          "id": 101,
          "title": "Slide 1",
          "subtitle": "First slide",
          "image_url": "https://example.com/slide1.jpg",
          "cta_text": "Learn More",
          "cta_link": "/about",
          "order": 1
        }
      ],
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 3. Create Single Hero
```
POST /api/admin/heroes
Content-Type: multipart/form-data
```

**Request:**
```
title: "New Hero"
subtitle: "Hero subtitle"
image: [File]
cta_text: "Click Here"
cta_link: "/link"
is_active: true
type: "single"
```

**Response:**
```json
{
  "success": true,
  "message": "Hero created successfully",
  "data": {
    "id": 3,
    "title": "New Hero",
    "subtitle": "Hero subtitle",
    "image_url": "https://example.com/new-hero.jpg",
    "cta_text": "Click Here",
    "cta_link": "/link",
    "is_active": true,
    "order": 3,
    "type": "single"
  }
}
```

### 4. Create Slider
```
POST /api/admin/heroes
Content-Type: application/json
```

**Request:**
```json
{
  "title": "My Slider",
  "is_active": true,
  "type": "slider"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Slider created successfully",
  "data": {
    "id": 4,
    "title": "My Slider",
    "is_active": true,
    "order": 4,
    "type": "slider",
    "slides": []
  }
}
```

### 5. Add Slide to Slider
```
POST /api/admin/heroes/{slider_id}/slides
Content-Type: multipart/form-data
```

**Request:**
```
title: "Slide Title"
subtitle: "Slide subtitle"
image: [File]
cta_text: "Action"
cta_link: "/action"
```

**Response:**
```json
{
  "success": true,
  "message": "Slide added successfully",
  "data": {
    "id": 103,
    "title": "Slide Title",
    "subtitle": "Slide subtitle",
    "image_url": "https://example.com/slide.jpg",
    "cta_text": "Action",
    "cta_link": "/action",
    "order": 1
  }
}
```

### 6. Update Hero/Slider
```
PUT /api/admin/heroes/{id}
Content-Type: multipart/form-data
```

**Request:**
```
title: "Updated Title"
subtitle: "Updated subtitle"
image: [File] (optional)
cta_text: "Updated CTA"
cta_link: "/updated-link"
is_active: true
```

### 7. Update Slide
```
PUT /api/admin/heroes/{slider_id}/slides/{slide_id}
Content-Type: multipart/form-data
```

**Request:**
```
title: "Updated Slide"
subtitle: "Updated subtitle"
image: [File] (optional)
cta_text: "Updated Action"
cta_link: "/updated-action"
```

### 8. Delete Hero/Slider
```
DELETE /api/admin/heroes/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Hero deleted successfully"
}
```

### 9. Delete Slide
```
DELETE /api/admin/heroes/{slider_id}/slides/{slide_id}
```

**Response:**
```json
{
  "success": true,
  "message": "Slide deleted successfully"
}
```

### 10. Reorder Heroes
```
POST /api/admin/heroes/reorder
Content-Type: application/json
```

**Request:**
```json
{
  "order": [2, 1, 3, 4]
}
```

### 11. Reorder Slides in Slider
```
POST /api/admin/heroes/{slider_id}/slides/reorder
Content-Type: application/json
```

**Request:**
```json
{
  "order": [102, 101, 103]
}
```

## Key Points

1. **Two Types Only**: `single` (standalone hero) and `slider` (container for multiple slides)
2. **Separate Endpoints**: Slides have their own CRUD endpoints under their parent slider
3. **Simple Structure**: No complex parent-child relationships in the main hero table
4. **Clear Separation**: Public API only returns active heroes, Admin API returns everything
5. **Image Handling**: All images uploaded via multipart/form-data
6. **Ordering**: Both heroes and slides within sliders can be reordered

This structure is much simpler and easier to implement and maintain.