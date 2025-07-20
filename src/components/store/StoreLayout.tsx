import { ReactNode, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Search, Menu, Heart, MapPin, Phone, X, LogOut, RotateCcw, Home, Grid, ShoppingBag, Plus, ChevronDown } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { CartSidebar } from './CartSidebar';
import { AuthModal } from '../auth/AuthModal';
import { useSearch } from '@/contexts/SearchContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from '@/components/ui/drawer';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import * as Portal from '@radix-ui/react-portal';

interface StoreLayoutProps {
  children: ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const { searchQuery, setSearchQuery, clearSearch, searchResults } = useSearch();
  const { items: wishlistItems } = useWishlist();
  const { getTotalItems } = useCart();
  const auth = useAuth();
  const user = auth?.user || null;
  const logout = auth?.logout;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [showMobileSearchResults, setShowMobileSearchResults] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);
  const [mobileSearchInputRef, setMobileSearchInputRef] = useState<HTMLInputElement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Force light mode for store layout
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark');
    root.classList.add('light');
  }, []);

  // Prevent body scroll when mobile menu is open and fix iOS viewport issues
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.body.style.height = '100%';
      // Prevent iOS Safari address bar resize issues
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover');
      }
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.height = 'unset';
      // Restore normal viewport
      const viewport = document.querySelector('meta[name=viewport]');
      if (viewport) {
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
      }
    }
    
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
      document.body.style.height = 'unset';
    };
  }, [isMobileMenuOpen]);

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

  const handleSearchResultClick = (productSlug: string) => {
    navigate(`/store/product/${productSlug}`);
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
    if (logout) {
      logout();
      navigate('/store');
    }
  };

  const getSearchDropdownPosition = (inputRef: HTMLInputElement | null) => {
    if (!inputRef) return { top: 0, left: 0, width: 0 };
    
    const rect = inputRef.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left,
      width: Math.min(rect.width + 50, 400)
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-blue-100 light overflow-x-hidden">
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
                  className="h-12 md:h-20 lg:h-24 w-auto object-contain"
                />
              </Link>
            </div>

            {/* Navigation - Desktop only */}
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
                  className="flex-1 h-7 px-4 py-2 border-0 bg-white shadow-none focus:ring-0 focus:outline-none focus:border-transparent focus:shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 placeholder:text-gray-500 text-base"
                  style={{ fontSize: '16px' }}
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

            {/* Desktop Actions */}
         <div className="hidden lg:flex items-center space-x-2 md:space-x-3 lg:space-x-4 flex-shrink-0">
  <Link to="/store/wishlist">
    <Button
      variant="ghost"
      size="sm"
      className="hover:bg-blue-50 hover:text-blue-600 transition-all duration-300 p-2 relative"
    >
      <div className="relative">
        <Heart className="w-4 h-4 md:w-5 md:h-5" />
        {wishlistItems.length > 0 && (
          <span className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-5 h-4 flex items-center justify-center font-bold shadow-lg">
            {wishlistItems.length}
          </span>
        )}
      </div>
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

            {/* Mobile: Search Bar and Menu Button */}
            <div className="lg:hidden flex items-center flex-1 gap-2">
              <div className="flex-1 relative">
                <form onSubmit={handleSearch} className="relative w-full flex border-[3px] border-cyan-400 rounded-full overflow-hidden">
                  <Input
                    ref={setMobileSearchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleMobileSearchInputChange}
                    onFocus={() => setShowMobileSearchResults(searchQuery.length > 0)}
                    onBlur={() => setTimeout(() => setShowMobileSearchResults(false), 200)}
                    className="flex-1 h-8 px-4 py-2 border-0 bg-white shadow-none focus:ring-0 focus:outline-none focus:border-transparent focus:shadow-none ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-gray-700 placeholder:text-gray-400 rounded-full"
                    style={{ fontSize: '16px' }}
                  />
                  <button
                    type="submit"
                    className="h-8 px-3 bg-cyan-400 text-white hover:bg-cyan-500 transition-colors duration-300 flex items-center justify-center"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="absolute right-10 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </form>
              </div>
              
              {/* Mobile Menu Button */}
              <Button 
                className="rounded-xl p-2 w-10 h-10" 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] lg:hidden">
          {/* Enhanced Backdrop */}
          <div 
            className={`absolute inset-0 backdrop-blur-md transition-all duration-500 ease-out ${
              isMobileMenuOpen ? 'bg-black/40' : 'bg-black/0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Enhanced Sidebar with better animation */}
          <div 
            className={`absolute left-0 top-0 h-full w-[85%] max-w-sm bg-white/95 backdrop-blur-xl shadow-2xl transform transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            style={{
              borderTopRightRadius: '24px',
              borderBottomRightRadius: '24px',
            }}
          >
            {/* Header with gradient */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100/50 bg-gradient-to-r from-cyan-50/80 to-blue-50/80 backdrop-blur-sm rounded-tr-3xl">
              <h2 className="text-xl font-semibold text-gray-900 animate-fade-in">Menu</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="rounded-full p-2 hover:bg-white/50 transition-all duration-300 hover:scale-110 hover:rotate-90"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-6 h-6" />
              </Button>
            </div>
            
            {/* Content with staggered animations */}
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {[
                { to: "/store", icon: Home, label: "Home", delay: "0.1s" },
                { to: "/store/categories", icon: Grid, label: "Categories", delay: "0.2s" },
                { to: "/store/wishlist", icon: Heart, label: "Wishlist", delay: "0.3s", badge: wishlistItems.length },
                { to: "/store/returns", icon: RotateCcw, label: "Returns", delay: "0.4s" }
              ].map((item, index) => (
                <Link 
                  key={item.to}
                  to={item.to} 
                  className={`flex items-center gap-4 px-4 py-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-2xl transition-all duration-500 font-medium group transform hover:scale-[1.02] hover:translate-x-2 animate-fade-in opacity-0`}
                  style={{ 
                    animationDelay: item.delay,
                    animationFillMode: 'forwards',
                    animationDuration: '0.6s'
                  }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full animate-pulse">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              ))}
              
              {/* Animated Divider */}
              <div className="border-t border-gray-200 my-6 animate-fade-in opacity-0" style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}></div>
              
              {/* User Section with enhanced animations */}
              {!user ? (
                <>
                  {[
                    { onClick: () => { openAuthModal('signin'); setIsMobileMenuOpen(false); }, icon: User, label: "Sign In", delay: "0.6s" },
                    { onClick: () => { openAuthModal('signup'); setIsMobileMenuOpen(false); }, icon: Plus, label: "Sign Up", delay: "0.7s" }
                  ].map((item, index) => (
                    <button 
                      key={item.label}
                      className={`flex items-center gap-4 w-full px-4 py-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-2xl transition-all duration-500 font-medium group transform hover:scale-[1.02] hover:translate-x-2 animate-fade-in opacity-0`}
                      style={{ 
                        animationDelay: item.delay,
                        animationFillMode: 'forwards',
                        animationDuration: '0.6s'
                      }}
                      onClick={item.onClick}
                    >
                      <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                      <span>{item.label}</span>
                    </button>
                  ))}
                </>
              ) : (
                <>
                  <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl animate-fade-in opacity-0 backdrop-blur-sm" style={{ animationDelay: '0.6s', animationFillMode: 'forwards' }}>
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-4 w-full px-4 py-4 text-red-600 hover:text-red-700 hover:bg-red-50/80 rounded-2xl transition-all duration-500 font-medium group transform hover:scale-[1.02] hover:translate-x-2 animate-fade-in opacity-0"
                    style={{ animationDelay: '0.7s', animationFillMode: 'forwards', animationDuration: '0.6s' }}
                  >
                    <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
              
              {/* Additional Menu Items */}
              {[
                { icon: ShoppingBag, label: "Deals", delay: "0.8s" },
                { icon: Phone, label: "About", delay: "0.9s" }
              ].map((item, index) => (
                <button 
                  key={item.label}
                  className={`flex items-center gap-4 w-full px-4 py-4 text-gray-700 hover:text-blue-600 hover:bg-blue-50/80 rounded-2xl transition-all duration-500 font-medium group transform hover:scale-[1.02] hover:translate-x-2 animate-fade-in opacity-0`}
                  style={{ 
                    animationDelay: item.delay,
                    animationFillMode: 'forwards',
                    animationDuration: '0.6s'
                  }}
                >
                  <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
                <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
                  {searchResults.length} results found
                </div>
                {searchResults.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSearchResultClick(product.slug)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-xl transition-all duration-300 text-left"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-8 h-8 object-cover rounded-lg shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate text-xs">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                      <p className="text-xs font-semibold text-blue-600">
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
                    className="w-full p-3 text-center text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium text-sm"
                  >
                    View all {searchResults.length} results
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No products found for "{searchQuery}"</p>
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
              width: Math.min(getSearchDropdownPosition(mobileSearchInputRef).width, 350),
            }}
          >
            {searchResults.length > 0 ? (
              <div className="p-2">
                <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
                  {searchResults.length} results found
                </div>
                {searchResults.slice(0, 6).map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSearchResultClick(product.slug)}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-xl transition-all duration-300 text-left"
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-8 h-8 object-cover rounded-lg shadow-md"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate text-xs">
                        {product.name}
                      </h4>
                      <p className="text-xs text-gray-500 capitalize">{product.category}</p>
                      <p className="text-xs font-semibold text-blue-600">
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
                    className="w-full p-3 text-center text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium text-sm"
                  >
                    View all {searchResults.length} results
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No products found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </Portal.Root>
      )}

      {/* Main Content */}
      <main className="w-full overflow-x-hidden pb-6 lg:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation - Reduced height */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 animate-bottom-nav">
        <div className="flex items-center justify-around py-1 px-4">
          <Link to="/store" className="flex flex-col items-center group">
            <div className={`p-1 rounded-xl transition-all duration-300 ${location.pathname === '/store' ? 'bg-cyan-400 text-white transform scale-110' : 'text-gray-600 group-hover:bg-cyan-50 group-hover:text-cyan-600'}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className={`text-xs mt-0.5 transition-colors duration-300 ${location.pathname === '/store' ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>
              Home
            </span>
          </Link>

          <Link to="/store/categories" className="flex flex-col items-center group">
            <div className={`p-1 rounded-xl transition-all duration-300 ${location.pathname === '/store/categories' ? 'bg-cyan-400 text-white transform scale-110' : 'text-gray-600 group-hover:bg-cyan-50 group-hover:text-cyan-600'}`}>
              <Grid className="w-5 h-5" />
            </div>
            <span className={`text-xs mt-0.5 transition-colors duration-300 ${location.pathname === '/store/categories' ? 'text-cyan-600 font-medium' : 'text-gray-500'}`}>
              Categories
            </span>
          </Link>

          <Link to="/store/wishlist" className="flex flex-col items-center group relative">
            <div className={`p-1 rounded-xl transition-all duration-300 ${location.pathname === '/store/wishlist' ? 'bg-pink-400 text-white transform scale-110' : 'text-gray-600 group-hover:bg-pink-50 group-hover:text-pink-600'}`}>
              <Heart className="w-5 h-5" />
            </div>
            <span className={`text-xs mt-0.5 transition-colors duration-300 ${location.pathname === '/store/wishlist' ? 'text-pink-600 font-medium' : 'text-gray-500'}`}>
              Wishlist
            </span>
            {wishlistItems.length > 0 && (
              <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold shadow-lg animate-pulse">
                {wishlistItems.length}
              </Badge>
            )}
          </Link>

          {/* User/Account Button */}
          {user ? (
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex flex-col items-center group">
                  <div className="p-1 rounded-xl text-gray-600 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all duration-300">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-xs mt-0.5 text-gray-500 transition-colors duration-300">
                    Account
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 bg-white/95 backdrop-blur-md border-gray-200 rounded-2xl shadow-2xl mb-4" align="end">
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
            <button 
              className="flex flex-col items-center group"
              onClick={() => openAuthModal('signin')}
            >
              <div className="p-1 rounded-xl text-gray-600 group-hover:bg-cyan-50 group-hover:text-cyan-600 transition-all duration-300">
                <User className="w-5 h-5" />
              </div>
              <span className="text-xs mt-0.5 text-gray-500 transition-colors duration-300">
                Account
              </span>
            </button>
          )}

          {/* Cart Button - Fixed to only show blue badge */}
          <div className="flex flex-col items-center group relative">
            <CartSidebar />
            <span className="text-xs mt-0.5 text-gray-500 transition-colors duration-300">
              Cart
            </span>
          </div>
        </div>
      </div>

      {/* Footer - Mobile Responsive with Dropdowns */}
<footer className="bg-white text-gray-700 py-12 lg:py-8 mt-[2px] lg:mt-10 w-full overflow-hidden relative">
        {/* Decorative Background Pattern */}
        <div className="absolute inset-0 opacity-70">
          <div className="absolute top-16 left-16 text-6xl text-cyan-400 transform rotate-12">+</div>
          <div className="absolute top-32 right-24 text-4xl text-cyan-400 transform -rotate-12">×</div>
          <div className="absolute bottom-16 left-24 text-5xl text-cyan-400 transform rotate-45">+</div>
          <div className="absolute bottom-32 right-16 text-3xl text-cyan-400 transform -rotate-45">×</div>
          <div className="absolute top-1/2 left-1/4 text-4xl text-cyan-400 transform rotate-12">+</div>
          <div className="absolute top-1/3 right-1/3 text-3xl text-cyan-400 transform -rotate-12">×</div>
          <div className="absolute top-20 right-1/4 text-5xl text-cyan-400 transform rotate-12">+</div>
          <div className="absolute bottom-20 left-1/3 text-4xl text-cyan-400 transform -rotate-12">×</div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
          {/* Email Subscription Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-light mb-8 text-cyan-400">
              Get Your Order Now
            </h2>
            <div className="flex justify-center">
              <div className="relative max-w-lg w-full">
                <div className="border-4 border-cyan-400 rounded-full overflow-hidden bg-white flex">
                  <Input
                    type="email"
                    placeholder="Type your email here"
                    className="flex-1 border-0 bg-transparent px-6 py-4 focus:ring-0 focus:outline-none focus:border-transparent focus:shadow-none ring-0 text-gray-700 placeholder:text-gray-400 rounded-none"
                    style={{ fontSize: '16px' }}
                  />
                  <Button className="bg-cyan-400 hover:bg-cyan-500 text-white px-8 py-4 rounded-none border-0 font-medium">
                    →
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
            {/* Meem Home Brand Section */}
            <div className="md:col-span-1">
              <h3 className="text-4xl lg:text-5xl font-light mb-8 text-cyan-400">
                Meem<br />Home
              </h3>
              <div className="flex space-x-3 mb-8">
                <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">@</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-6 text-lg text-cyan-400">Quick Links</h4>
              <ul className="space-y-3 text-gray-600">
                <li><Link to="/store" className="hover:text-cyan-400 transition-colors">Home</Link></li>
                <li><button className="hover:text-cyan-400 transition-colors">About</button></li>
                <li><button className="hover:text-cyan-400 transition-colors">Contact</button></li>
                <li><button className="hover:text-cyan-400 transition-colors">Terms & Conditions</button></li>
                <li><button className="hover:text-cyan-400 transition-colors">Privacy Policy</button></li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-6 text-lg text-cyan-400">Have a Questions?</h4>
              <div className="space-y-3 text-gray-600">
                <p>mejdiaya-tripoli-lebanon</p>
                <p className="font-semibold text-gray-800">+961 76 591 765</p>
                <p>info@email</p>
              </div>
            </div>
          </div>

          {/* Mobile Layout with Dropdowns */}
          <div className="md:hidden space-y-4">
            {/* Meem Home Brand Section - Always visible */}
            <div className="text-center">
              <h3 className="text-3xl font-light mb-6 text-cyan-400">
                Meem Home
              </h3>
              <div className="flex justify-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">in</span>
                </div>
                <div className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer">
                  <span className="text-sm font-bold">@</span>
                </div>
              </div>
            </div>

            {/* Quick Links Dropdown */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 group">
                <h4 className="font-medium text-sm text-cyan-400 group-hover:text-cyan-500 transition-colors duration-300">Quick Links</h4>
                <ChevronDown className="w-4 h-4 text-cyan-400 transition-transform duration-300 group-hover:text-cyan-500 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 py-2 animate-accordion-down">
                <ul className="space-y-2 text-gray-600">
                  <li className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <Link to="/store" className="block py-2 text-sm hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 transform">Home</Link>
                  </li>
                  <li className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <button className="block py-2 text-sm hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 transform">About</button>
                  </li>
                  <li className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                    <button className="block py-2 text-sm hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 transform">Contact</button>
                  </li>
                  <li className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                    <button className="block py-2 text-sm hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 transform">Terms & Conditions</button>
                  </li>
                  <li className="animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <button className="block py-2 text-sm hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 transform">Privacy Policy</button>
                  </li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            {/* Contact Info Dropdown */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 group">
                <h4 className="font-medium text-sm text-cyan-400 group-hover:text-cyan-500 transition-colors duration-300">Have a Questions?</h4>
                <ChevronDown className="w-4 h-4 text-cyan-400 transition-transform duration-300 group-hover:text-cyan-500 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 py-2 animate-accordion-down">
                <div className="space-y-2 text-gray-600">
                  <p className="py-1 text-sm animate-fade-in hover:text-cyan-400 transition-colors duration-300" style={{ animationDelay: '0.1s' }}>mejdiaya-tripoli-lebanon</p>
                  <p className="py-1 text-sm font-semibold text-gray-800 animate-fade-in hover:text-cyan-600 transition-colors duration-300" style={{ animationDelay: '0.2s' }}>+961 76 591 765</p>
                  <p className="py-1 text-sm animate-fade-in hover:text-cyan-400 transition-colors duration-300" style={{ animationDelay: '0.3s' }}>info@email</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {/* Bottom decorative bars */}
          <div className="flex justify-center space-x-12 my-12">
            {Array.from({ length: 9 }).map((_, i) => (
              <div 
                key={i} 
                className="h-2 bg-cyan-400"
                style={{ width: `${[30, 50, 40, 60, 45, 70, 40, 50, 35][i]}px` }}
              ></div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="text-center space-y-4">
            <p className="text-sm text-cyan-400">
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
          
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.6s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
}
