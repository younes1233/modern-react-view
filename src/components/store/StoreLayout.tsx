
import { ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Search, Menu, Heart, MapPin, Phone, X, LogOut, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CartSidebar } from './CartSidebar';
import { AuthModal } from '../auth/AuthModal';
import { useSearch } from '@/contexts/SearchContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import * as Portal from '@radix-ui/react-portal';

interface StoreLayoutProps {
  children: ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const { searchQuery, setSearchQuery, clearSearch, searchResults } = useSearch();
  const { items: wishlistItems } = useWishlist();
  const { getTotalItems } = useCart();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showMobileSearchResults, setShowMobileSearchResults] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);
  const [mobileSearchInputRef, setMobileSearchInputRef] = useState<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  // Force light mode for store layout
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/store/categories');
      setShowSearchResults(false);
      setShowMobileSearchResults(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchResults(value.length > 0);
  };

  const handleMobileSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowMobileSearchResults(value.length > 0);
  };

  const handleSearchResultClick = (productId: number) => {
    navigate(`/store/product/${productId}`);
    setShowSearchResults(false);
    setShowMobileSearchResults(false);
    setSearchQuery('');
  };

  const handleClearSearch = () => {
    clearSearch();
    setShowSearchResults(false);
    setShowMobileSearchResults(false);
  };

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate('/store');
  };

  const getSearchDropdownPosition = (inputRef: HTMLInputElement | null) => {
    if (!inputRef) return { top: 0, left: 0, width: 0 };
    
    const rect = inputRef.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 light overflow-x-hidden">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg border-b border-white/20 sticky top-0 z-50 w-full overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between h-16 md:h-20 lg:h-24 gap-2 md:gap-4">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link to="/store" className="hover:scale-105 transition-transform duration-300">
                <img 
                  src="/lovable-uploads/998ce7ed-f62f-4b8a-aaea-f84e808a5b26.png" 
                  alt="Meem Home" 
                  className="h-16 md:h-20 lg:h-24 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Navigation */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8 flex-shrink-0">
              <Link to="/store/categories" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group text-sm xl:text-base">
                Categories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <Link to="/store/returns" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group text-sm xl:text-base">
                Returns
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link>
              <button className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group text-sm xl:text-base">
                Deals
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
              <button className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group text-sm xl:text-base">
                About
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </button>
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-lg xl:max-w-xl mx-4 xl:mx-8 relative">
              <form onSubmit={handleSearch} className="relative w-full flex border-[4px] border-cyan-400">
                <Input
                  ref={setSearchInputRef}
                  type="text"
                  placeholder="Search Meem or type"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="flex-1 h-7 px-4 py-2 border-0 bg-white shadow-none focus:ring-0 focus:outline-none focus:border-transparent text-gray-700 placeholder:text-gray-500"
                />
                <button
                  type="submit"
                  className="h-7 px-6 xl:px-8 bg-cyan-400 text-white hover:bg-cyan-500 transition-colors duration-300 flex items-center justify-center text-lg xl:text-xl font-normal"
                >
                  Search
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-20 xl:right-24 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0">
              <Link to="/store/wishlist">
                <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-blue-50 hover:text-blue-600 relative rounded-xl transition-all duration-300 p-2">
                  <Heart className="w-4 h-4 md:w-5 md:h-5" />
                  {wishlistItems.length > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg">
                      {wishlistItems.length}
                    </Badge>
                  )}
                </Button>
              </Link>
              
              {/* User Menu */}
              {user ? (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-300 p-2">
                      <User className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 bg-white/95 backdrop-blur-md border-gray-200 rounded-2xl shadow-2xl" align="end">
                    <div className="space-y-4">
                      <div className="border-b border-gray-100 pb-3">
                        <p className="font-semibold text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="space-y-2">
                        <Link to="/store/wishlist" className="block w-full text-left">
                          <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300">
                            <Heart className="w-4 h-4 mr-3" />
                            My Wishlist
                          </Button>
                        </Link>
                        <Link to="/store/returns" className="block w-full text-left">
                          <Button variant="ghost" className="w-full justify-start rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-300">
                            <RotateCcw className="w-4 h-4 mr-3" />
                            Returns
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={handleLogout}
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all duration-300"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-300 p-2"
                  onClick={() => openAuthModal('signin')}
                >
                  <User className="w-4 h-4 md:w-5 md:h-5" />
                </Button>
              )}
              
              <CartSidebar />
              <Button 
                className="lg:hidden rounded-xl p-2" 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden px-3 md:px-6 pb-4 relative w-full overflow-hidden">
          <form onSubmit={handleSearch} className="relative w-full flex border-[4px] border-cyan-400">
            <Input
              ref={setMobileSearchInputRef}
              type="text"
              placeholder="Search Meem or type"
              value={searchQuery}
              onChange={handleMobileSearchInputChange}
              onFocus={() => setShowMobileSearchResults(searchQuery.length > 0)}
              onBlur={() => setTimeout(() => setShowMobileSearchResults(false), 200)}
              className="flex-1 h-7 md:h-8 px-4 py-2 border-0 bg-white shadow-none focus:ring-0 focus:outline-none focus:border-transparent text-gray-700 placeholder:text-gray-500"
            />
            <button
              type="submit"
              className="h-7 md:h-8 px-4 md:px-6 bg-cyan-400 text-white hover:bg-cyan-500 transition-colors duration-300 flex items-center justify-center text-base md:text-lg font-normal"
            >
              <span className="hidden md:inline">Search</span>
              <Search className="w-4 h-4 md:hidden" />
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-12 md:right-20 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-100 bg-white/95 backdrop-blur-md w-full overflow-hidden">
            <div className="px-1 md:px-2 py-3 space-y-2">
              <Link 
                to="/store" 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/store/categories" 
                className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Categories
              </Link>
              <Link 
                to="/store/returns" 
                className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Returns
              </Link>
              <Link 
                to="/store/wishlist" 
                className="block px-4 py-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-300 font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Wishlist ({wishlistItems.length})
              </Link>
              {!user && (
                <>
                  <button 
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                    onClick={() => {
                      openAuthModal('signin');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                    onClick={() => {
                      openAuthModal('signup');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
              <button className="block w-full text-left px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium">
                Deals
              </button>
              <button className="block w-full text-left px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium">
                About
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Social Media Banner */}
      <div className="bg-cyan-400 text-white py-2 md:py-3 w-full overflow-hidden">
        <div className="w-full max-w-7xl mx-auto px-4">
          <div className="flex justify-center items-center">
            <div className="flex items-center gap-4 md:gap-8 lg:gap-12 text-sm md:text-base lg:text-lg font-light tracking-wider">
              <div className="flex items-center gap-4 md:gap-8 lg:gap-12 animate-scroll">
                <span className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap">TIKTOK</span>
                <span className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap">INSTAGRAM</span>
                <span className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap">FACEBOOK</span>
                <span className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap">TIKTOK</span>
                <span className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap">INSTAGRAM</span>
                <span className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap">FACEBOOK</span>
                <span className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap">TIKTOK</span>
                <span className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap">INSTAGRAM</span>
                <span className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap">FACEBOOK</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Search Results Dropdown - Rendered as Portal */}
      {showSearchResults && searchQuery.length > 0 && searchInputRef && (
        <Portal.Root>
          <div 
            className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-[9999]"
            style={{
              top: getSearchDropdownPosition(searchInputRef).top,
              left: getSearchDropdownPosition(searchInputRef).left,
              width: getSearchDropdownPosition(searchInputRef).width,
            }}
          >
            {searchResults.length > 0 ? (
              <div className="p-2">
                <div className="text-xs text-gray-500 px-4 py-3 border-b border-gray-100">
                  {searchResults.length} results found
                </div>
                {searchResults.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSearchResultClick(product.id)}
                    className="w-full flex items-center space-x-4 p-4 hover:bg-blue-50 rounded-xl transition-all duration-300 text-left"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-xl shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      <p className="text-sm font-semibold text-blue-600">
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
                    className="w-full p-4 text-center text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  >
                    View all {searchResults.length} results
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p>No products found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </Portal.Root>
      )}

      {/* Mobile Search Results Dropdown - Rendered as Portal */}
      {showMobileSearchResults && searchQuery.length > 0 && mobileSearchInputRef && (
        <Portal.Root>
          <div 
            className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-[9999]"
            style={{
              top: getSearchDropdownPosition(mobileSearchInputRef).top,
              left: getSearchDropdownPosition(mobileSearchInputRef).left,
              width: getSearchDropdownPosition(mobileSearchInputRef).width,
            }}
          >
            {searchResults.length > 0 ? (
              <div className="p-2">
                <div className="text-xs text-gray-500 px-4 py-3 border-b border-gray-100">
                  {searchResults.length} results found
                </div>
                {searchResults.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSearchResultClick(product.id)}
                    className="w-full flex items-center space-x-4 p-4 hover:bg-blue-50 rounded-xl transition-all duration-300 text-left"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-12 h-12 object-cover rounded-xl shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                      <p className="text-sm font-semibold text-blue-600">
                        ${product.price.toFixed(2)}
                      </p>
                    </div>
                  </button>
                ))}
                {searchResults.length > 6 && (
                  <button
                    onClick={() => {
                      navigate('/store/categories');
                      setShowMobileSearchResults(false);
                    }}
                    className="w-full p-4 text-center text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  >
                    View all {searchResults.length} results
                  </button>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
                <p>No products found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </Portal.Root>
      )}

      {/* Main Content */}
      <main className="w-full overflow-x-hidden">
        {children}
      </main>

      {/* Footer - New Design Based on Reference Image */}
      <footer className="bg-gradient-to-br from-gray-50 to-cyan-50 text-gray-700 py-12 lg:py-16 mt-8 lg:mt-16 w-full overflow-hidden relative">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-16 left-16 text-6xl text-cyan-500 transform rotate-12">+</div>
          <div className="absolute top-32 right-24 text-4xl text-cyan-500 transform -rotate-12">×</div>
          <div className="absolute bottom-16 left-24 text-5xl text-cyan-500 transform rotate-45">+</div>
          <div className="absolute bottom-32 right-16 text-3xl text-cyan-500 transform -rotate-45">×</div>
          <div className="absolute top-1/2 left-1/4 text-4xl text-cyan-500 transform rotate-12">+</div>
          <div className="absolute top-1/3 right-1/3 text-3xl text-cyan-500 transform -rotate-12">×</div>
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
            {/* Meem Home Brand Section */}
            <div className="lg:col-span-1">
              <h3 className="text-4xl lg:text-5xl font-bold mb-6 bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                Meem<br />Home
              </h3>
              <div className="flex space-x-4 mb-8">
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-600 transition-colors cursor-pointer">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-cyan-500 rounded-full flex items-center justify-center text-white hover:bg-cyan-600 transition-colors cursor-pointer">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white hover:bg-pink-600 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">@</span>
                </div>
              </div>
              
              {/* Cyan decorative bars */}
              <div className="flex space-x-2 mb-8">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="h-1 bg-cyan-400 rounded-full"
                    style={{ width: `${Math.random() * 30 + 20}px` }}
                  ></div>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-6 text-lg text-cyan-600">Quick Links</h4>
              <ul className="space-y-4 text-gray-600">
                <li><Link to="/store" className="hover:text-cyan-600 transition-colors">Home</Link></li>
                <li><button className="hover:text-cyan-600 transition-colors">About</button></li>
                <li><button className="hover:text-cyan-600 transition-colors">Contact</button></li>
                <li><button className="hover:text-cyan-600 transition-colors">Terms & Conditions</button></li>
                <li><button className="hover:text-cyan-600 transition-colors">Privacy Policy</button></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-bold mb-6 text-lg text-cyan-600">Have a Questions?</h4>
              <div className="space-y-4 text-gray-600">
                <p>mejdiaya-tripoli-lebanon</p>
                <p className="font-semibold text-gray-800">+961 76 591 765</p>
                <p>info@email</p>
              </div>
            </div>
          </div>

          <Separator className="my-12 bg-cyan-200" />

          {/* Bottom Section */}
          <div className="text-center space-y-4">
            <p className="text-sm text-cyan-600">
              This site is protected by recaptcha and the Google Privacy Policy and Terms Service apply.
            </p>
            <p className="text-sm text-gray-500">
              Meemhome 2025 Copyright
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultMode={authMode}
      />

      <style>
        {`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          .animate-scroll {
            animation: scroll 20s linear infinite;
          }
        `}
      </style>
    </div>
  );
}
