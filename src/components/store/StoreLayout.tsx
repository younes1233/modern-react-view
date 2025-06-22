import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ShoppingCart, Heart, User, Menu, X, Phone, Mail, MapPin } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useSearch } from "@/contexts/SearchContext";
import { CartSidebar } from "./CartSidebar";

interface StoreLayoutProps {
  children: React.ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { items: cartItems } = useCart();
  const { items: wishlistItems } = useWishlist();
  const { searchQuery, setSearchQuery } = useSearch();
  const location = useLocation();

  const cartItemsCount = cartItems.reduce((total, item) => total + item.quantity, 0);
  const wishlistItemsCount = wishlistItems.length;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-50">
        {/* Top Bar */}
        <div className="bg-gray-900 text-white py-1 sm:py-2">
          <div className="container mx-auto px-2 sm:px-4 flex justify-between items-center text-xs sm:text-sm">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="flex items-center space-x-1">
                <Phone className="w-3 h-3" />
                <span className="hidden sm:inline">961 76591765</span>
              </span>
              <span className="flex items-center space-x-1">
                <Mail className="w-3 h-3" />
                <span className="hidden sm:inline">info@meemhome.com</span>
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <span>Free shipping on orders over $100</span>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between py-2 sm:py-4">
            {/* Logo */}
            <Link to="/store" className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm sm:text-lg">M</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-gray-900">MeemHome</span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <Input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-full focus:border-cyan-500 focus:ring-0"
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1 bottom-1 bg-cyan-500 hover:bg-cyan-600 text-white px-4 rounded-full"
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Right Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search */}
              <div className="lg:hidden flex-1 max-w-xs">
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-3 pr-8 py-1.5 text-xs border border-gray-200 rounded-full focus:border-cyan-500 focus:ring-0"
                  />
                  <Button
                    size="sm"
                    className="absolute right-0.5 top-0.5 bottom-0.5 bg-cyan-500 hover:bg-cyan-600 text-white p-1 rounded-full w-6 h-6 flex items-center justify-center"
                  >
                    <Search className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Wishlist */}
              <Link to="/store/wishlist" className="relative p-2 hover:bg-gray-100 rounded-full">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {wishlistItemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
                    {wishlistItemsCount}
                  </Badge>
                )}
              </Link>

              {/* Cart */}
              <button
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-gray-100 rounded-full"
              >
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                {cartItemsCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 bg-cyan-500 text-white text-xs w-5 h-5 flex items-center justify-center p-0 rounded-full">
                    {cartItemsCount}
                  </Badge>
                )}
              </button>

              {/* User Account */}
              <Link to="/login" className="p-2 hover:bg-gray-100 rounded-full">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Navigation - Desktop */}
          <nav className="hidden lg:flex items-center space-x-8 pb-4 border-b">
            <Link to="/store" className="hover:text-cyan-500 transition-colors">
              Home
            </Link>
            <Link to="/store/categories" className="hover:text-cyan-500 transition-colors">
              Categories
            </Link>
            <Link to="/store/products" className="hover:text-cyan-500 transition-colors">
              Products
            </Link>
            <Link to="/store/about" className="hover:text-cyan-500 transition-colors">
              About Us
            </Link>
            <Link to="/store/contact" className="hover:text-cyan-500 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="lg:hidden border-t bg-white py-4">
              <Link to="/store" className="block py-2 px-4 hover:bg-gray-100">
                Home
              </Link>
              <Link to="/store/categories" className="block py-2 px-4 hover:bg-gray-100">
                Categories
              </Link>
              <Link to="/store/products" className="block py-2 px-4 hover:bg-gray-100">
                Products
              </Link>
              <Link to="/store/about" className="block py-2 px-4 hover:bg-gray-100">
                About Us
              </Link>
              <Link to="/store/contact" className="block py-2 px-4 hover:bg-gray-100">
                Contact
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-bold mb-4">Contact Us</h4>
              <p className="text-gray-300 mb-2">
                <MapPin className="inline-block mr-2 align-middle w-4 h-4" />
                Beirut, Lebanon
              </p>
              <p className="text-gray-300 mb-2">
                <Phone className="inline-block mr-2 align-middle w-4 h-4" />
                +961 76591765
              </p>
              <p className="text-gray-300">
                <Mail className="inline-block mr-2 align-middle w-4 h-4" />
                info@meemhome.com
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-bold mb-4">Quick Links</h4>
              <ul className="text-gray-300">
                <li className="mb-2">
                  <Link to="/store" className="hover:text-cyan-500">
                    Home
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/store/categories" className="hover:text-cyan-500">
                    Categories
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/store/products" className="hover:text-cyan-500">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/store/contact" className="hover:text-cyan-500">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h4 className="text-lg font-bold mb-4">Customer Service</h4>
              <ul className="text-gray-300">
                <li className="mb-2">
                  <Link to="/store/faq" className="hover:text-cyan-500">
                    FAQ
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/store/returns" className="hover:text-cyan-500">
                    Returns
                  </Link>
                </li>
                <li className="mb-2">
                  <Link to="/store/shipping" className="hover:text-cyan-500">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link to="/store/privacy" className="hover:text-cyan-500">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup */}
            <div>
              <h4 className="text-lg font-bold mb-4">Join Our Newsletter</h4>
              <p className="text-gray-300 mb-4">
                Subscribe to get notified about exclusive offers and new arrivals.
              </p>
              <div className="flex flex-col">
                <Input
                  type="email"
                  placeholder="Your email address"
                  className="mb-2 bg-gray-800 border-gray-700 text-white rounded-md"
                />
                <Button className="bg-cyan-500 hover:bg-cyan-600 text-white rounded-md">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 pt-6 mt-8 flex justify-between items-center text-sm">
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} MeemHome. All rights reserved.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="hover:text-cyan-500">
                Terms of Service
              </Link>
              <Link to="#" className="hover:text-cyan-500">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
