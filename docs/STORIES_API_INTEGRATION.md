
# Stories API Integration Guide

This document outlines how to integrate the Stories feature with real API endpoints.

## Current Implementation

The Stories feature currently uses mock data defined in `src/data/storiesData.ts` and can be easily switched to API calls by modifying the `USE_MOCK_DATA` flag in `src/services/storyService.ts`.

## Mock Data Structure

The mock data includes 6 sample stories with:
- Fashion collection showcase
- Flash sales announcements
- Behind-the-scenes content
- Customer testimonials
- Weekend specials
- New arrivals

## API Endpoints Needed

When ready to switch to API, implement these endpoints:

### GET /api/stories
- Returns all active, non-expired stories
- Should filter by `isActive: true` and `expiresAt > now`
- Sort by `order` field

### POST /api/stories
- Creates a new story
- Auto-generates `id`, `createdAt`, and `expiresAt` (24h from creation)
- Requires file upload support for images

### PUT /api/stories/:id
- Updates an existing story
- Supports partial updates

### DELETE /api/stories/:id
- Soft delete or hard delete a story

### POST /api/stories/reorder
- Updates the order of multiple stories
- Accepts array of story IDs in desired order

## Switching to API Mode

1. Implement the above API endpoints
2. Add API service functions to `src/services/apiService.ts`
3. Update `USE_MOCK_DATA` to `false` in `src/services/storyService.ts`
4. Replace TODO comments with actual API calls
5. Add proper error handling and loading states

## File Upload Support

Stories require image upload functionality. When implementing API:
- Support image formats: JPG, PNG, WebP
- Recommended dimensions: 1080x1920 (9:16 aspect ratio)
- File size limit: 5MB per image
- Auto-cleanup expired story images

## Database Schema

```sql
CREATE TABLE stories (
  id VARCHAR(255) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image VARCHAR(500) NOT NULL,
  content TEXT,
  background_color VARCHAR(7) DEFAULT '#000000',
  text_color VARCHAR(7) DEFAULT '#ffffff',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  INDEX idx_active_expires (is_active, expires_at),
  INDEX idx_order (order_index)
);
```

## Testing the Transition

1. Start with mock data to ensure UI works correctly
2. Implement API endpoints one by one
3. Test each endpoint individually
4. Switch to API mode and test full functionality
5. Add error handling and loading states
6. Test story expiration and cleanup
