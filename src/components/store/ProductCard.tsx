
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart, Heart } from "lucide-react";
import { Product } from "@/data/storeData";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group relative bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.isNewArrival && (
            <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium px-2 py-1 shadow-lg">
              New
            </Badge>
          )}
          {product.isOnSale && discountPercentage > 0 && (
            <Badge className="bg-red-500 hover:bg-red-600 text-white text-xs font-medium px-2 py-1 shadow-lg">
              -{discountPercentage}%
            </Badge>
          )}
          {!product.inStock && (
            <Badge className="bg-gray-500 text-white text-xs font-medium px-2 py-1 shadow-lg">
              Out of Stock
            </Badge>
          )}
        </div>

        {/* Wishlist Button */}
        <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-50 hover:text-red-500">
          <Heart className="w-4 h-4" />
        </button>

        {/* Quick View Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button 
            variant="secondary" 
            size="sm"
            className="bg-white/90 backdrop-blur-sm hover:bg-white"
          >
            Quick View
          </Button>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 lg:p-6">
        <h3 className="font-semibold text-gray-900 text-sm lg:text-base line-clamp-2 mb-2 leading-tight">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 lg:w-4 lg:h-4 ${
                  i < Math.floor(product.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-xs lg:text-sm text-gray-500 font-medium">
            ({product.reviews})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          <span className="font-bold text-lg lg:text-xl text-gray-900">
            ${product.price}
          </span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="text-sm lg:text-base text-gray-500 line-through">
              ${product.originalPrice}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button 
          className={`w-full transition-all duration-300 ${
            product.inStock 
              ? 'bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg hover:shadow-xl' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          size="sm"
          disabled={!product.inStock}
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
      </div>
    </div>
  );
}
