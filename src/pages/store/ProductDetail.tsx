
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { StoreLayout } from '@/components/store/StoreLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, Heart, ShoppingCart, ArrowLeft, Plus, Minus, Truck, Shield, RotateCcw, ZoomIn } from 'lucide-react';
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

  if (!product) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
          <button onClick={() => navigate('/store')} className="hover:text-cyan-600">
            Store
          </button>
          <span>/</span>
          <button onClick={() => navigate('/store/categories')} className="hover:text-cyan-600">
            Categories
          </button>
          <span>/</span>
          <span className="text-gray-900 font-medium capitalize">{product.category}</span>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
              <img
                src={allImages[selectedImage]?.url}
                alt={allImages[selectedImage]?.alt}
                className="w-full h-full object-cover"
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowImageZoom(true)}
                className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Thumbnail Navigation */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === selectedImage
                        ? 'border-cyan-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Badge variant="secondary" className="capitalize">
                  {product.category}
                </Badge>
                {product.isFeatured && (
                  <Badge className="bg-cyan-500">Featured</Badge>
                )}
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center space-x-1">
                  {renderStars(product.rating)}
                </div>
                <span className="text-sm text-gray-600">({product.rating} out of 5)</span>
              </div>

              {/* Price */}
              <div className="text-3xl font-bold text-gray-900 mb-6">
                ${currentPrice.toFixed(2)}
                {currentPrice !== product.price && (
                  <span className="text-lg text-gray-500 line-through ml-2">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.inStock ? (
                  <Badge className="bg-green-500">In Stock</Badge>
                ) : (
                  <Badge variant="destructive">Out of Stock</Badge>
                )}
              </div>

              {/* Product Variations */}
              {product.variations.length > 0 && (
                <div className="mb-6">
                  <ProductVariations
                    variations={product.variations}
                    basePrice={product.price}
                    onVariationChange={handleVariationChange}
                  />
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-sm font-medium text-gray-900">Quantity:</span>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 p-0"
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-12 text-center font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 p-0"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-12"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {isInCart(product.id) ? 'Add More to Cart' : 'Add to Cart'}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleWishlistToggle}
                  className={`w-full h-12 ${isInWishlist(product.id) ? 'text-red-500 border-red-500' : ''}`}
                  size="lg"
                >
                  <Heart className={`w-5 h-5 mr-2 ${isInWishlist(product.id) ? 'fill-current' : ''}`} />
                  {isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </Button>
              </div>

              {/* Features */}
              <div className="border-t pt-6 space-y-4">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Truck className="w-5 h-5" />
                  <span>Free shipping on orders over $50</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <Shield className="w-5 h-5" />
                  <span>1 year warranty included</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <RotateCcw className="w-5 h-5" />
                  <span>30-day return policy</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-gray-700 leading-relaxed">
                    {product.description || `Discover the amazing features of ${product.name}. This high-quality product combines style, functionality, and durability to meet all your needs. Whether you're looking for everyday use or special occasions, this product delivers exceptional performance and value.`}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="specifications" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <span className="font-medium text-gray-900">SKU:</span>
                      <span className="text-gray-600">{product.sku}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="font-medium text-gray-900">Category:</span>
                      <span className="text-gray-600 capitalize">{product.category}</span>
                    </div>
                    {product.variations.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-medium text-gray-900">Available Options:</span>
                        <span className="text-gray-600">
                          {Array.from(new Set(product.variations.map(v => v.type))).join(', ')}
                        </span>
                      </div>
                    )}
                    <div className="space-y-2">
                      <span className="font-medium text-gray-900">Weight:</span>
                      <span className="text-gray-600">2.5 lbs</span>
                    </div>
                    <div className="space-y-2">
                      <span className="font-medium text-gray-900">Dimensions:</span>
                      <span className="text-gray-600">10" x 8" x 6"</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="reviews" className="mt-6">
              <Card>
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
                      <div className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">John D.</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(5)}
                          </div>
                        </div>
                        <p className="text-gray-700">Amazing product! Exactly what I was looking for. Great quality and fast shipping.</p>
                      </div>
                      
                      <div className="border-b pb-4">
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
