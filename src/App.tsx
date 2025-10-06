import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { StoreThemeHandler } from "@/components/StoreThemeHandler";
import { lazy, Suspense } from "react";

import { AuthProvider } from "@/contexts/AuthContext";
import { RoleAuthProvider } from "@/contexts/RoleAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { ResponsiveImageProvider } from "@/contexts/ResponsiveImageContext";
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
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";

// Store Pages - Lazy load except ComingSoon (landing page)
const Store = lazy(() => import("@/pages/store/Store"));
import ComingSoon from "./pages/store/ComingSoon";
const ProductDetail = lazy(() => import("@/pages/store/ProductDetail"));
const StoreCategories = lazy(() => import("@/pages/store/StoreCategories"));
const Checkout = lazy(() => import("@/pages/store/Checkout"));
const StoreReturns = lazy(() => import("@/pages/store/Returns"));
const Wishlist = lazy(() => import("@/pages/store/Wishlist"));
const AddressManagement = lazy(() => import("@/pages/store/AddressManagement"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <AuthProvider>
          <RoleAuthProvider>
            <CartProvider>
              <WishlistProvider>
                <SearchProvider>
                  <ResponsiveImageProvider>
                    <Router>
                      <StoreThemeHandler />
                      <Suspense fallback={<PageLoader />}>
                        <Routes>
                        {/* Public Auth Routes */}
                        {/* <Route path="/login" element={<Login />} /> */}
                        <Route path="/role-login" element={<RoleLogin />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />

                        {/* Store Routes (Public) */}
                        <Route path="/store" element={<Store />} />
                        <Route path="/" element={<ComingSoon />} />
                        <Route path="/store/product/:slug" element={<ProductDetail />} />
                        <Route path="/store/categories" element={<StoreCategories />} />
                        <Route path="/store/checkout" element={<Checkout />} />
                        <Route path="/store/returns" element={<StoreReturns />} />
                        <Route path="/store/wishlist" element={<Wishlist />} />
                        <Route path="/store/addresses" element={<AddressManagement />} />

                        {/* Protected Admin Routes */}
                        <Route path="/dashboard" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <Index />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/products" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <Products />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/categories" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <Categories />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/inventory" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <Inventory />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/store-management" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <StoreManagement />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/orders" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <Orders />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/customers" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <Customers />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/returns" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <Returns />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/coupons" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <Coupons />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/analytics" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <Analytics />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/sales-report" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <SalesReport />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/user-management" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <UserManagement />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/product-approval" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <ProductApproval />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/localization" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <Localization />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/dashboard/seller-products" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute>
                              <SellerProducts />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        {/* Catch all route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      </Suspense>
                    </Router>
                    <Toaster />
                    <Sonner />
                  </ResponsiveImageProvider>
                </SearchProvider>
              </WishlistProvider>
            </CartProvider>
          </RoleAuthProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
