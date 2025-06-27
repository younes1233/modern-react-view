
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreLayout } from '@/components/store/StoreLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Star, Heart, ShoppingCart, ArrowLeft, Plus, Minus, Truck, Shield, RotateCcw, ZoomIn, Share, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { getProducts, getProductBySlug, Product, ProductVariation, calculateVariationPrice } from '@/data/storeData';
import { ProductVariations } from '@/components/store/ProductVariations';
import { ImageZoom } from '@/components/store/ImageZoom';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariations, setSelectedVariations] = useState<ProductVariation[]>([]);
  const [showImageZoom, setShowImageZoom] = useState(false);
  const [showThumbnails, setShowThumbnails] = useState(false);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const thumbnailTimeoutRef = useRef<NodeJS.Timeout>();
  const { addToCart, isInCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

  useEffect(() => {
    if (id) {
      // Try to find by slug first, then by ID
      let foundProduct = getProductBySlug(id);
      if (!foundProduct) {
        const products = getProducts();
        foundProduct = products.find(p => p.id === parseInt(id)) || null;
      }
      setProduct(foundProduct);
    }
  }, [id]);

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
    // Hide thumbnails when going back to first image
    if (index === 0) {
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

  if (!product) {
    return (
      <StoreLayout>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h1>
            <Button onClick={() => navigate('/store')} className="bg-cyan-600 hover:bg-cyan-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Store
            </Button>
          </div>
        </div>
      </StoreLayout>
    );
  }

  const currentPrice = calculateVariationPrice(product.price, selectedVariations);
  const allImages = [
    { url: product.image, alt: product.name },
    ...product.thumbnails.map(thumb => ({ url: thumb.url, alt: thumb.alt }))
  ];

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleWishlistToggle = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleVariationChange = (variations: ProductVariation[]) => {
    setSelectedVariations(variations);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  // Breadcrumb data
  const breadcrumbs = [
    { label: 'Home', path: '/store' },
    { label: 'Electronics & Mobiles', path: '/store/categories' },
    { label: 'Mobiles & Accessories', path: '/store/categories' },
    { label: 'Mobile Phones', path: '/store/categories' },
    { label: product.name, path: '', current: true }
  ];

  return (
    <StoreLayout>
      <div className="min-h-screen bg-white">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40 px-4 py-3">
          <div className="flex items-center justify-end">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleWishlistToggle}
                className={`p-2 ${isInWishlist(product.id) ? 'text-red-500' : ''}`}
              >
                <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="p-2"
              >
                <Share className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          {/* Enhanced Mobile Breadcrumb Navigation */}
          <div className="lg:hidden px-4 py-2 border-b border-gray-100">
            <div className="w-full overflow-x-auto">
              <div className="flex items-center space-x-1 text-xs text-gray-500 whitespace-nowrap">
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
              <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                  display: none;
                }
                .scrollbar-hide {
                  -ms-overflow-style: none;
                  scrollbar-width: none;
                }
              `}</style>
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
                onTouchStart={handleImageInteraction}
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
                  {product.inStock ? (
                    <Badge className="bg-green-500 text-white">In Stock</Badge>
                  ) : (
                    <Badge variant="destructive">Out of Stock</Badge>
                  )}
                </div>

                {/* Mobile: Smaller pagination dots */}
                {allImages.length > 1 && (
                  <div className="lg:hidden absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="flex space-x-1.5">
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
                              : 'bg-white/50 hover:bg-white/75'
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
                  {/* Mobile: Conditional thumbnails - only show when not on first image and when showThumbnails is true */}
                  <div className={`lg:hidden mt-4 px-4 transition-all duration-300 ${
                    showThumbnails && selectedImage > 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
                  }`}>
                    <div className="w-full overflow-x-auto">
                      <div className="flex gap-2 pb-2">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              handleImageChange(index);
                              setShowThumbnails(false);
                            }}
                            className={`flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md ${
                              index === selectedImage
                                ? 'w-14 h-14 shadow-lg scale-110'
                                : 'w-12 h-12 hover:scale-105'
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
                      <style>{`
                        .scrollbar-hide::-webkit-scrollbar {
                          display: none;
                        }
                        .scrollbar-hide {
                          -ms-overflow-style: none;
                          scrollbar-width: none;
                        }
                      `}</style>
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
                    {product.category}
                  </Badge>
                  {product.isFeatured && (
                    <Badge className="bg-cyan-500 text-xs">Featured</Badge>
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
              </div>
              
              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-1">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-gray-600">
                  {product.rating} ({Math.floor(Math.random() * 1000 + 100)}k reviews)
                </span>
              </div>

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-3">
                  <span className="text-3xl lg:text-4xl font-bold text-gray-900">
                    ${currentPrice.toFixed(2)}
                  </span>
                  {currentPrice !== product.price && (
                    <span className="text-lg text-gray-500 line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  )}
                  {currentPrice !== product.price && (
                    <Badge className="bg-red-500 text-white">
                      {Math.round(((product.price - currentPrice) / product.price) * 100)}% Off
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-gray-600">Inclusive of VAT</p>
              </div>

              {/* Desktop Stock Status */}
              <div className="hidden lg:block">
                {product.inStock ? (
                  <Badge className="bg-green-500 text-white">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              {/* Product Variations */}
              {product.variations.length > 0 && (
                <div className="space-y-4">
                  <ProductVariations
                    variations={product.variations}
                    basePrice={product.price}
                    onVariationChange={handleVariationChange}
                  />
                </div>
              )}

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
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 p-0 hover:bg-gray-50"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
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
                      {product.description || `Discover the amazing features of ${product.name}. This high-quality product combines style, functionality, and durability to meet all your needs. Whether you're looking for everyday use or special occasions, this product delivers exceptional performance and value.`}
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
                          <span className="text-gray-600">{product.sku}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Category:</span>
                          <span className="text-gray-600 capitalize">{product.category}</span>
                        </div>
                        {product.variations.length > 0 && (
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Available Options:</span>
                            <span className="text-gray-600">
                              {Array.from(new Set(product.variations.map(v => v.type))).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Weight:</span>
                          <span className="text-gray-600">2.5 lbs</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-900">Dimensions:</span>
                          <span className="text-gray-600">10" x 8" x 6"</span>
                        </div>
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
                            {renderStars(product.rating)}
                          </div>
                          <span className="text-sm text-gray-600">({product.rating} out of 5)</span>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="border-b border-gray-100 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">John D.</span>
                            <div className="flex items-center space-x-1">
                              {renderStars(5)}
                            </div>
                          </div>
                          <p className="text-gray-700">Amazing product! Exactly what I was looking for. Great quality and fast shipping.</p>
                        </div>
                        
                        <div className="border-b border-gray-100 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Sarah M.</span>
                            <div className="flex items-center space-x-1">
                              {renderStars(4)}
                            </div>
                          </div>
                          <p className="text-gray-700">Very satisfied with this purchase. Good value for money and excellent customer service.</p>
                        </div>
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
