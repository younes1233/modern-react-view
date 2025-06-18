
import { useState, useEffect } from 'react';
import { StoreLayout } from '@/components/store/StoreLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, ShoppingCart, Grid, List } from 'lucide-react';
import { 
  getProductsByCategory, 
  getDisplaySettings,
  Product,
  DisplaySettings 
} from '@/data/storeData';

const StoreCategories = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings | null>(null);

  useEffect(() => {
    setProducts(getProductsByCategory(selectedCategory));
    setDisplaySettings(getDisplaySettings());
    if (displaySettings) {
      setViewMode(displaySettings.layout);
    }
  }, [selectedCategory]);

  const categories = [
    { id: 'all', name: 'All Products', count: products.length },
    { id: 'electronics', name: 'Electronics', count: products.filter(p => p.category === 'electronics').length },
    { id: 'furniture', name: 'Furniture', count: products.filter(p => p.category === 'furniture').length },
    { id: 'fashion', name: 'Fashion', count: products.filter(p => p.category === 'fashion').length },
    { id: 'home', name: 'Home & Tools', count: products.filter(p => p.category === 'home').length },
  ];

  const filteredProducts = getProductsByCategory(selectedCategory);

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
                ? displaySettings?.gridColumns === 2 ? 'grid-cols-1 md:grid-cols-2' :
                  displaySettings?.gridColumns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
                  displaySettings?.gridColumns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
                  displaySettings?.gridColumns === 5 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' :
                  'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}>
              {filteredProducts.slice(0, displaySettings?.productsPerPage || 12).map((product) => (
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
                      {product.discount && displaySettings?.showPricing && (
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
                      
                      {displaySettings?.showRatings && (
                        <div className="flex items-center mb-2">
                          <div className="flex text-yellow-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                            ))}
                          </div>
                          <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                        </div>
                      )}
                      
                      {displaySettings?.showPricing && (
                        <div className={`flex items-center justify-between ${viewMode === 'list' ? 'mb-4' : 'mb-3'}`}>
                          <div>
                            <span className="text-lg font-bold text-gray-900">${product.price}</span>
                            {product.originalPrice && (
                              <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                            )}
                          </div>
                        </div>
                      )}
                      
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
