
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, Search, Menu, Heart, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface StoreLayoutProps {
  children: ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
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
              <a href="#" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                Deals
              </a>
              <a href="#" className="text-gray-700 hover:text-cyan-600 transition-colors font-medium">
                About
              </a>
            </nav>

            {/* Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 lg:space-x-4">
              <Button variant="ghost" size="sm" className="hidden sm:flex hover:bg-cyan-50 hover:text-cyan-600">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="hover:bg-cyan-50 hover:text-cyan-600">
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="sm" className="relative hover:bg-cyan-50 hover:text-cyan-600">
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  0
                </span>
              </Button>
              <Button className="md:hidden" variant="ghost" size="sm">
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Search */}
        <div className="lg:hidden px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent bg-gray-50 focus:bg-white"
            />
          </div>
        </div>
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
                <li><a href="#" className="hover:text-white transition-colors">Deals</a></li>
                <li><a href="#" className="hover:text-white transition-colors">New Arrivals</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-6 text-lg">Customer Service</h4>
              <ul className="space-y-3 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col lg:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center lg:text-left">&copy; 2024 Store. All rights reserved.</p>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
