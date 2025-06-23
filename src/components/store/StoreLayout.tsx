
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
