
import { ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { SearchDropdown } from './SearchDropdown';
import { AuthModal } from '../auth/AuthModal';
import { useSearch } from '@/contexts/SearchContext';

interface StoreLayoutProps {
  children: ReactNode;
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const { searchQuery, setSearchQuery } = useSearch();
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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleAuthModalOpen = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleSearchResultClick = (productId: number) => {
    navigate(`/store/product/${productId}`);
    setShowSearchResults(false);
    setShowMobileSearchResults(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 light overflow-x-hidden">
      <Header 
        onMobileMenuToggle={handleMobileMenuToggle}
        isMobileMenuOpen={isMobileMenuOpen}
        onAuthModalOpen={handleAuthModalOpen}
      />

      {/* Social Media Banner */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-2 px-4 text-center text-sm font-medium relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/80 via-purple-600/80 to-pink-600/80"></div>
        <div className="relative z-10 flex items-center justify-center space-x-6">
          <span className="hidden md:inline">Follow us for the latest updates:</span>
          <div className="flex items-center space-x-4">
            <a href="#" className="hover:scale-110 transition-transform duration-300">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs font-bold">f</span>
              </div>
            </a>
            <a href="#" className="hover:scale-110 transition-transform duration-300">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs font-bold">@</span>
              </div>
            </a>
            <a href="#" className="hover:scale-110 transition-transform duration-300">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs font-bold">in</span>
              </div>
            </a>
            <a href="#" className="hover:scale-110 transition-transform duration-300">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <span className="text-xs font-bold">📱</span>
              </div>
            </a>
          </div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
      </div>

      {/* Desktop Search Results Dropdown */}
      <SearchDropdown
        isVisible={showSearchResults}
        inputRef={searchInputRef}
        onProductClick={handleSearchResultClick}
      />

      {/* Mobile Search Results Dropdown */}
      <SearchDropdown
        isVisible={showMobileSearchResults}
        inputRef={mobileSearchInputRef}
        onProductClick={handleSearchResultClick}
      />

      {/* Main Content */}
      <main className="w-full overflow-x-hidden">
        {children}
      </main>

      <Footer />

      {/* Auth Modal */}
      <AuthModal 
        open={authModalOpen} 
        onOpenChange={setAuthModalOpen} 
        defaultMode={authMode}
      />
    </div>
  );
}
