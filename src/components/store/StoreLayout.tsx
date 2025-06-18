
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface StoreLayoutProps {
  children: React.ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount] = useState(0);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/store" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Meem</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link to="/store" className="text-gray-600 hover:text-cyan-500 transition-colors">Home</Link>
              <Link to="/store/categories" className="text-cyan-500 font-medium">Categories</Link>
              <Link to="/store/contact" className="text-gray-600 hover:text-cyan-500 transition-colors">Contact</Link>
              <Link to="/store/about" className="text-gray-600 hover:text-cyan-500 transition-colors">About</Link>
            </nav>

            {/* Language & Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-gray-600">
                  <Globe className="w-4 h-4 mr-1" />
                  EN
                </Button>
                <span className="text-gray-300">|</span>
                <Button variant="ghost" size="sm" className="text-gray-600">
                  عربي
                </Button>
              </div>
              
              <Button variant="ghost" size="sm">
                <User className="w-5 h-5" />
              </Button>
              
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="pb-4 pt-2">
            <div className="max-w-md mx-auto relative">
              <Input
                type="text"
                placeholder="Search Meem catalog..."
                className="pl-10 pr-4 py-2 border-gray-300 rounded-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 bg-cyan-500 hover:bg-cyan-600 rounded-full px-4"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <nav className="px-4 py-4 space-y-2">
              <Link to="/store" className="block py-2 text-gray-600 hover:text-cyan-500">Home</Link>
              <Link to="/store/categories" className="block py-2 text-cyan-500 font-medium">Categories</Link>
              <Link to="/store/contact" className="block py-2 text-gray-600 hover:text-cyan-500">Contact</Link>
              <Link to="/store/about" className="block py-2 text-gray-600 hover:text-cyan-500">About</Link>
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-cyan-50 border-t border-cyan-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">M</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Meem Home</span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-cyan-500 font-semibold mb-4">Get Your Order Now</h3>
                <div className="flex max-w-md">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="rounded-l-full border-r-0 focus:border-cyan-500"
                  />
                  <Button className="bg-cyan-500 hover:bg-cyan-600 rounded-r-full px-6">
                    Subscribe
                  </Button>
                </div>
              </div>

              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">f</span>
                </div>
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">t</span>
                </div>
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">@</span>
                </div>
                <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">in</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-cyan-500 font-semibold mb-4">Quick Links</h3>
              <div className="space-y-2">
                <Link to="/store" className="block text-gray-600 hover:text-cyan-500">Home</Link>
                <Link to="/store/about" className="block text-gray-600 hover:text-cyan-500">About</Link>
                <Link to="/store/categories" className="block text-gray-600 hover:text-cyan-500">Categories</Link>
                <Link to="/store/terms" className="block text-gray-600 hover:text-cyan-500">Terms & Conditions</Link>
                <Link to="/store/privacy" className="block text-gray-600 hover:text-cyan-500">Privacy Policy</Link>
              </div>
            </div>

            <div>
              <h3 className="text-cyan-500 font-semibold mb-4">Have a Questions?</h3>
              <div className="space-y-2 text-gray-600">
                <p>mejidave-tripoli-lebanon</p>
                <p>+961 76 591 765</p>
                <p>info@meem.com</p>
              </div>
            </div>
          </div>

          <div className="border-t border-cyan-200 mt-8 pt-8 text-center text-gray-500">
            <p>This site is protected by reCaptcha and the Google Privacy Policy and Terms Service apply.</p>
            <p className="mt-2">Meemhome © 2025 Copyright</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
