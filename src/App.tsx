
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { StoreThemeHandler } from "@/components/StoreThemeHandler";

import { AuthProvider } from "@/contexts/AuthContext";
import { RoleAuthProvider } from "@/contexts/RoleAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { ResponsiveImageProvider } from "@/contexts/ResponsiveImageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";

// Admin Pages
import Index from "@/pages/Index";
import Products from "@/pages/Products";
import Categories from "@/pages/Categories";
import Orders from "@/pages/Orders";
import Customers from "@/pages/Customers";
import Analytics from "@/pages/Analytics";
import SalesReport from "@/pages/SalesReport";
import Returns from "@/pages/Returns";
import Coupons from "@/pages/Coupons";
import UserManagement from "@/pages/UserManagement";
import ProductApproval from "@/pages/ProductApproval";
import Localization from "@/pages/Localization";
import SellerProducts from "@/pages/SellerProducts";
import Inventory from "@/pages/Inventory";
import StoreManagement from "@/pages/StoreManagement";

// Auth Pages
import Login from "@/pages/Login";
import RoleLogin from "@/pages/RoleLogin";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";
import Unauthorized from "@/pages/Unauthorized";

// Store Pages
import Store from "@/pages/store/Store";
import ComingSoon from "./pages/store/ComingSoon";
import ProductDetail from "@/pages/store/ProductDetail";
import StoreCategories from "@/pages/store/StoreCategories";
import Checkout from "@/pages/store/Checkout";
import StoreReturns from "@/pages/store/Returns";
import Wishlist from "@/pages/store/Wishlist";

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

                        {/* Protected Admin Routes */}
                        <Route path="/" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <Index />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/products" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <Products />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/categories" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <Categories />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/inventory" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <Inventory />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        <Route path="/store-management" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <StoreManagement />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/orders" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <Orders />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/customers" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <Customers />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/returns" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <Returns />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/coupons" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <Coupons />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/analytics" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <Analytics />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/sales-report" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                              <SalesReport />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        {/* Super Admin Only Routes */}
                        <Route path="/user-management" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin']}>
                              <UserManagement />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/product-approval" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin']}>
                              <ProductApproval />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />
                        
                        <Route path="/localization" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['super_admin']}>
                              <Localization />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        {/* Seller Routes */}
                        <Route path="/seller-products" element={
                          <ProtectedRoute>
                            <RoleProtectedRoute allowedRoles={['seller']}>
                              <SellerProducts />
                            </RoleProtectedRoute>
                          </ProtectedRoute>
                        } />

                        {/* Catch all route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
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
