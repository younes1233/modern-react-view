
# Image Specifications Guide

This document outlines the recommended image sizes and specifications for all visual assets in the e-commerce application, optimized for different devices.

## 1) Product Images
| Usage                      | Desktop (px) | Tablet (px) | Mobile (px) | Notes               |
| -------------------------- | ------------ | ----------- | ----------- | ------------------- |
| **Main product image**     | 800 × 800    | 600 × 600   | 400 × 400   | Product detail page |
| **Zoom / high-resolution** | 1200 × 1200  | —           | —           | Desktop only        |
| **Catalog / list product** | 500 × 500    | 300 × 300   | 250 × 250   | Category/grid view  |

## 2) Thumbnails (Gallery / Additional Product Images)
| Usage                  | Desktop (px) | Tablet (px) | Mobile (px) |
| ---------------------- | ------------ | ----------- | ----------- |
| **Thumbnail (square)** | 120 × 120    | 100 × 100   | 80 × 80     |

## 3) Hero Images & Header Banners
| Usage                      | Desktop (px) | Tablet (px) | Mobile (px)        |
| -------------------------- | ------------ | ----------- | ------------------ |
| **Hero / homepage banner** | 2070 × 800   | 1536 × 600  | 768 × 500          |
| **Slider / carousel**      | 1920 × 600   | 1200 × 500  | 800 × 600          |

## 4) Promo & Section Banners 
| Usage                         | Desktop (px) | Tablet (px) | Mobile (px) |
| ----------------------------- | ------------ | ----------- | ----------- |
| **Promo banner**              | 1200 × 400   | 1000 × 400  | 600 × 300   |
| **Category / section banner** | 800 × 400    | 700 × 350   | 500 × 300   |
| **Sidebar banner**            | 400 × 600    | 300 × 450   | 250 × 375   |

## 5) Category Images
| Usage                         | Desktop (px) | Tablet (px) | Mobile (px) |
| ----------------------------- | ------------ | ----------- | ----------- |
| **Category grid image**       | 400 × 400    | 300 × 300   | 250 × 250   |
| **Category icon**             | 64 × 64      | 64 × 64     | 64 × 64     |

## Technical Specifications

### File Formats by Priority
1. **WebP** (preferred for web performance)
2. **JPEG** (for photos and complex images)
3. **PNG** (for graphics with transparency)
4. **SVG** (for icons and simple graphics)

### Quality Settings
- **Desktop**: 85-95% JPEG quality
- **Tablet**: 75-90% JPEG quality  
- **Mobile**: 70-85% JPEG quality

### File Size Limits
- **Desktop**: Max 500KB per image
- **Tablet**: Max 350KB per image
- **Mobile**: Max 200KB per image

### Aspect Ratios
- **Product Images**: 1:1 (Square)
- **Hero Banners**: 16:5 (Desktop), 12:5 (Tablet), 1.54:1 (Mobile)
- **Promo Banners**: 3:1 (Desktop), 2.5:1 (Tablet), 2:1 (Mobile)
- **Category Images**: 1:1 (Square)
- **Sidebar Banners**: 2:3 (Portrait)

## Responsive Implementation

### Recommended srcset Implementation
```html
<!-- Product Images -->
<img src="product-400.webp" 
     srcset="product-250.webp 250w, 
             product-300.webp 300w, 
             product-400.webp 400w,
             product-600.webp 600w,
             product-800.webp 800w"
     sizes="(max-width: 768px) 250px, 
            (max-width: 1024px) 300px, 
            400px" />

<!-- Hero Images -->
<img src="hero-desktop.webp"
     srcset="hero-mobile.webp 768w,
             hero-tablet.webp 1536w,
             hero-desktop.webp 2070w"
     sizes="(max-width: 768px) 768px,
            (max-width: 1024px) 1536px,
            2070px" />
```

## Device Breakpoints
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

## Performance Guidelines
- Use lazy loading for all non-critical images
- Preload hero images and above-the-fold content
- Implement progressive JPEG for larger images
- Use blur-up or skeleton loading states
- Consider using a CDN with automatic image optimization

## Current Implementation URLs (Unsplash)
- **Products**: `?q=80&w=800&auto=format&fit=crop&bg=white`
- **Categories**: `?w=300&h=300&fit=crop`
- **Hero**: `?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3`
- **Banners**: `?w=1200&h=400&fit=crop`

## Testing Checklist
- [ ] Images load properly on all device sizes
- [ ] Images scale correctly without pixelation
- [ ] High-resolution displays show crisp images
- [ ] Page load times under 3 seconds
- [ ] Images lazy load properly
- [ ] No layout shift during image loading
- [ ] Alt text is descriptive and meaningful

## Notes
- Always test images on actual devices, not just browser dev tools
- Monitor Core Web Vitals, especially Largest Contentful Paint (LCP)
- Keep original high-resolution images for future format updates
- Regular audit of image performance and optimization opportunities
