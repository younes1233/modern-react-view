
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Search, Menu, Heart, MapPin, Phone, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CartSidebar } from './CartSidebar';
import { useSearch } from '@/contexts/SearchContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';

interface StoreLayoutProps {
  children: ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const { searchQuery, setSearchQuery, clearSearch, isSearching, searchResults } = useSearch();
  const { items: wishlistItems } = useWishlist();
  const { getTotalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/store/categories');
      setShowSearchResults(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  const handleSearchResultClick = (productId: number) => {
    navigate(`/store/product/${productId}`);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleClearSearch = () => {
    clearSearch();
    setShowSearchResults(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/store" className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Store
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link to="/store" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                Home
              </Link>
              <Link to="/store/categories" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                Categories
              </Link>
              <button className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                Deals
              </button>
              <button className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                About
              </button>
            </nav>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8 relative">
              <form onSubmit={handleSearch} className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && isSearching && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-96 overflow-y-auto z-50">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      <div className="text-xs text-gray-500 px-3 py-2 border-b">
                        {searchResults.length} results found
                      </div>
                      {searchResults.slice(0, 6).map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleSearchResultClick(product.id)}
                          className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                        >
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-gray-900 truncate">
                              {product.name}
                            </h4>
                            <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                            <p className="text-sm font-medium text-cyan-600">
                              ${product.price.toFixed(2)}
                            </p>
                          </div>
                        </button>
                      ))}
                      {searchResults.length > 6 && (
                        <button
                          onClick={() => {
                            navigate('/store/categories');
                            setShowSearchResults(false);
                          }}
                          className="w-full p-3 text-center text-cyan-600 hover:bg-gray-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          View all {searchResults.length} results
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      <p>No products found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Link to="/store/wishlist">
                <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-cyan-50 hover:text-cyan-600 relative">
                  <Heart className="w-5 h-5" />
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Button variant="ghost" size="sm" className="hover:bg-cyan-50 hover:text-cyan-600">
                <User className="w-5 h-5" />
              </Button>
              <CartSidebar />
              <Button 
                className="md:hidden" 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden px-4 pb-4">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-50 focus:bg-white"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-2 space-y-1">
              <Link 
                to="/store" 
                className="block px-3 py-2 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/store/categories" 
                className="block px-3 py-2 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                to="/store/wishlist" 
                className="block px-3 py-2 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-md transition-colors font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Wishlist ({wishlistItems.length})
              </Link>
              <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-md transition-colors font-medium">
                Deals
              </button>
              <button className="block w-full text-left px-3 py-2 text-gray-700 hover:text-cyan-600 hover:bg-gray-50 rounded-md transition-colors font-medium">
                About
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 lg:py-16 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            <div className="lg:col-span-2">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Store</h3>
              <p className="text-gray-400 text-lg leading-relaxed mb-6">Your one-stop shop for everything you need. We offer quality products at unbeatable prices with exceptional customer service.</p>
              <div className="flex items-center gap-4 text-gray-400">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>123 Store Street</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>(555) 123-4567</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Quick Links</h4>
              <ul className="space-y-3 text-gray-400">
                <li><Link to="/store" className="hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/store/categories" className="hover:text-white transition-colors">Categories</Link></li>
                <li><Link to="/store/wishlist" className="hover:text-white transition-colors">Wishlist</Link></li>
                <li><button className="hover:text-white transition-colors">Deals</button></li>
                <li><button className="hover:text-white transition-colors">New Arrivals</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Customer Service</h4>
              <ul className="space-y-3 text-gray-400">
                <li><button className="hover:text-white transition-colors">Contact Us</button></li>
                <li><button className="hover:text-white transition-colors">FAQ</button></li>
                <li><button className="hover:text-white transition-colors">Shipping Info</button></li>
                <li><button className="hover:text-white transition-colors">Returns</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col lg:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center lg:text-left">&copy; 2024 Store. All rights reserved.</p>
            <div className="flex space-x-6">
              <button className="text-gray-400 hover:text-white transition-colors">Privacy Policy</button>
              <button className="text-gray-400 hover:text-white transition-colors">Terms of Service</button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
