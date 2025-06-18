
import { StoreLayout } from '@/components/store/StoreLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Star, ShoppingCart } from 'lucide-react';

const Store = () => {
  const heroCategories = [
    { name: 'FACEBOOK', image: '/placeholder.svg' },
    { name: 'INSTAGRAM', image: '/placeholder.svg' },
    { name: 'TIKTOK', image: '/placeholder.svg' },
    { name: 'FACEBOOK', image: '/placeholder.svg' },
    { name: 'INSTAGRAM', image: '/placeholder.svg' },
    { name: 'TIKTOK', image: '/placeholder.svg' },
  ];

  const categories = [
    { id: 1, name: 'Electronics', image: '/placeholder.svg', icon: '📱' },
    { id: 2, name: 'Furniture', image: '/placeholder.svg', icon: '🪑' },
    { id: 3, name: 'Fashion', image: '/placeholder.svg', icon: '👕' },
    { id: 4, name: 'Home & Tools', image: '/placeholder.svg', icon: '🔧' },
    { id: 5, name: 'Honey', image: '/placeholder.svg', icon: '🍯' },
    { id: 6, name: 'Home Tools', image: '/placeholder.svg', icon: '🏠' },
  ];

  const featuredProducts = [
    {
      id: 1,
      name: 'Comfortable Ergonomic Office Chair with Lumbar Support Cushion',
      price: 150,
      originalPrice: 200,
      image: '/placeholder.svg',
      rating: 4.5,
      reviews: 124,
      discount: 25
    },
    {
      id: 2,
      name: '3-Tier 3-Cube Heavy-Duty Shelf Storage Metal Shelf Heavy Duty',
      price: 29,
      originalPrice: 45,
      image: '/placeholder.svg',
      rating: 4.3,
      reviews: 89,
      discount: 35
    },
    {
      id: 3,
      name: 'Universal Black Wheel Heavy Duty 4" Universal Bench Wheel Heavy',
      price: 90,
      originalPrice: 120,
      image: '/placeholder.svg',
      rating: 4.7,
      reviews: 156,
      discount: 25
    },
    {
      id: 4,
      name: 'Samsung 75AU7000 AU 4K UHD TV Smart - 75AU7000 4K for great',
      price: 15,
      originalPrice: 25,
      image: '/placeholder.svg',
      rating: 4.2,
      reviews: 203,
      discount: 40
    },
    {
      id: 5,
      name: 'BAMENE Lion Dog Chew Toy with 50g Soft - BAMENE',
      price: 60,
      originalPrice: 80,
      image: '/placeholder.svg',
      rating: 4.6,
      reviews: 78,
      discount: 25
    },
    {
      id: 6,
      name: 'Miljan Trampoline WINOL TOTAL Safety Enclosure Safety Trampoline',
      price: 78,
      originalPrice: 95,
      image: '/placeholder.svg',
      rating: 4.4,
      reviews: 92,
      discount: 18
    },
  ];

  const membershipTiers = [
    { name: 'BRONZE', price: 'Free', features: ['Basic', 'Support', 'Free Shipping'], color: 'orange' },
    { name: 'SILVER', price: '$19', features: ['Premium', 'Support', 'Free Returns'], color: 'gray' },
    { name: 'GOLD', price: '$39', features: ['Premium+', 'Priority', 'Exclusive Deals'], color: 'yellow' },
    { name: 'PLATINO', price: '$59', features: ['VIP', 'Concierge', 'Early Access'], color: 'blue' },
    { name: 'DIAMANTE', price: '$99', features: ['Elite', 'Personal', 'Custom Service'], color: 'purple' },
  ];

  return (
    <StoreLayout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-cyan-400 to-cyan-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="flex justify-center space-x-8 mb-8 overflow-x-auto">
              {heroCategories.map((category, index) => (
                <div key={index} className="flex-shrink-0 text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-lg flex items-center justify-center mb-2">
                    <span className="text-lg font-bold">{category.name.slice(0, 2)}</span>
                  </div>
                  <span className="text-sm">{category.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <img 
              src="/placeholder.svg" 
              alt="Featured Products" 
              className="w-full max-w-4xl mx-auto rounded-lg shadow-2xl"
            />
            <div className="absolute bottom-4 right-4 bg-white text-gray-900 px-6 py-3 rounded-lg shadow-lg">
              <div className="text-2xl font-bold">961 70591705</div>
              <div className="text-sm">WWW.MEEMHOME.COM</div>
              <Button className="mt-2 bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-full">
                SHOP NOW
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">SHOP BY CATEGORY</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-12">
            {categories.map((category) => (
              <Card key={category.id} className="group cursor-pointer hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <span className="text-2xl">{category.icon}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Electronic Category Featured */}
          <div className="bg-gradient-to-r from-cyan-100 to-cyan-200 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-cyan-800 mb-6">Electronic</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
              {featuredProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="relative mb-4">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      {product.discount && (
                        <Badge className="absolute top-2 left-2 bg-red-500 text-white">
                          -{product.discount}%
                        </Badge>
                      )}
                    </div>
                    
                    <h4 className="font-medium text-sm text-gray-900 mb-2 line-clamp-2">{product.name}</h4>
                    
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : ''}`} />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500 ml-1">({product.reviews})</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <span className="text-lg font-bold text-gray-900">${product.price}</span>
                        {product.originalPrice && (
                          <span className="text-sm text-gray-500 line-through ml-2">${product.originalPrice}</span>
                        )}
                      </div>
                    </div>
                    
                    <Button className="w-full bg-cyan-500 hover:bg-cyan-600 text-white" size="sm">
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Add to Cart
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Membership Plans */}
      <section className="py-16 bg-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {membershipTiers.map((tier) => (
              <Card key={tier.name} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center ${
                    tier.color === 'orange' ? 'bg-orange-500' :
                    tier.color === 'gray' ? 'bg-gray-500' :
                    tier.color === 'yellow' ? 'bg-yellow-500' :
                    tier.color === 'blue' ? 'bg-blue-500' : 'bg-purple-500'
                  }`}>
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                  <div className="text-2xl font-bold text-cyan-600 mb-4">{tier.price}</div>
                  <div className="space-y-2 mb-6">
                    {tier.features.map((feature, index) => (
                      <div key={index} className="text-sm text-gray-600">{feature}</div>
                    ))}
                  </div>
                  <Button className={`w-full ${
                    tier.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
                    tier.color === 'gray' ? 'bg-gray-500 hover:bg-gray-600' :
                    tier.color === 'yellow' ? 'bg-yellow-500 hover:bg-yellow-600' :
                    tier.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-purple-500 hover:bg-purple-600'
                  } text-white`}>
                    Choose Plan
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </StoreLayout>
  );
};

export default Store;
