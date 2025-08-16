
# Image Specifications Guide

This document outlines the recommended image sizes and specifications for all visual assets in the e-commerce application.

## Product Images

### Main Product Images
- **Recommended Size**: 800x800px
- **Aspect Ratio**: 1:1 (Square)
- **Format**: JPEG, PNG, WebP
- **Quality**: High (80-95% JPEG quality)
- **Background**: White or transparent
- **Usage**: Product detail pages, product cards, quick view modals

### Product Thumbnails
- **Recommended Size**: 500x500px
- **Aspect Ratio**: 1:1 (Square)
- **Format**: JPEG, PNG, WebP
- **Quality**: Medium-High (70-85% JPEG quality)
- **Background**: White or transparent
- **Usage**: Product gallery thumbnails, related products

### Product Card Images (Grid View)
- **Display Size**: Varies based on grid columns (2-5 columns)
  - 2 columns: ~300-400px width
  - 3 columns: ~200-300px width
  - 4 columns: ~150-250px width
  - 5 columns: ~120-200px width
- **Recommended Upload Size**: 400x400px
- **Aspect Ratio**: 1:1 (Square)
- **Format**: JPEG, WebP (preferred for web performance)

## Banner Images

### Hero Banners
- **Recommended Size**: 1920x600px
- **Aspect Ratio**: 16:5 (3.2:1)
- **Format**: JPEG, WebP
- **Quality**: High (85-95% JPEG quality)
- **Mobile Considerations**: Ensure text/CTA remains readable at smaller sizes
- **Usage**: Main hero section on homepage

### Secondary Banners
- **Recommended Size**: 1200x400px
- **Aspect Ratio**: 3:1
- **Format**: JPEG, WebP
- **Quality**: High (80-90% JPEG quality)
- **Usage**: Secondary promotions, category promotions

### Sidebar Banners
- **Recommended Size**: 400x600px
- **Aspect Ratio**: 2:3 (Portrait)
- **Format**: JPEG, WebP
- **Quality**: Medium-High (75-85% JPEG quality)
- **Usage**: Sidebar promotional content

## Hero Section Images

### Main Hero Background
- **Recommended Size**: 2070x800px (based on current Unsplash URLs)
- **Aspect Ratio**: Flexible, but 16:9 to 21:9 works well
- **Format**: JPEG, WebP
- **Quality**: High (85-95% JPEG quality)
- **Considerations**: 
  - Must work with overlay gradients
  - Should have areas suitable for text overlay
  - Test readability with various gradient combinations

## Category Images

### Category Grid Images
- **Recommended Size**: 300x300px
- **Aspect Ratio**: 1:1 (Square)
- **Format**: JPEG, WebP
- **Quality**: Medium-High (75-85% JPEG quality)
- **Background**: Clean, minimal backgrounds work best
- **Usage**: Category selection grid

### Category Icons
- **Recommended Size**: 64x64px or vector (SVG)
- **Format**: SVG (preferred), PNG with transparency
- **Usage**: Category navigation, filters

## General Guidelines

### File Formats
1. **WebP**: Preferred for web performance (smaller file sizes)
2. **JPEG**: Good for photos, complex images
3. **PNG**: Use for images requiring transparency
4. **SVG**: Ideal for icons, simple graphics

### Performance Considerations
- **Maximum file size**: 500KB per image (recommended)
- **Use responsive images**: Provide multiple sizes for different screen densities
- **Lazy loading**: All images should support lazy loading
- **Alt text**: Always include descriptive alt text for accessibility

### Responsive Breakpoints
Based on Tailwind CSS defaults:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px
- **Desktop**: 1024px+

### Image Optimization Tips
1. Compress images before upload
2. Use appropriate quality settings (don't over-compress)
3. Consider using CDN for image delivery
4. Implement responsive image sizes
5. Use modern formats (WebP) when supported

## Current Implementation URLs
The app currently uses Unsplash URLs with these parameters:
- Products: `?q=80&w=800&auto=format&fit=crop&bg=white`
- Categories: `?w=300&h=300&fit=crop`
- Hero: `?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3`
- Banners: `?w=1200&h=400&fit=crop`

## Testing Checklist
- [ ] Images load properly on all devices
- [ ] Text overlay is readable on hero/banner images
- [ ] Images maintain quality at different zoom levels
- [ ] Loading performance is acceptable
- [ ] Images work with dark/light theme modes
- [ ] Alt text is descriptive and meaningful

## Notes
- All images should be tested in both light and dark theme modes
- Consider the gradient overlays used in hero sections when selecting images
- Product images with white backgrounds work best for consistency
- Ensure images are properly cropped and centered for the square aspect ratios used in product and category grids
