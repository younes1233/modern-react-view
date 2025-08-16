

# Image Specifications Guide

This document outlines the recommended image sizes and specifications for all visual assets in the e-commerce application, optimized for different devices.

## Product Images

### Main Product Images
**Desktop (1024px+)**
- **Recommended Size**: 800x800px
- **Aspect Ratio**: 1:1 (Square)
- **Format**: JPEG, PNG, WebP
- **Quality**: High (80-95% JPEG quality)
- **Background**: White or transparent

**Tablet (768px - 1024px)**
- **Recommended Size**: 600x600px
- **Aspect Ratio**: 1:1 (Square)
- **Format**: JPEG, WebP (preferred)
- **Quality**: High (75-90% JPEG quality)
- **Background**: White or transparent

**Mobile (320px - 768px)**
- **Recommended Size**: 400x400px
- **Aspect Ratio**: 1:1 (Square)
- **Format**: WebP (preferred), JPEG
- **Quality**: Medium-High (70-85% JPEG quality)
- **Background**: White or transparent

**Usage**: Product detail pages, product cards, quick view modals

### Product Thumbnails
**Desktop (1024px+)**
- **Recommended Size**: 500x500px
- **Display Size**: ~120-150px

**Tablet (768px - 1024px)**
- **Recommended Size**: 300x300px
- **Display Size**: ~80-100px

**Mobile (320px - 768px)**
- **Recommended Size**: 200x200px
- **Display Size**: ~60-80px

**Common Specs**:
- **Aspect Ratio**: 1:1 (Square)
- **Format**: WebP (preferred), JPEG, PNG
- **Quality**: Medium-High (70-85% JPEG quality)
- **Usage**: Product gallery thumbnails, related products

### Product Card Images (Grid View)
**Desktop (1024px+)**
- 2 columns: 500x500px (display ~400px)
- 3 columns: 400x400px (display ~300px)
- 4 columns: 300x300px (display ~250px)
- 5 columns: 250x250px (display ~200px)

**Tablet (768px - 1024px)**
- 2 columns: 400x400px (display ~350px)
- 3 columns: 300x300px (display ~240px)
- 4 columns: 250x250px (display ~180px)

**Mobile (320px - 768px)**
- 1 column: 400x400px (display ~280-320px)
- 2 columns: 300x300px (display ~140-160px)

**Common Specs**:
- **Aspect Ratio**: 1:1 (Square)
- **Format**: WebP (preferred), JPEG
- **Quality**: Medium-High (70-85% JPEG quality)

## Banner Images

### Hero Banners
**Desktop (1024px+)**
- **Recommended Size**: 1920x600px
- **Aspect Ratio**: 16:5 (3.2:1)
- **Display Height**: ~500-600px

**Tablet (768px - 1024px)**
- **Recommended Size**: 1200x500px
- **Aspect Ratio**: 12:5 (2.4:1)
- **Display Height**: ~400-500px

**Mobile (320px - 768px)**
- **Recommended Size**: 800x600px
- **Aspect Ratio**: 4:3 (1.33:1)
- **Display Height**: ~300-400px

**Common Specs**:
- **Format**: WebP (preferred), JPEG
- **Quality**: High (85-95% JPEG quality)
- **Considerations**: Ensure text/CTA remains readable at all sizes

### Secondary Banners
**Desktop (1024px+)**
- **Recommended Size**: 1200x400px
- **Aspect Ratio**: 3:1

**Tablet (768px - 1024px)**
- **Recommended Size**: 1000x400px
- **Aspect Ratio**: 2.5:1

**Mobile (320px - 768px)**
- **Recommended Size**: 600x300px
- **Aspect Ratio**: 2:1

**Common Specs**:
- **Format**: WebP (preferred), JPEG
- **Quality**: High (80-90% JPEG quality)

### Sidebar Banners
**Desktop (1024px+)**
- **Recommended Size**: 400x600px
- **Aspect Ratio**: 2:3 (Portrait)

**Tablet (768px - 1024px)**
- **Recommended Size**: 300x450px
- **Aspect Ratio**: 2:3 (Portrait)

**Mobile (320px - 768px)**
- **Recommended Size**: 250x375px
- **Aspect Ratio**: 2:3 (Portrait)

**Common Specs**:
- **Format**: WebP (preferred), JPEG
- **Quality**: Medium-High (75-85% JPEG quality)

## Hero Section Images

### Main Hero Background
**Desktop (1024px+)**
- **Recommended Size**: 2070x800px
- **Aspect Ratio**: 21:8 (~2.6:1)
- **Display Height**: ~600-800px

**Tablet (768px - 1024px)**
- **Recommended Size**: 1536x600px
- **Aspect Ratio**: 16:6.25 (~2.56:1)
- **Display Height**: ~450-600px

**Mobile (320px - 768px)**
- **Recommended Size**: 768x500px
- **Aspect Ratio**: 1.54:1
- **Display Height**: ~300-450px

**Common Specs**:
- **Format**: WebP (preferred), JPEG
- **Quality**: High (85-95% JPEG quality)
- **Considerations**: 
  - Must work with overlay gradients
  - Should have areas suitable for text overlay
  - Test readability with various gradient combinations

## Category Images

### Category Grid Images
**Desktop (1024px+)**
- **Recommended Size**: 400x400px
- **Display Size**: ~300-350px

**Tablet (768px - 1024px)**
- **Recommended Size**: 300x300px
- **Display Size**: ~200-250px

**Mobile (320px - 768px)**
- **Recommended Size**: 250x250px
- **Display Size**: ~150-200px

**Common Specs**:
- **Aspect Ratio**: 1:1 (Square)
- **Format**: WebP (preferred), JPEG
- **Quality**: Medium-High (75-85% JPEG quality)
- **Background**: Clean, minimal backgrounds work best

### Category Icons
**All Devices**
- **Recommended Size**: 64x64px or vector (SVG)
- **Format**: SVG (preferred), PNG with transparency
- **Usage**: Category navigation, filters

## Device-Specific Guidelines

### Mobile Optimization (320px - 768px)
- Prioritize WebP format for faster loading
- Use smaller file sizes (max 200KB per image)
- Ensure images are touch-friendly (minimum 44px tap targets)
- Consider using srcset for high-DPI screens
- Optimize for vertical scrolling layouts

### Tablet Optimization (768px - 1024px)
- Balance between quality and performance
- Use medium-high quality settings
- Consider landscape and portrait orientations
- Optimize for grid layouts (2-3 columns typically)

### Desktop Optimization (1024px+)
- Higher quality images acceptable (up to 500KB)
- Support for hover effects and interactions
- Optimize for larger grid layouts (3-5 columns)
- Consider high-DPI displays (2x images)

## Responsive Image Implementation

### Recommended srcset Attributes
```html
<!-- Product Images -->
<img src="product-400.webp" 
     srcset="product-200.webp 200w, 
             product-300.webp 300w, 
             product-400.webp 400w,
             product-600.webp 600w,
             product-800.webp 800w"
     sizes="(max-width: 768px) 200px, 
            (max-width: 1024px) 300px, 
            400px" />

<!-- Hero Images -->
<img src="hero-desktop.webp"
     srcset="hero-mobile.webp 768w,
             hero-tablet.webp 1024w,
             hero-desktop.webp 1920w"
     sizes="(max-width: 768px) 768px,
            (max-width: 1024px) 1024px,
            1920px" />
```

## File Format Recommendations

### By Device Type
**Mobile**: WebP > JPEG > PNG
**Tablet**: WebP > JPEG > PNG  
**Desktop**: WebP = JPEG > PNG

### By Content Type
**Photos**: WebP, JPEG
**Graphics with Text**: PNG, WebP
**Icons**: SVG, PNG
**Logos**: SVG, PNG

## Performance Considerations

### File Size Limits
- **Mobile**: Max 200KB per image
- **Tablet**: Max 350KB per image
- **Desktop**: Max 500KB per image

### Loading Strategy
- Use lazy loading for all non-critical images
- Preload hero images and above-the-fold content
- Implement progressive JPEG for larger images
- Use blur-up or skeleton loading states

## Current Implementation URLs
The app currently uses Unsplash URLs with these parameters:
- **Products**: `?q=80&w=800&auto=format&fit=crop&bg=white`
- **Categories**: `?w=300&h=300&fit=crop`
- **Hero**: `?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3`
- **Banners**: `?w=1200&h=400&fit=crop`

## Testing Checklist

### Cross-Device Testing
- [ ] Images load properly on mobile devices
- [ ] Images scale correctly on tablets
- [ ] High-resolution displays show crisp images
- [ ] Touch interactions work on mobile/tablet

### Performance Testing
- [ ] Page load times under 3 seconds
- [ ] Images lazy load properly
- [ ] No layout shift during image loading
- [ ] Proper fallbacks for unsupported formats

### Visual Testing
- [ ] Text overlay readability on all devices
- [ ] Images maintain aspect ratios
- [ ] No pixelation or blur at various zoom levels
- [ ] Consistent appearance across browsers

### Accessibility Testing
- [ ] Alt text is descriptive and meaningful
- [ ] Images work with screen readers
- [ ] Sufficient color contrast with overlays
- [ ] Images don't rely solely on color for information

## Notes
- Always test images on actual devices, not just browser dev tools
- Consider using a CDN with automatic image optimization
- Monitor Core Web Vitals, especially Largest Contentful Paint (LCP)
- Keep original high-resolution images for future format updates
- Regular audit of image performance and optimization opportunities

