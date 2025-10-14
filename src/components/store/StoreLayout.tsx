import { ReactNode, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ShoppingCart,
  User,
  Search,
  Menu,
  Heart,
  MapPin,
  Phone,
  X,
  LogOut,
  RotateCcw,
  Home,
  Grid,
  ShoppingBag,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { CartSidebar } from './CartSidebar'
import { AuthModal } from '../auth/AuthModal'
import { useSearch } from '@/contexts/SearchContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { useCart } from '@/contexts/CartContext'
import { useAuth } from '@/contexts/AuthContext'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from '@/components/ui/drawer'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import * as Portal from '@radix-ui/react-portal'
import { CountryCurrencySelector } from './CountryCurrencySelector'
import { useStoreCategories } from '@/hooks/useStoreCategories'
import { AddToCartNotification } from './AddToCartNotification'
import { VariantSelectionModal } from './VariantSelectionModal'
import { OptimizedImage } from '@/components/ui/optimized-image'

interface StoreLayoutProps {
  children: ReactNode
}

export function StoreLayout({ children }: StoreLayoutProps) {
  const {
    searchQuery,
    setSearchQuery,
    clearSearch,
    filteredResults, // newest-first from backend, after client-side filters/sorts
    isSearching,
    errorMsg,
  } = useSearch()
  const { items: wishlistItems } = useWishlist()
  const {
    getTotalItems,
    notificationItem,
    clearNotification,
    variantSelectionRequest,
    clearVariantSelection,
    addToCart,
  } = useCart()
  const { categories, loading: categoriesLoading } = useStoreCategories()
  const auth = useAuth()
  const user = auth?.user || null
  const logout = auth?.logout
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isMobileMenuClosing, setIsMobileMenuClosing] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [showMobileSearchResults, setShowMobileSearchResults] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false)
  const [isCategoriesClosing, setIsCategoriesClosing] = useState(false)
  const [searchInputRef, setSearchInputRef] = useState<HTMLInputElement | null>(
    null
  )
  const [mobileSearchInputRef, setMobileSearchInputRef] =
    useState<HTMLInputElement | null>(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Force light mode for store layout
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('dark')
    root.classList.add('light')
  }, [])

  // Prevent body scroll when mobile menu is open and fix iOS viewport issues
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
      document.body.style.height = '100%'
      // Prevent iOS Safari address bar resize issues
      const viewport = document.querySelector('meta[name=viewport]')
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
        )
      }
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
      document.body.style.height = 'unset'
      // Restore normal viewport
      const viewport = document.querySelector('meta[name=viewport]')
      if (viewport) {
        viewport.setAttribute(
          'content',
          'width=device-width, initial-scale=1.0, viewport-fit=cover'
        )
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.position = 'unset'
      document.body.style.width = 'unset'
      document.body.style.height = 'unset'
    }
  }, [isMobileMenuOpen])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSearchResults(false)
      setShowMobileSearchResults(false)
    }
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowSearchResults(value.length > 0)
  }

  const handleMobileSearchInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value
    setSearchQuery(value)
    setShowMobileSearchResults(value.length > 0)
  }

  const handleSearchResultClick = (productSlug: string) => {
    navigate(`/product/${productSlug}`)
    setShowSearchResults(false)
    setShowMobileSearchResults(false)
    setSearchQuery('')
  }

  const handleClearSearch = () => {
    clearSearch()
    setShowSearchResults(false)
    setShowMobileSearchResults(false)
  }

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleLogout = () => {
    if (logout) {
      logout()
      navigate('/')
    }
  }

  const closeMobileMenu = () => {
    setIsMobileMenuClosing(true)
    // Also close categories when closing sidebar
    if (isCategoriesOpen) {
      setIsCategoriesClosing(true)
      setIsCategoriesOpen(false)
    }
    setTimeout(() => {
      setIsMobileMenuOpen(false)
      setIsMobileMenuClosing(false)
      setIsCategoriesClosing(false)
    }, 200) // Fast close animation duration
  }

  const openMobileMenu = () => {
    setIsMobileMenuClosing(false) // Ensure no closing state
    setIsMobileMenuOpen(true)
  }

  const handleCategoriesToggle = (open: boolean) => {
    if (open) {
      setIsCategoriesClosing(false)
      setIsCategoriesOpen(true)
    } else {
      setIsCategoriesClosing(true)
      setTimeout(() => {
        setIsCategoriesOpen(false)
        setIsCategoriesClosing(false)
      }, 200) // Fast close animation duration
    }
  }

  const getSearchDropdownPosition = (inputRef: HTMLInputElement | null) => {
    if (!inputRef) return { top: 0, left: 0, width: 0 }

    const rect = inputRef.getBoundingClientRect()
    return {
      top: rect.bottom + 8,
      left: rect.left,
      width: Math.min(rect.width + 50, 400),
    }
  }

  const goProduct = (slug: string) => {
    navigate(`/product/${slug}`)
    clearSearch()
    setShowSearchResults(false)
    setShowMobileSearchResults(false)
  }

  const goAll = () => {
    navigate(`/products?q=${encodeURIComponent(searchQuery)}`)
    setShowSearchResults(false)
    setShowMobileSearchResults(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-cyan-100 to-blue-100 light overflow-visible">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 z-50">
        <div className="w-full max-w-7xl mx-auto px-3 md:px-6">
          <div className="flex items-center justify-between h-14 md:h-16 lg:h-18 gap-2 md:gap-4">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0">
              <Link
                to="/"
                className="hover:scale-105 transition-transform duration-300"
              >
                <img
                  src="/meemhome-logo.svg"
                  alt="Meem Home"
                  className="h-12 md:h-14 lg:h-16 w-auto object-contain"
                  fetchpriority="high"
                  loading="eager"
                />
              </Link>
            </div>

            {/* Navigation - Desktop only */}
            <nav className="hidden lg:flex space-x-6 xl:space-x-8 flex-shrink-0">
              {/* <Link to="/categories" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group text-sm xl:text-base">
                Categories
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-full"></span>
              </Link> */}
              {/* <Link to="/returns" className="text-gray-700 hover:text-blue-600 transition-all duration-300 font-medium relative group text-sm xl:text-base">
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
              </button> */}
            </nav>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex flex-1 max-w-lg xl:max-w-xl mx-4 xl:mx-8 relative">
              <form
                onSubmit={handleSearch}
                className="relative w-full flex border-[4px] border-cyan-400"
              >
                <Input
                  ref={setSearchInputRef}
                  type="text"
                  placeholder="Search Meem or type"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSearchResults(searchQuery.length > 0)}
                  onBlur={() =>
                    setTimeout(() => setShowSearchResults(false), 200)
                  }
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
              {/* Country and Currency Selectors */}
              {/* <CountryCurrencySelector /> */}
              <Link to="/wishlist">
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all duration-300 p-2"
                    >
                      <User className="w-4 h-4 md:w-5 md:h-5" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-56 bg-white/95 backdrop-blur-md border-gray-200 rounded-2xl shadow-2xl"
                    align="end"
                  >
                    <div className="space-y-4">
                      <div className="border-b border-gray-100 pb-3">
                        <p className="font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {user.email || user.phone || 'My Account'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Link
                          to="/addresses"
                          className="block w-full text-left"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                          >
                            <MapPin className="w-4 h-4 mr-3" />
                            My Addresses
                          </Button>
                        </Link>
                        <Link
                          to="/wishlist"
                          className="block w-full text-left"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                          >
                            <Heart className="w-4 h-4 mr-3" />
                            My Wishlist
                          </Button>
                        </Link>
                        <Link
                          to="/returns"
                          className="block w-full text-left"
                        >
                          <Button
                            variant="ghost"
                            className="w-full justify-start rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
                          >
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

            {/* Mobile: Search Bar, Country/Currency, and Menu Button */}
            <div className="lg:hidden flex items-center flex-1 gap-2">
              <div className="flex-1 relative">
                <form
                  onSubmit={handleSearch}
                  className="relative w-full flex border-[3px] border-cyan-400 rounded-full overflow-hidden"
                >
                  <Input
                    ref={setMobileSearchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={handleMobileSearchInputChange}
                    onFocus={() =>
                      setShowMobileSearchResults(searchQuery.length > 0)
                    }
                    onBlur={() =>
                      setTimeout(() => setShowMobileSearchResults(false), 200)
                    }
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

              {/* Country/Currency Selectors for Mobile */}
              {/* <CountryCurrencySelector variant="mobile" /> */}

              {/* Mobile Menu Button */}
              <Button
                className="rounded-xl p-2 w-10 h-10"
                variant="ghost"
                size="sm"
                onClick={openMobileMenu}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Store-Themed Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[99999] lg:hidden">
          {/* Backdrop with store gradient */}
          <div
            className={`absolute inset-0 backdrop-blur-md transition-all ease-out ${
              isMobileMenuClosing
                ? 'duration-200 bg-black/0'
                : 'duration-500 bg-gradient-to-br from-cyan-900/60 to-blue-900/60'
            }`}
            onClick={closeMobileMenu}
          />

          {/* Store-style sidebar */}
          <div
            className={`absolute right-0 top-0 h-full w-[90%] max-w-sm bg-white shadow-2xl transform transition-all ${
              isMobileMenuClosing
                ? 'duration-200 ease-in translate-x-full'
                : isMobileMenuOpen
                ? 'duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] translate-x-0'
                : 'duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] translate-x-full'
            }`}
          >
            {/* Store Header with logo */}
            <div
              className={`flex items-center justify-between p-4 border-b-4 border-cyan-400 bg-gradient-to-r from-cyan-50 to-blue-50 ${
                isMobileMenuClosing
                  ? 'animate-fade-out-fast'
                  : isMobileMenuOpen
                  ? 'animate-slide-down opacity-0'
                  : 'opacity-0'
              }`}
              style={{
                animationDelay: isMobileMenuClosing
                  ? '0s'
                  : isMobileMenuOpen
                  ? '0.0s'
                  : '0s',
                animationFillMode: 'forwards',
              }}
            >
              <div className="flex items-center gap-3">
                <img
                  src="/meemhome-logo.svg"
                  alt="Meem Home"
                  className={`h-16 w-auto object-contain ${
                    isMobileMenuClosing
                      ? 'animate-fade-out-fast'
                      : isMobileMenuOpen
                      ? 'animate-scale-in opacity-0'
                      : 'opacity-0'
                  }`}
                  fetchpriority="high"
                  loading="eager"
                  style={{
                    animationDelay: isMobileMenuClosing
                      ? '0s'
                      : isMobileMenuOpen
                      ? '0.03s'
                      : '0s',
                    animationFillMode: 'forwards',
                  }}
                />
                <div
                  className={`${
                    isMobileMenuClosing
                      ? 'animate-fade-out-fast'
                      : isMobileMenuOpen
                      ? 'animate-fade-in opacity-0'
                      : 'opacity-0'
                  }`}
                  style={{
                    animationDelay: isMobileMenuClosing
                      ? '0s'
                      : isMobileMenuOpen
                      ? '0.06s'
                      : '0s',
                    animationFillMode: 'forwards',
                  }}
                >
                  <h2 className="text-lg font-bold text-cyan-600">Meem Home</h2>
                  <p className="text-xs text-gray-500">
                    Your Shopping Destination
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-full p-2 hover:bg-cyan-100 transition-all duration-300 hover:rotate-90 ${
                  isMobileMenuClosing
                    ? 'animate-fade-out-fast'
                    : isMobileMenuOpen
                    ? 'animate-scale-in opacity-0'
                    : 'opacity-0'
                }`}
                style={{
                  animationDelay: isMobileMenuClosing
                    ? '0s'
                    : isMobileMenuOpen
                    ? '0.09s'
                    : '0s',
                  animationFillMode: 'forwards',
                }}
                onClick={closeMobileMenu}
              >
                <X className="w-5 h-5 text-gray-600" />
              </Button>
            </div>

            {/* Store Navigation */}
            <div
              className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400"
              style={{ 
                scrollbarWidth: 'thin',
                msOverflowStyle: 'auto'
              }}
            >
              <div className="space-y-1">
                {/* Main Navigation */}
                <div className="mb-6">
                  <h3
                    className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 ${
                      isMobileMenuClosing
                        ? 'animate-fade-out-fast'
                        : isMobileMenuOpen
                        ? 'animate-fade-in opacity-0'
                        : 'opacity-0'
                    }`}
                    style={{
                      animationDelay: isMobileMenuClosing
                        ? '0s'
                        : isMobileMenuOpen
                        ? '0.12s'
                        : '0s',
                      animationFillMode: 'forwards',
                    }}
                  >
                    Shop
                  </h3>
                  {/* Home Link */}
                  <Link
                    to="/"
                    className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${
                      isMobileMenuClosing
                        ? 'animate-slide-out-right-fast'
                        : isMobileMenuOpen
                        ? 'animate-slide-in-right opacity-0'
                        : 'opacity-0'
                    }`}
                    style={{
                      animationDelay: isMobileMenuClosing
                        ? '0s'
                        : isMobileMenuOpen
                        ? '0.15s'
                        : '0s',
                      animationFillMode: 'forwards',
                    }}
                    onClick={closeMobileMenu}
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center group-hover:bg-cyan-200 transition-colors group-hover:scale-110 duration-300">
                      <Home className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="flex-1">Home</span>
                    <div className="absolute left-0 top-0 w-1 h-full bg-cyan-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  </Link>

                  {/* Categories Dropdown */}
                  <Collapsible
                    open={isCategoriesOpen}
                    onOpenChange={handleCategoriesToggle}
                  >
                    <CollapsibleTrigger
                      className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden w-full text-left ${
                        isMobileMenuClosing
                          ? 'animate-slide-out-right-fast'
                          : isMobileMenuOpen
                          ? 'animate-slide-in-right opacity-0'
                          : 'opacity-0'
                      }`}
                      style={{
                        animationDelay: isMobileMenuClosing
                          ? '0s'
                          : isMobileMenuOpen
                          ? '0.18s'
                          : '0s',
                        animationFillMode: 'forwards',
                      }}
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors group-hover:scale-110 duration-300">
                        <Grid className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span className="flex-1">All Categories</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isCategoriesOpen ? 'rotate-180' : ''
                        }`}
                      />
                      <div className="absolute left-0 top-0 w-1 h-full bg-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                    </CollapsibleTrigger>
                    <CollapsibleContent
                      className={`space-y-1 mt-2 overflow-hidden ${
                        isCategoriesClosing
                          ? 'animate-slide-up-fast'
                          : isCategoriesOpen
                          ? 'animate-slide-down-categories opacity-0'
                          : 'opacity-0'
                      }`}
                      style={{
                        animationDelay: isCategoriesClosing
                          ? '0s'
                          : isCategoriesOpen
                          ? '0.05s'
                          : '0s',
                        animationFillMode: 'forwards',
                      }}
                    >
                      {!categoriesLoading &&
                        categories.map((category, index) => (
                          <Link
                            key={category.id}
                            to={`/products?category=${category.slug}`}
                            className={`flex items-center gap-3 px-8 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-300 text-sm group ${
                              isCategoriesOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                            style={{
                              transitionDelay: isCategoriesOpen
                                ? `${0.2 + index * 0.1}s`
                                : '0s',
                            }}
                            onClick={closeMobileMenu}
                          >
                            <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                              {category.icon &&
                              category.icon.startsWith('http') ? (
                                <img
                                  src={category.icon}
                                  alt={`${category.name} icon`}
                                  className="w-4 h-4 object-contain"
                                />
                              ) : (
                                <span className="text-sm">
                                  {category.icon || '📦'}
                                </span>
                              )}
                            </div>
                            <span className="flex-1">{category.name}</span>
                          </Link>
                        ))}
                      {categoriesLoading && (
                        <div className="px-8 py-2 text-gray-400 text-sm">
                          Loading categories...
                        </div>
                      )}
                    </CollapsibleContent>
                  </Collapsible>

                  {/* Wishlist Link */}
                  <Link
                    to="/wishlist"
                    className={`flex items-center gap-3 px-4 py-3 text-gray-700 hover:text-pink-600 hover:bg-pink-50 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${
                      isMobileMenuClosing
                        ? 'animate-slide-out-right-fast'
                        : isMobileMenuOpen
                        ? 'animate-slide-in-right opacity-0'
                        : 'opacity-0'
                    }`}
                    style={{
                      animationDelay: isMobileMenuClosing
                        ? '0s'
                        : isMobileMenuOpen
                        ? '0.21s'
                        : '0s',
                      animationFillMode: 'forwards',
                    }}
                    onClick={closeMobileMenu}
                  >
                    <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center group-hover:bg-pink-200 transition-colors group-hover:scale-110 duration-300">
                      <Heart className="w-4 h-4 group-hover:scale-110 transition-all duration-300 group-hover:fill-pink-500 group-hover:text-pink-500" />
                    </div>
                    <span className="flex-1">My Wishlist</span>
                    {wishlistItems.length > 0 && (
                      <div className="bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-bounce">
                        {wishlistItems.length}
                      </div>
                    )}
                    <div className="absolute left-0 top-0 w-1 h-full bg-pink-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></div>
                  </Link>
                </div>

                {/* Store Services */}
                <div className="mb-6">
                  <h3
                    className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 ${
                      isMobileMenuClosing
                        ? 'animate-fade-out-fast'
                        : isMobileMenuOpen
                        ? 'animate-fade-in opacity-0'
                        : 'opacity-0'
                    }`}
                    style={{
                      animationDelay: isMobileMenuClosing
                        ? '0s'
                        : isMobileMenuOpen
                        ? '0.24s'
                        : '0s',
                      animationFillMode: 'forwards',
                    }}
                  >
                    Services
                  </h3>
                  {[
                    {
                      icon: RotateCcw,
                      label: 'Returns & Exchanges',
                      color: 'purple',
                      delay: '0.27s',
                    },
                    {
                      icon: ShoppingBag,
                      label: 'Special Deals',
                      color: 'orange',
                      delay: '0.3s',
                    },
                    {
                      icon: Phone,
                      label: 'Customer Support',
                      color: 'green',
                      delay: '0.33s',
                    },
                  ].map((item, index) => (
                    <button
                      key={item.label}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-gray-700 hover:text-${
                        item.color
                      }-600 hover:bg-${
                        item.color
                      }-50 rounded-xl transition-all duration-300 font-medium group relative overflow-hidden ${
                        isMobileMenuClosing
                          ? 'animate-slide-out-right-fast'
                          : isMobileMenuOpen
                          ? 'animate-slide-in-right opacity-0'
                          : 'opacity-0'
                      }`}
                      style={{
                        animationDelay: isMobileMenuClosing
                          ? '0s'
                          : isMobileMenuOpen
                          ? item.delay
                          : '0s',
                        animationFillMode: 'forwards',
                      }}
                    >
                      <div
                        className={`w-8 h-8 rounded-lg bg-${item.color}-100 flex items-center justify-center group-hover:bg-${item.color}-200 transition-colors group-hover:scale-110 duration-300`}
                      >
                        <item.icon className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                      </div>
                      <span>{item.label}</span>
                      <div
                        className={`absolute left-0 top-0 w-1 h-full bg-${item.color}-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300`}
                      ></div>
                    </button>
                  ))}
                </div>

                {/* Account Section */}
                <div className="pt-4">
                  <h3
                    className={`text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3 ${
                      isMobileMenuClosing
                        ? 'animate-fade-out-fast'
                        : isMobileMenuOpen
                        ? 'animate-fade-in opacity-0'
                        : 'opacity-0'
                    }`}
                    style={{
                      animationDelay: isMobileMenuClosing
                        ? '0s'
                        : isMobileMenuOpen
                        ? '0.36s'
                        : '0s',
                      animationFillMode: 'forwards',
                    }}
                  >
                    Account
                  </h3>
                  {!user ? (
                    <div className="space-y-1">
                      <button
                        className={`flex items-center gap-3 w-full px-4 py-3 text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl hover:scale-[1.02] ${
                          isMobileMenuClosing
                            ? 'animate-slide-out-right-fast'
                            : isMobileMenuOpen
                            ? 'animate-slide-in-right opacity-0'
                            : 'opacity-0'
                        }`}
                        style={{
                          animationDelay: isMobileMenuClosing
                            ? '0s'
                            : isMobileMenuOpen
                            ? '0.39s'
                            : '0s',
                          animationFillMode: 'forwards',
                        }}
                        onClick={() => {
                          openAuthModal('signin')
                          closeMobileMenu()
                        }}
                      >
                        <User className="w-4 h-4" />
                        <span>Sign In</span>
                      </button>
                      <button
                        className={`flex items-center gap-3 w-full px-4 py-3 text-cyan-600 border-2 border-cyan-200 hover:bg-cyan-50 rounded-xl transition-all duration-300 font-medium hover:scale-[1.02] ${
                          isMobileMenuClosing
                            ? 'animate-slide-out-right-fast'
                            : isMobileMenuOpen
                            ? 'animate-slide-in-right opacity-0'
                            : 'opacity-0'
                        }`}
                        style={{
                          animationDelay: isMobileMenuClosing
                            ? '0s'
                            : isMobileMenuOpen
                            ? '0.42s'
                            : '0s',
                          animationFillMode: 'forwards',
                        }}
                        onClick={() => {
                          openAuthModal('signup')
                          closeMobileMenu()
                        }}
                      >
                        <Plus className="w-4 h-4" />
                        <span>Create Account</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div
                        className={`px-4 py-3 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 ${
                          isMobileMenuClosing
                            ? 'animate-slide-out-right-fast'
                            : isMobileMenuOpen
                            ? 'animate-slide-in-right opacity-0'
                            : 'opacity-0'
                        }`}
                        style={{
                          animationDelay: isMobileMenuClosing
                            ? '0s'
                            : isMobileMenuOpen
                            ? '0.39s'
                            : '0s',
                          animationFillMode: 'forwards',
                        }}
                      >
                        <p className="font-semibold text-gray-900 text-sm">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {user.email || user.phone || 'My Account'}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          handleLogout()
                          closeMobileMenu()
                        }}
                        className={`flex items-center gap-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-all duration-300 font-medium hover:scale-[1.02] ${
                          isMobileMenuClosing
                            ? 'animate-slide-out-right-fast'
                            : isMobileMenuOpen
                            ? 'animate-slide-in-right opacity-0'
                            : 'opacity-0'
                        }`}
                        style={{
                          animationDelay: isMobileMenuClosing
                            ? '0s'
                            : isMobileMenuOpen
                            ? '0.42s'
                            : '0s',
                          animationFillMode: 'forwards',
                        }}
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Store Footer */}
            <div
              className={`p-4 bg-gray-50 ${
                isMobileMenuClosing
                  ? 'animate-fade-out-fast'
                  : isMobileMenuOpen
                  ? 'animate-slide-up opacity-0'
                  : 'opacity-0'
              }`}
              style={{
                animationDelay: isMobileMenuClosing
                  ? '0s'
                  : isMobileMenuOpen
                  ? '0.45s'
                  : '0s',
                animationFillMode: 'forwards',
              }}
            >
              <div className="text-center text-xs text-gray-500 leading-none">
                <div className="inline-block">
                  © 2025 Meem Home • Quality & Style
                </div>
              </div>
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
                <a 
                  href="https://www.tiktok.com/@meem.comm?_t=ZS-8ycT95KXoal&_r=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap"
                >
                  TIKTOK
                </a>
                <a 
                  href="https://www.instagram.com/meem.comm?igsh=ejJ0M3FycHFoZ3F3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap"
                >
                  INSTAGRAM
                </a>
                <a 
                  href="https://www.facebook.com/share/1BrYDVRLpd/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap"
                >
                  FACEBOOK
                </a>
                <a 
                  href="https://youtube.com/@meemhome?si=Kz9tpa_2EUQ8eno1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap"
                >
                  YOUTUBE
                </a>
                <a 
                  href="https://www.tiktok.com/@meem.comm?_t=ZS-8ycT95KXoal&_r=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap"
                >
                  TIKTOK
                </a>
                <a 
                  href="https://www.instagram.com/meem.comm?igsh=ejJ0M3FycHFoZ3F3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap"
                >
                  INSTAGRAM
                </a>
                <a 
                  href="https://www.facebook.com/share/1BrYDVRLpd/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap"
                >
                  FACEBOOK
                </a>
                <a 
                  href="https://youtube.com/@meemhome?si=Kz9tpa_2EUQ8eno1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap"
                >
                  YOUTUBE
                </a>
                <a 
                  href="https://www.tiktok.com/@meem.comm?_t=ZS-8ycT95KXoal&_r=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-cyan-100 transition-all duration-500 hover:scale-110 transform cursor-pointer whitespace-nowrap"
                >
                  TIKTOK
                </a>
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
            // prevent outer overlays from swallowing clicks
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClickCapture={(e) => e.stopPropagation()}
          >
            {isSearching ? (
              // loading → removes the "no results" flicker
              <div className="p-6 text-center text-gray-500">
                <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Searching…</p>
              </div>
            ) : filteredResults.length > 0 ? (
              <div className="p-2">
                <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
                  {filteredResults.length} results found
                </div>

                {filteredResults.slice(0, 6).map((product) => (
                  <button
                    key={product.slug}
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      goProduct(product.slug)
                    }}
                    className="w-full flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-xl transition-all duration-300 text-left"
                  >
                    <div className="w-8 h-8 flex-shrink-0">
                      <OptimizedImage
                        src={product.cover_image}
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg shadow-md"
                        eager
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate text-xs">
                        {product.name}
                      </h4>
                      <p className="text-xs font-semibold text-blue-600">
                        {product.currency?.symbol ?? ''}
                        {Number.isFinite(product.price)
                          ? product.price.toFixed(2)
                          : product.price}
                        {!product.currency?.symbol && product.currency?.code
                          ? ` ${product.currency.code}`
                          : ''}
                      </p>
                    </div>
                  </button>
                ))}

                {filteredResults.length > 6 && (
                  <button
                    type="button"
                    onPointerDown={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      goAll()
                    }}
                    className="w-full p-3 text-center text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium text-sm"
                  >
                    View all {filteredResults.length} results
                  </button>
                )}
              </div>
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  No products found for “{searchQuery}”.
                </p>
                {errorMsg && (
                  <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
                )}
              </div>
            )}
          </div>
        </Portal.Root>
      )}

      {/* Mobile Search Results Dropdown - Rendered as Portal */}

      {showMobileSearchResults &&
        searchQuery.length > 0 &&
        mobileSearchInputRef && (
          <Portal.Root>
            <div
              className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-[9999]"
              style={{
                top: getSearchDropdownPosition(mobileSearchInputRef).top,
                left: getSearchDropdownPosition(mobileSearchInputRef).left,
                width: Math.min(
                  getSearchDropdownPosition(mobileSearchInputRef).width,
                  350
                ),
              }}
              onMouseDownCapture={(e) => e.stopPropagation()}
              onClickCapture={(e) => e.stopPropagation()}
            >
              {isSearching ? (
                <div className="p-6 text-center text-gray-500">
                  <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">Searching…</p>
                </div>
              ) : filteredResults.length > 0 ? (
                <div className="p-2">
                  <div className="text-xs text-gray-500 px-3 py-2 border-b border-gray-100">
                    {filteredResults.length} results found
                  </div>

                  {filteredResults.slice(0, 6).map((product) => (
                    <button
                      key={product.slug}
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        goProduct(product.slug)
                      }}
                      className="w-full flex items-center space-x-3 p-3 hover:bg-blue-50 rounded-xl transition-all duration-300 text-left"
                    >
                      <div className="w-8 h-8 flex-shrink-0">
                        <OptimizedImage
                          src={product.cover_image}
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg shadow-md"
                          eager
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate text-xs">
                          {product.name}
                        </h4>
                        <p className="text-xs font-semibold text-blue-600">
                          {product.currency?.symbol ?? ''}
                          {Number.isFinite(product.price)
                            ? product.price.toFixed(2)
                            : product.price}
                          {!product.currency?.symbol && product.currency?.code
                            ? ` ${product.currency.code}`
                            : ''}
                        </p>
                      </div>
                    </button>
                  ))}

                  {filteredResults.length > 6 && (
                    <button
                      type="button"
                      onPointerDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        goAll()
                      }}
                      className="w-full p-3 text-center text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium text-sm"
                    >
                      View all {filteredResults.length} results
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">
                  <Search className="w-6 h-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">
                    No products found for “{searchQuery}”.
                  </p>
                  {errorMsg && (
                    <p className="text-xs text-red-600 mt-1">{errorMsg}</p>
                  )}
                </div>
              )}
            </div>
          </Portal.Root>
        )}

      {/* Main Content */}
      <main className="w-full pb-6 lg:pb-0 overflow-visible">{children}</main>

      {/* Mobile Bottom Navigation - Reduced height */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-200 z-40 animate-bottom-nav">
        <div className="flex items-center justify-around py-1 px-4">
          <Link to="/" className="flex flex-col items-center group">
            <div
              className={`p-1 rounded-xl transition-all duration-300 ${
                location.pathname === '/'
                  ? 'bg-cyan-400 text-white transform scale-110'
                  : 'text-gray-600 group-hover:bg-cyan-50 group-hover:text-cyan-600'
              }`}
            >
              <Home className="w-5 h-5" />
            </div>
            <span
              className={`text-xs mt-0.5 transition-colors duration-300 ${
                location.pathname === '/'
                  ? 'text-cyan-600 font-medium'
                  : 'text-gray-500'
              }`}
            >
              Home
            </span>
          </Link>

          <Link
            to="/categories"
            className="flex flex-col items-center group"
          >
            <div
              className={`p-1 rounded-xl transition-all duration-300 ${
                location.pathname === '/categories'
                  ? 'bg-cyan-400 text-white transform scale-110'
                  : 'text-gray-600 group-hover:bg-cyan-50 group-hover:text-cyan-600'
              }`}
            >
              <Grid className="w-5 h-5" />
            </div>
            <span
              className={`text-xs mt-0.5 transition-colors duration-300 ${
                location.pathname === '/categories'
                  ? 'text-cyan-600 font-medium'
                  : 'text-gray-500'
              }`}
            >
              Categories
            </span>
          </Link>

          <Link
            to="/wishlist"
            className="flex flex-col items-center group relative"
          >
            <div
              className={`p-1 rounded-xl transition-all duration-300 ${
                location.pathname === '/wishlist'
                  ? 'bg-pink-400 text-white transform scale-110'
                  : 'text-gray-600 group-hover:bg-pink-50 group-hover:text-pink-600'
              }`}
            >
              <Heart className="w-5 h-5" />
            </div>
            <span
              className={`text-xs mt-0.5 transition-colors duration-300 ${
                location.pathname === '/wishlist'
                  ? 'text-pink-600 font-medium'
                  : 'text-gray-500'
              }`}
            >
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
              <PopoverContent
                className="w-56 bg-white/95 backdrop-blur-md border-gray-200 rounded-2xl shadow-2xl mb-4"
                align="end"
              >
                <div className="space-y-4">
                  <div className="border-b border-gray-100 pb-3">
                    <p className="font-semibold text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">
                      {user.email || user.phone || 'My Account'}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Link
                      to="/addresses"
                      className="block w-full text-left"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-300"
                      >
                        <MapPin className="w-4 h-4 mr-3" />
                        My Addresses
                      </Button>
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block w-full text-left"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-300"
                      >
                        <Heart className="w-4 h-4 mr-3" />
                        My Wishlist
                      </Button>
                    </Link>
                    <Link
                      to="/returns"
                      className="block w-full text-left"
                    >
                      <Button
                        variant="ghost"
                        className="w-full justify-start rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-300"
                      >
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
          <div className="absolute top-16 left-16 text-6xl text-cyan-400 transform rotate-12">
            +
          </div>
          <div className="absolute top-32 right-24 text-4xl text-cyan-400 transform -rotate-12">
            ×
          </div>
          <div className="absolute bottom-16 left-24 text-5xl text-cyan-400 transform rotate-45">
            +
          </div>
          <div className="absolute bottom-32 right-16 text-3xl text-cyan-400 transform -rotate-45">
            ×
          </div>
          <div className="absolute top-1/2 left-1/4 text-4xl text-cyan-400 transform rotate-12">
            +
          </div>
          <div className="absolute top-1/3 right-1/3 text-3xl text-cyan-400 transform -rotate-12">
            ×
          </div>
          <div className="absolute top-20 right-1/4 text-5xl text-cyan-400 transform rotate-12">
            +
          </div>
          <div className="absolute bottom-20 left-1/3 text-4xl text-cyan-400 transform -rotate-12">
            ×
          </div>
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
                Meem
                <br />
                Home
              </h3>
              <div className="flex space-x-3 mb-8">
                <a 
                  href="tel:+96176591765"
                  className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.facebook.com/share/1BrYDVRLpd/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold">f</span>
                </a>
                <a 
                  href="https://www.instagram.com/meem.comm?igsh=ejJ0M3FycHFoZ3F3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold">in</span>
                </a>
                <a 
                  href="https://www.tiktok.com/@meem.comm?_t=ZS-8ycT95KXoal&_r=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold">@</span>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-6 text-lg text-cyan-400">
                Quick Links
              </h4>
              <ul className="space-y-3 text-gray-600">
                <li>
                  <Link
                    to="/"
                    className="hover:text-cyan-400 transition-colors"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    About
                  </button>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    Contact
                  </button>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    Terms & Conditions
                  </button>
                </li>
                <li>
                  <button className="hover:text-cyan-400 transition-colors">
                    Privacy Policy
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="font-semibold mb-6 text-lg text-cyan-400">
                Have a Questions?
              </h4>
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
                <a 
                  href="tel:+96176591765"
                  className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.facebook.com/share/1BrYDVRLpd/?mibextid=wwXIfr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold">f</span>
                </a>
                <a 
                  href="https://www.instagram.com/meem.comm?igsh=ejJ0M3FycHFoZ3F3" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold">in</span>
                </a>
                <a 
                  href="https://www.tiktok.com/@meem.comm?_t=ZS-8ycT95KXoal&_r=1" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-cyan-400 rounded-full flex items-center justify-center text-white hover:bg-cyan-500 transition-colors cursor-pointer"
                >
                  <span className="text-sm font-bold">@</span>
                </a>
              </div>
            </div>

            {/* Quick Links Dropdown */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 group">
                <h4 className="font-medium text-sm text-cyan-400 group-hover:text-cyan-500 transition-colors duration-300">
                  Quick Links
                </h4>
                <ChevronDown className="w-4 h-4 text-cyan-400 transition-transform duration-300 group-hover:text-cyan-500 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 py-2 animate-accordion-down">
                <ul className="space-y-2 text-gray-600">
                  <li
                    className="animate-fade-in"
                    style={{ animationDelay: '0.1s' }}
                  >
                    <Link
                      to="/"
                      className="block py-2 text-sm hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 transform"
                    >
                      Home
                    </Link>
                  </li>
                  <li
                    className="animate-fade-in"
                    style={{ animationDelay: '0.2s' }}
                  >
                    <button className="block py-2 text-sm hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 transform">
                      About
                    </button>
                  </li>
                  <li
                    className="animate-fade-in"
                    style={{ animationDelay: '0.3s' }}
                  >
                    <button className="block py-2 text-sm hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 transform">
                      Contact
                    </button>
                  </li>
                  <li
                    className="animate-fade-in"
                    style={{ animationDelay: '0.4s' }}
                  >
                    <button className="block py-2 text-sm hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 transform">
                      Terms & Conditions
                    </button>
                  </li>
                  <li
                    className="animate-fade-in"
                    style={{ animationDelay: '0.5s' }}
                  >
                    <button className="block py-2 text-sm hover:text-cyan-400 transition-colors duration-300 hover:translate-x-2 transform">
                      Privacy Policy
                    </button>
                  </li>
                </ul>
              </CollapsibleContent>
            </Collapsible>

            {/* Contact Info Dropdown */}
            <Collapsible>
              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300 group">
                <h4 className="font-medium text-sm text-cyan-400 group-hover:text-cyan-500 transition-colors duration-300">
                  Have a Questions?
                </h4>
                <ChevronDown className="w-4 h-4 text-cyan-400 transition-transform duration-300 group-hover:text-cyan-500 data-[state=open]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="px-3 py-2 animate-accordion-down">
                <div className="space-y-2 text-gray-600">
                  <p
                    className="py-1 text-sm animate-fade-in hover:text-cyan-400 transition-colors duration-300"
                    style={{ animationDelay: '0.1s' }}
                  >
                    mejdiaya-tripoli-lebanon
                  </p>
                  <p
                    className="py-1 text-sm font-semibold text-gray-800 animate-fade-in hover:text-cyan-600 transition-colors duration-300"
                    style={{ animationDelay: '0.2s' }}
                  >
                    +961 76 591 765
                  </p>
                  <p
                    className="py-1 text-sm animate-fade-in hover:text-cyan-400 transition-colors duration-300"
                    style={{ animationDelay: '0.3s' }}
                  >
                    info@email
                  </p>
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
                style={{
                  width: `${[30, 50, 40, 60, 45, 70, 40, 50, 35][i]}px`,
                }}
              ></div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="text-center space-y-4">
            <p className="text-sm text-cyan-400">
              This site is protected by recaptcha and the Google Privacy Policy
              and Terms Service apply.
            </p>
            <p className="text-sm text-gray-500">Meemhome 2025 Copyright</p>
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
            animation: fade-in 0.3s ease-out forwards;
          }

          @keyframes slide-in-right {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .animate-slide-in-right {
            animation: slide-in-right 0.25s ease-out forwards;
          }

          @keyframes slide-down {
            from {
              opacity: 0;
              transform: translateY(-15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-slide-down {
            animation: slide-down 0.3s ease-out forwards;
          }

          @keyframes slide-up {
            from {
              opacity: 0;
              transform: translateY(15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .animate-slide-up {
            animation: slide-up 0.3s ease-out forwards;
          }

          @keyframes scale-in {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-scale-in {
            animation: scale-in 0.25s ease-out forwards;
          }

          @keyframes fade-out-fast {
            from {
              opacity: 1;
              transform: translateY(0);
            }
            to {
              opacity: 0;
              transform: translateY(-10px);
            }
          }

          .animate-fade-out-fast {
            animation: fade-out-fast 0.15s ease-in forwards;
          }

          @keyframes slide-out-right-fast {
            from {
              opacity: 1;
              transform: translateX(0);
            }
            to {
              opacity: 0;
              transform: translateX(20px);
            }
          }

          .animate-slide-out-right-fast {
            animation: slide-out-right-fast 0.1s ease-in forwards;
          }

          @keyframes slide-down-categories {
            from {
              max-height: 0;
              opacity: 0;
            }
            to {
              max-height: 350px;
              opacity: 1;
            }
          }

          .animate-slide-down-categories {
            animation: slide-down-categories 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          }

          @keyframes slide-up-fast {
            from {
              max-height: 350px;
              opacity: 1;
            }
            to {
              max-height: 0;
              opacity: 0;
            }
          }

          .animate-slide-up-fast {
            animation: slide-up-fast 0.25s cubic-bezier(0.4, 0, 0.6, 1) forwards;
          }
        `}
      </style>

      {/* Add to Cart Notification */}
      {notificationItem && (
        <AddToCartNotification
          key={`${notificationItem.name}-${notificationItem.price}-${notificationItem.quantity}`}
          item={notificationItem}
          onClose={clearNotification}
        />
      )}

      {/* Variant Selection Modal */}
      {variantSelectionRequest && (
        <VariantSelectionModal
          isOpen={true}
          onClose={clearVariantSelection}
          product={variantSelectionRequest.product}
          quantity={variantSelectionRequest.quantity}
          onConfirm={(variantId, fullProduct) => {
            const productToUpdate =
              fullProduct || variantSelectionRequest.product
            addToCart(
              productToUpdate,
              variantSelectionRequest.quantity,
              variantId
            )
            clearVariantSelection()
          }}
        />
      )}
    </div>
  )
}
