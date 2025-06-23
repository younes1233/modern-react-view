
import { ReactNode, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, User, Search, Menu, Heart, X, LogOut, RotateCcw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { CartSidebar } from './CartSidebar';
import { useSearch } from '@/contexts/SearchContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  isMobileMenuOpen: boolean;
  onAuthModalOpen: (mode: 'signin' | 'signup') => void;
}

export function Header({ onMobileMenuToggle, isMobileMenuOpen, onAuthModalOpen }: HeaderProps) {
  const { searchQuery, setSearchQuery, clearSearch } = useSearch();
  const { items: wishlistItems } = useWishlist();
  const { user, logout } = useAuth();
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(null);
  const [mobileSearchInputRef, setMobileSearchInputRef] = useState<HTMLInputElement | null>(null);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate('/store/categories');
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const handleLogout = () => {
    logout();
    navigate('/store');
  };

  return (
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
              <Button variant="ghost" size="sm" className="hover:bg-blue-50 hover:text-blue-600 relative rounded-xl transition-all duration-300 p-2">
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
                onClick={() => onAuthModalOpen('signin')}
              >
                <User className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            )}
            
            <CartSidebar />
            <Button 
              className="lg:hidden rounded-xl p-2" 
              variant="ghost" 
              size="sm"
              onClick={onMobileMenuToggle}
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
            onChange={handleSearchInputChange}
            className="flex-1 h-6 md:h-7 px-4 py-2 border-0 bg-white shadow-none focus:ring-0 focus:outline-none focus:border-transparent text-gray-700 placeholder:text-gray-500"
          />
          <button
            type="submit"
            className="h-6 md:h-7 px-3 md:px-4 bg-cyan-400 text-white hover:bg-cyan-500 transition-colors duration-300 flex items-center justify-center text-base md:text-lg font-normal"
          >
            <Search className="w-4 h-4" />
          </button>
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-12 md:right-16 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="w-3 h-3 md:w-4 md:h-4" />
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
            >
              Home
            </Link>
            <Link 
              to="/store/categories" 
              className="block px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
            >
              Categories
            </Link>
            <Link 
              to="/store/returns" 
              className="block px-4 py-3 text-gray-700 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all duration-300 font-medium"
            >
              Returns
            </Link>
            <Link 
              to="/store/wishlist" 
              className="block px-4 py-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-300 font-medium"
            >
              Wishlist ({wishlistItems.length})
            </Link>
            {!user && (
              <>
                <button 
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => onAuthModalOpen('signin')}
                >
                  Sign In
                </button>
                <button 
                  className="block w-full text-left px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
                  onClick={() => onAuthModalOpen('signup')}
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
  );
}
