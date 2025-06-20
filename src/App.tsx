
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { StoreThemeHandler } from "./components/StoreThemeHandler";
import { AuthProvider } from "./contexts/AuthContext";
import { RoleAuthProvider } from "./contexts/RoleAuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistProvider";
import { SearchProvider } from "./contexts/SearchContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RoleProtectedRoute } from "./components/RoleProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RoleLogin from "./pages/RoleLogin";
import Unauthorized from "./pages/Unauthorized";
import UserManagement from "./pages/UserManagement";
import ProductApproval from "./pages/ProductApproval";
import SellerProducts from "./pages/SellerProducts";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import SalesReport from "./pages/SalesReport";
import StoreManagement from "./pages/StoreManagement";
import Coupons from "./pages/Coupons";
import Store from "./pages/store/Store";
import StoreCategories from "./pages/store/StoreCategories";
import ProductDetail from "./pages/store/ProductDetail";
import Wishlist from "./pages/store/Wishlist";
import Checkout from "./pages/store/Checkout";
import StoreReturns from "./pages/store/Returns";
import NotFound from "./pages/NotFound";
import Returns from "./pages/Returns";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="dashboard-theme">
      <RoleAuthProvider>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <SearchProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <StoreThemeHandler />
                    <Routes>
                      {/* Old login system */}
                      <Route path="/login" element={<Login />} />
                      
                      {/* New role-based login system */}
                      <Route path="/role-login" element={<RoleLogin />} />
                      <Route path="/unauthorized" element={<Unauthorized />} />

                      {/* Store routes (accessible to customers and everyone) */}
                      <Route path="/store" element={<Store />} />
                      <Route path="/store/categories" element={<StoreCategories />} />
                      <Route path="/store/product/:id" element={<ProductDetail />} />
                      <Route path="/store/wishlist" element={<Wishlist />} />
                      <Route path="/store/checkout" element={<Checkout />} />
                      <Route path="/store/returns" element={<StoreReturns />} />

                      {/* Dashboard routes */}
                      <Route path="/" element={
                        <RoleProtectedRoute allowedRoles={['super_admin', 'manager', 'seller']}>
                          <Index />
                        </RoleProtectedRoute>
                      } />

                      {/* Super Admin only routes */}
                      <Route path="/user-management" element={
                        <RoleProtectedRoute allowedRoles={['super_admin']}>
                          <UserManagement />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/product-approval" element={
                        <RoleProtectedRoute allowedRoles={['super_admin']}>
                          <ProductApproval />
                        </RoleProtectedRoute>
                      } />

                      {/* Seller only routes */}
                      <Route path="/seller-products" element={
                        <RoleProtectedRoute allowedRoles={['seller']}>
                          <SellerProducts />
                        </RoleProtectedRoute>
                      } />

                      {/* Super Admin and Manager routes */}
                      <Route path="/products" element={
                        <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                          <Products />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/categories" element={
                        <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                          <Categories />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/inventory" element={
                        <RoleProtectedRoute allowedRoles={['super_admin']}>
                          <Inventory />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/orders" element={
                        <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                          <Orders />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/returns" element={
                        <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                          <Returns />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/customers" element={
                        <RoleProtectedRoute allowedRoles={['super_admin', 'manager']}>
                          <Customers />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/coupons" element={
                        <RoleProtectedRoute allowedRoles={['super_admin']}>
                          <Coupons />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/analytics" element={
                        <RoleProtectedRoute allowedRoles={['super_admin']}>
                          <Analytics />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/sales-report" element={
                        <RoleProtectedRoute allowedRoles={['super_admin']}>
                          <SalesReport />
                        </RoleProtectedRoute>
                      } />
                      <Route path="/store-management" element={
                        <RoleProtectedRoute allowedRoles={['super_admin']}>
                          <StoreManagement />
                        </RoleProtectedRoute>
                      } />

                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </SearchProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </RoleAuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
