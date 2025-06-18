import { useState } from 'react';
import { StoreLayout } from '@/components/store/StoreLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Grid, List } from 'lucide-react';

const StoreCategories = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'All Products', count: 156 },
    { id: 'electronics', name: 'Electronics', count: 45 },
    { id: 'furniture', name: 'Furniture', count: 32 },
    { id: 'fashion', name: 'Fashion', count: 28 },
    { id: 'home', name: 'Home & Tools', count: 51 },
  ];

  const products = [
    {
      id: 1,
      name: 'Comfortable Ergonomic Office Chair with Lumbar Support Cushion',
      category: 'furniture',
      price: 150,
      originalPrice: 200,
      image: '/placeholder.svg',
      rating: 4.5,
      reviews: 124,
      discount: 25,
      inStock: true
    },
    {
      id: 2,
      name: '3-Tier 3-Cube Heavy-Duty Shelf Storage Metal Shelf Heavy Duty',
      category: 'furniture',
      price: 29,
      originalPrice: 45,
      image: '/placeholder.svg',
      rating: 4.3,
      reviews: 89,
      discount: 35,
      inStock: true
    },
    {
      id: 3,
      name: 'Universal Black Wheel Heavy Duty 4" Universal Bench Wheel Heavy',
      category: 'home',
      price: 90,
      originalPrice: 120,
      image: '/placeholder.svg',
      rating: 4.7,
      reviews: 156,
      discount: 25,
      inStock: false
    },
    {
      id: 4,
      name: 'Samsung 75AU7000 AU 4K UHD TV Smart - 75AU7000 4K for great',
      category: 'electronics',
      price: 15,
      originalPrice: 25,
      image: '/placeholder.svg',
      rating: 4.2,
      reviews: 203,
      discount: 40,
      inStock: true
    },
    {
      id: 5,
      name: 'BAMENE Lion Dog Chew Toy with 50g Soft - BAMENE',
      category: 'home',
      price: 60,
      originalPrice: 80,
      image: '/placeholder.svg',
      rating: 4.6,
      reviews: 78,
      discount: 25,
      inStock: true
    },
    {
      id: 6,
      name: 'Miljan Trampoline WINOL TOTAL Safety Enclosure Safety Trampoline',
      category: 'home',
      price: 78,
      originalPrice: 95,
      image: '/placeholder.svg',
      rating: 4.4,
      reviews: 92,
      discount: 18,
      inStock: true
    },
  ];

  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shop by Category</h1>
          <p className="text-gray-600">Discover our wide range of products</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className={`w-full justify-between ${
                        selectedCategory === category.id 
                          ? 'bg-cyan-500 hover:bg-cyan-600 text-white' 
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <span>{category.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {category.count}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="text-gray-600">
                Showing {filteredProducts.length} products
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-cyan-500 hover:bg-cyan-600' : ''}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Products Grid */}
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            }`}>
              {filteredProducts.map((product) => (
                <Card key={product.id} className={`group hover:shadow-lg transition-shadow ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}>
                  <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center space-x-6 w-full' : ''}`}>
                    <div className={`relative ${viewMode === 'list' ? 'w-48 h-48 flex-shrink-0' : 'mb-4'}`}>
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className={`w-full object-cover rounded-lg ${
                          viewMode === 'list' ? 'h-full' : 'h-48'
                        }`}
                      />
                      {product.discount && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          -{product.discount}%
                        </Badge>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                          <span className="text-white font-semibold">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    
                    <div className={viewMode === 'list' ? 'flex-1' : ''}>
                      <h4 className={`font-medium text-gray-900 mb-2 ${
                        viewMode === 'list' ? 'text-lg' : 'text-sm line-clamp-2'
                      }`}>
                        {product.name}
                      </h4>
                      
                      <div className="flex items-center mb-2">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                      </div>
                      
                      <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mb-4' : 'mb-3'}`}>
                        <div>
                          <span className="text-lg font-bold text-gray-900">${product.price}</span>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                          )}
                        </div>
                      </div>
                      
                      <Button 
                        className={`bg-cyan-500 hover:bg-cyan-600 text-white ${
                          viewMode === 'list' ? 'px-8' : 'w-full'
                        }`} 
                        size="sm"
                        disabled={!product.inStock}
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default StoreCategories;
