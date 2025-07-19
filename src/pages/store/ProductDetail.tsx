import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreLayout } from '@/components/store/StoreLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Star, Heart, ShoppingCart, Plus, Minus, Truck, Shield, RotateCcw, ZoomIn, Share, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { ImageZoom } from '@/components/store/ImageZoom';
import { useProductDetail } from '@/hooks/useProductDetail';
import { ProductDetailSkeleton } from '@/components/store/ProductDetailSkeleton';
import { ProductAPI } from '@/services/productService';

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailTimeoutRef = useRef<NodeJS.Timeout>();
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  // Fetch product from API - now using slug directly
  const { data: product, isLoading, error } = useProductDetail(slug || '');

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !product) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    // Only handle horizontal swipes (ignore vertical scrolling)
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
      const allImages = [
        { url: product.media.cover_image.image, alt: product.media.cover_image.alt_text },
        ...product.media.thumbnails.map(thumb => ({ url: thumb.image, alt: thumb.alt_text }))
      ];
      
      if (deltaX > 0 && selectedImage > 0) {
        // Swipe right - previous image
        handleImageChange(selectedImage - 1);
      } else if (deltaX < 0 && selectedImage < allImages.length - 1) {
        // Swipe left - next image
        handleImageChange(selectedImage + 1);
      }
    }
    
    touchStartRef.current = null;
  };

  const handleImageInteraction = () => {
    // Show thumbnails temporarily on mobile when not on first image
    if (window.innerWidth < 1024 && selectedImage > 0) {
      setShowThumbnails(true);
      if (thumbnailTimeoutRef.current) {
        clearTimeout(thumbnailTimeoutRef.current);
      }
      thumbnailTimeoutRef.current = setTimeout(() => {
        setShowThumbnails(false);
      }, 3000);
    }
  };

  const handleImageClick = () => {
    if (window.innerWidth < 1024) {
      setShowImageZoom(true);
    }
  };

  const handleImageChange = (index: number) => {
    setSelectedImage(index);
    // Show thumbnails when navigating away from first image
    if (index > 0 && window.innerWidth < 1024) {
      handleImageInteraction();
    } else if (index === 0) {
      setShowThumbnails(false);
    }
  };

  useEffect(() => {
    return () => {
      if (thumbnailTimeoutRef.current) {
        clearTimeout(thumbnailTimeoutRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (error || !product) {
    return (
      <StoreLayout>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
            <Button onClick={() => navigate('/store')} className="bg-cyan-600 hover:bg-cyan-700">
              Back to Store
            </Button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  const currentPrice = product.pricing.price;
  const originalPrice = product.pricing.original_price;
  const inStock = parseInt(product.inventory.stock) > 0;
  
  const allImages = [
    { url: product.media.cover_image.image, alt: product.media.cover_image.alt_text },
    ...product.media.thumbnails.map(thumb => ({ url: thumb.image, alt: thumb.alt_text }))
  ];

  const handleAddToCart = () => {
    // Convert API product to cart format
    const cartProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      originalPrice: originalPrice > currentPrice ? originalPrice : undefined,
      image: product.media.cover_image.image,
      category: product.category.name,
      inStock,
      rating: product.rating.average,
      reviews: product.rating.count,
      isFeatured: product.flags.is_featured,
      isNewArrival: product.flags.is_new_arrival,
      isOnSale: product.flags.on_sale,
      sku: product.identifiers.sku,
      description: product.description,
      thumbnails: product.media.thumbnails.map(thumb => ({
        id: thumb.id, 
        url: thumb.image, 
        alt: thumb.alt_text
      })),
      variations: []
    };
    addToCart(cartProduct, quantity);
  };

  const handleWishlistToggle = () => {
    const wishlistProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      originalPrice: originalPrice > currentPrice ? originalPrice : undefined,
      image: product.media.cover_image.image,
      category: product.category.name,
      inStock,
      rating: product.rating.average,
      reviews: product.rating.count,
      isFeatured: product.flags.is_featured,
      isNewArrival: product.flags.is_new_arrival,
      isOnSale: product.flags.on_sale,
      sku: product.identifiers.sku,
      description: product.description,
      thumbnails: product.media.thumbnails.map(thumb => ({
        id: thumb.id, 
        url: thumb.image, 
        alt: thumb.alt_text
      })),
      variations: []
    };

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(wishlistProduct);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Breadcrumb data
  const breadcrumbs = [
    { label: 'Home', path: '/store' },
    ...product.category.path.map(cat => ({
      label: cat.name,
      path: `/store/categories/${cat.slug}`,
    })),
    { label: product.name, path: '', current: true }
  ];

  return (
    <StoreLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto">
          {/* Enhanced Mobile Breadcrumb Navigation */}
          <div className="lg:hidden px-4 py-2 border-b border-gray-100">
            <div className="w-full">
              <div className="flex items-center space-x-1 text-xs text-gray-500 overflow-x-auto">
                <style>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={index} className="flex items-center space-x-1 flex-shrink-0">
                    {index > 0 && (
                      <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    )}
                    {breadcrumb.current ? (
                      <span className="text-gray-900 font-medium text-xs">
                        {breadcrumb.label}
                      </span>
                    ) : (
                      <button
                        onClick={() => breadcrumb.path && navigate(breadcrumb.path)}
                        className="hover:text-cyan-600 transition-colors text-xs"
                      >
                        {breadcrumb.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Breadcrumb */}
          <div className="hidden lg:block px-4 sm:px-6 lg:px-8 py-4">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {index > 0 && <span>/</span>}
                    {breadcrumb.current ? (
                      <span className="text-gray-900 font-medium">{breadcrumb.label}</span>
                    ) : (
                      <button
                        onClick={() => breadcrumb.path && navigate(breadcrumb.path)}
                        className="hover:text-cyan-600 transition-colors"
                      >
                        {breadcrumb.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:px-4 sm:lg:px-6 lg:lg:px-8">
            {/* Product Images */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              {/* Main Image */}
              <div 
                ref={imageContainerRef}
                className="relative aspect-square bg-gray-50 overflow-hidden lg:rounded-2xl group cursor-pointer"
                onClick={handleImageClick}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onMouseEnter={() => window.innerWidth >= 1024 && handleImageInteraction()}
              >
                <img
                  src={allImages[selectedImage]?.url}
                  alt={allImages[selectedImage]?.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                
                {/* Desktop: Zoom button */}
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowImageZoom(true)}
                  className="hidden lg:block absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white shadow-lg"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                
                {/* Mobile: Stock badge */}
                <div className="lg:hidden absolute top-4 left-4">
                  {inStock ? (
                    <Badge className="bg-green-500 text-white">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>

                {/* Mobile: Wishlist and Share buttons - aligned with badge */}
                <div className="lg:hidden absolute top-4 right-4 flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleWishlistToggle();
                    }}
                    className={`p-2 bg-white/90 hover:bg-white shadow-lg rounded-full w-9 h-9 ${isInWishlist(product.id) ? 'text-red-500' : 'text-gray-700'}`}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-white/90 hover:bg-white shadow-lg rounded-full w-9 h-9 text-gray-700"
                  >
                    <Share className="w-4 h-4" />
                  </Button>
                </div>

                {/* Mobile: Smaller pagination dots */}
                {allImages.length > 1 && (
                  <div className="lg:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-1">
                      {allImages.map((_, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImageChange(index);
                          }}
                          className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                            index === selectedImage
                              ? 'bg-black scale-125'
                              : 'bg-black/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Enhanced Thumbnail Navigation */}
              {allImages.length > 1 && (
                <>
                  {/* Mobile: Conditional thumbnails - show only when not on first image or when showThumbnails is true */}
                  <div className={`lg:hidden mt-4 px-4 transition-all duration-300 ${
                    (showThumbnails || selectedImage > 0) ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none h-0 overflow-hidden'
                  }`}>
                    <div className="w-full overflow-x-auto scrollbar-hide">
                      <div className="flex gap-2 pb-1 pt-1">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleImageChange(index);
                              setShowThumbnails(false);
                            }}
                            className={`flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md ${
                              index === selectedImage
                                ? 'w-12 h-12 shadow-lg ring-2 ring-cyan-500'
                                : 'w-10 h-10 hover:scale-105'
                            }`}
                          >
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="w-full h-full object-cover transition-transform duration-200"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Desktop: Always visible thumbnails */}
                  <div className="hidden lg:block mt-4">
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-3 pb-2">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md transform ${
                              index === selectedImage
                                ? 'w-20 h-20 scale-110 shadow-lg'
                                : 'w-16 h-16 hover:scale-105'
                            }`}
                            style={{ transformOrigin: 'center' }}
                          >
                            <img
                              src={image.url}
                              alt={image.alt}
                              className="w-full h-full object-cover transition-transform duration-200"
                            />
                          </button>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  </div>
                </>
              )}
            </div>

            {/* Product Info */}
            <div className="px-4 py-6 lg:px-0 lg:py-0 space-y-6">
              {/* Brand & Category */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="secondary" className="capitalize text-xs">
                    {product.category.name}
                  </Badge>
                  {product.flags.is_featured && (
                    <Badge className="bg-cyan-500 text-xs">Featured</Badge>
                  )}
                  {product.flags.is_new_arrival && (
                    <Badge className="bg-emerald-500 text-xs">New</Badge>
                  )}
                  {product.flags.on_sale && (
                    <Badge className="bg-red-500 text-xs">Sale</Badge>
                  )}
                </div>
                <div className="hidden lg:flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Share className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleWishlistToggle}
                    className={isInWishlist(product.id) ? 'text-red-500' : ''}
                  >
                    <Heart className={`w-4 h-4 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  </Button>
                </div>
              </div>

              {/* Product Title */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                  {product.name}
                </h1>
                <p className="text-gray-600 mt-2">{product.short_description}</p>
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {renderStars(product.rating.average)}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating.average.toFixed(1)} ({product.rating.count} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                    {product.pricing.currency.symbol}{currentPrice.toFixed(2)}
                  </span>
                  {originalPrice > currentPrice && (
                    <span className="text-lg text-gray-500 line-through">
                      {product.pricing.currency.symbol}{originalPrice.toFixed(2)}
                    </span>
                  )}
                  {originalPrice > currentPrice && (
                    <Badge className="bg-red-500 text-white">
                      {Math.round(((originalPrice - currentPrice) / originalPrice) * 100)}% Off
                    </Badge>
                  )}
                </div>
                {product.pricing.applied_discounts.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {product.pricing.applied_discounts.map((discount, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {discount.label}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-sm text-gray-600">
                  Inclusive of VAT ({product.pricing.currency.code})
                </p>
              </div>

              {/* Desktop Stock Status */}
              <div className="hidden lg:block">
                {inStock ? (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-500 text-white">In Stock</Badge>
                    <span className="text-sm text-gray-600">
                      {product.inventory.stock} available
                    </span>
                  </div>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              {/* SKU Info */}
              <div className="text-sm text-gray-600">
                <span>SKU: {product.identifiers.sku}</span>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                {/* Quantity Selector */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-900">Qty</span>
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 p-0 hover:bg-gray-50"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-12 text-center font-medium text-lg">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setQuantity(Math.min(parseInt(product.inventory.stock), quantity + 1))}
                      className="w-10 h-10 p-0 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!inStock}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-14 text-lg font-semibold rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  ADD TO CART
                </Button>
              </div>

              {/* Features */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                    <Truck className="w-3 h-3 text-green-600" />
                  </div>
                  <span>Free delivery on orders over $50</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                    <Shield className="w-3 h-3 text-blue-600" />
                  </div>
                  <span>1 year warranty included</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center">
                    <RotateCcw className="w-3 h-3 text-orange-600" />
                  </div>
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-8 lg:mt-12 px-4 sm:px-6 lg:px-8 pb-8">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-1 rounded-xl">
                <TabsTrigger value="description" className="rounded-lg">Description</TabsTrigger>
                <TabsTrigger value="specifications" className="rounded-lg">Specifications</TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-lg">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <p className="text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="specifications" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">SKU:</span>
                          <span className="text-gray-600">{product.identifiers.sku}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Barcode:</span>
                          <span className="text-gray-600">{product.identifiers.barcode}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Category:</span>
                          <span className="text-gray-600">{product.category.name}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {product.specifications.map((spec, index) => (
                          <div key={index} className="flex justify-between">
                            <span className="font-medium text-gray-900">{spec.name}:</span>
                            <span className="text-gray-600">{spec.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="reviews" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Customer Reviews</h3>
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            {renderStars(product.rating.average)}
                          </div>
                          <span className="text-sm text-gray-600">
                            ({product.rating.average.toFixed(1)} out of 5)
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        {product.reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-100 pb-4">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">
                                {review.user.name || `User ${review.user.id}`}
                              </span>
                              <div className="flex items-center space-x-1">
                                {renderStars(review.rating)}
                              </div>
                            </div>
                            <p className="text-gray-700">{review.comment}</p>
                            <p className="text-sm text-gray-500 mt-1">
                              {new Date(review.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <ImageZoom
          images={allImages}
          selectedIndex={selectedImage}
          open={showImageZoom}
          onOpenChange={setShowImageZoom}
          onImageChange={setSelectedImage}
        />
      </div>
    </StoreLayout>
  );
};

export default ProductDetail;
