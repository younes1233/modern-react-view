import React from "react";
import { lazy, Suspense, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { StoreThemeHandler } from "@/components/StoreThemeHandler";
import { metaPixelService } from "@/services/metaPixelService";

import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { ResponsiveImageProvider } from "@/contexts/ResponsiveImageContext";
import { CountryCurrencyProvider } from "@/contexts/CountryCurrencyContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";

// Loading fallback component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
  </div>
);

// Lazy load pages for code splitting
// Admin Pages
const Index = lazy(() => import("@/pages/Index"));
const Products = lazy(() => import("@/pages/Products"));
const Categories = lazy(() => import("@/pages/Categories"));
const Orders = lazy(() => import("@/pages/Orders"));
const Customers = lazy(() => import("@/pages/Customers"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const SalesReport = lazy(() => import("@/pages/SalesReport"));
const Returns = lazy(() => import("@/pages/Returns"));
const Coupons = lazy(() => import("@/pages/Coupons"));
const UserManagement = lazy(() => import("@/pages/UserManagement"));
const ProductApproval = lazy(() => import("@/pages/ProductApproval"));
const Localization = lazy(() => import("@/pages/Localization"));
const SellerProducts = lazy(() => import("@/pages/SellerProducts"));
const Inventory = lazy(() => import("@/pages/Inventory"));
const StoreManagement = lazy(() => import("@/pages/StoreManagement"));

// Auth Pages - Keep these eager loaded as they're small and frequently accessed
import RoleLogin from "@/pages/RoleLogin";
import Register from "@/pages/Register";
import SignIn from "@/pages/SignIn";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";

// Store Pages - Lazy load with proper skeleton fallback
const Store = lazy(() => import("@/pages/store/Store"));
import ComingSoon from "./pages/store/ComingSoon";
import { StoreLoadingSkeleton } from "@/components/store/StoreLoadingSkeleton";
const ProductDetail = lazy(() => import("@/pages/store/ProductDetail"));
const StoreCategories = lazy(() => import("@/pages/store/StoreCategories"));
const StoreProducts = lazy(() => import("@/pages/store/StoreProducts"));
const Checkout = lazy(() => import("@/pages/store/Checkout"));
const StoreReturns = lazy(() => import("@/pages/store/Returns"));
const Wishlist = lazy(() => import("@/pages/store/Wishlist"));
const AddressManagement = lazy(() => import("@/pages/store/AddressManagement"));
const OrderDetail = lazy(() => import("@/pages/store/OrderDetail"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - increased for better caching
      gcTime: 30 * 60 * 1000, // 30 minutes - keep data in cache longer
      refetchOnWindowFocus: false, // Prevent unnecessary refetches
      refetchOnMount: false, // Use cache when available
      refetchOnReconnect: false, // Avoid refetch on reconnect
      retry: (failureCount, error: any) => {
        // Don't retry if it's a rate limit error (429) or authentication error (401)
        if (error?.status === 429 || error?.status === 401) {
          return false;
        }
        // Only retry once for other errors
        return failureCount < 1;
      },
      retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 5000), // Slower backoff: 2s, 4s, max 5s
    },
    mutations: {
      retry: 0, // Don't retry mutations to avoid duplicate actions
      retryDelay: 1000,
    },
  },
});

// Global flag to ensure only one MetaPixelTracker initializes
let globalPixelInitialized = false;

// Meta Pixel route tracking component
function MetaPixelTracker() {
  const location = useLocation();
  const initializeRef = useRef(false);

  useEffect(() => {
    // Initialize Meta Pixel only once globally
    if (!initializeRef.current && !globalPixelInitialized) {
      initializeRef.current = true;
      globalPixelInitialized = true;
      metaPixelService.initialize().catch(console.error);
    }
  }, []);

  useEffect(() => {
    // Track page views on route changes
    const trackPageView = async () => {
      try {
        // Only track if pixel is ready and we've moved past the initial load
        if (metaPixelService.isReady() && metaPixelService.isInitialPageViewTracked()) {
          await metaPixelService.trackPageView();
        }
      } catch (error) {
        console.warn('Meta Pixel page view tracking failed:', error);
      }
    };
    
    // Add a small delay to ensure initialization is complete
    const timeoutId = setTimeout(() => {
      if (globalPixelInitialized) {
        trackPageView();
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <CountryCurrencyProvider>
              <CartProvider>
                <WishlistProvider>
                  <SearchProvider>
                    <ResponsiveImageProvider>
                    <Router>
                    <MetaPixelTracker />
                    <StoreThemeHandler />
                    <Suspense fallback={<PageLoader />}>
                        <Routes>
                        {/* Public Auth Routes */}
                        {/* <Route path="/login" element={<Login />} /> */}
                        <Route path="/signin" element={<SignIn />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/role-login" element={<RoleLogin />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Store Routes (Public) */}
                        <Route path="/" element={
                          <Suspense fallback={<StoreLoadingSkeleton />}>
                            <Store />
                          </Suspense>
                        } />
                        <Route path="/product/:slug" element={<ProductDetail />} />
                        <Route path="/categories" element={<StoreCategories />} />
                        <Route path="/products" element={<StoreProducts />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/orders/:id" element={<OrderDetail />} />
                        <Route path="/returns" element={<StoreReturns />} />
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/addresses" element={<AddressManagement />} />

                        {/* Protected Admin Routes */}
                        <Route path="/dashboard" element={
                          <RoleProtectedRoute>
                            <Index />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/products" element={
                          <RoleProtectedRoute>
                            <Products />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/categories" element={
                          <RoleProtectedRoute>
                            <Categories />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/inventory" element={
                          <RoleProtectedRoute>
                            <Inventory />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/store-management" element={
                          <RoleProtectedRoute>
                            <StoreManagement />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/orders" element={
                          <RoleProtectedRoute>
                            <Orders />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/customers" element={
                          <RoleProtectedRoute>
                            <Customers />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/returns" element={
                          <RoleProtectedRoute>
                            <Returns />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/coupons" element={
                          <RoleProtectedRoute>
                            <Coupons />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/analytics" element={
                          <RoleProtectedRoute>
                            <Analytics />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/sales-report" element={
                          <RoleProtectedRoute>
                            <SalesReport />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/user-management" element={
                          <RoleProtectedRoute>
                            <UserManagement />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/product-approval" element={
                          <RoleProtectedRoute>
                            <ProductApproval />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/localization" element={
                          <RoleProtectedRoute>
                            <Localization />
                          </RoleProtectedRoute>
                        } />

                        <Route path="/dashboard/seller-products" element={
                          <RoleProtectedRoute>
                            <SellerProducts />
                          </RoleProtectedRoute>
                        } />

                        {/* Catch all route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      </Suspense>
                    </Router>
                    <Sonner />
                  </ResponsiveImageProvider>
                </SearchProvider>
              </WishlistProvider>
            </CartProvider>
          </CountryCurrencyProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
