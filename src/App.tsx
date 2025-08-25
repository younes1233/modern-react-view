
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleAuthProvider } from "@/contexts/RoleAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistProvider";
import { SearchProvider } from "@/contexts/SearchContext";
import { ResponsiveImageProvider } from "@/contexts/ResponsiveImageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleProtectedRoute } from "@/components/RoleProtectedRoute";
import { StoreThemeHandler } from "@/components/StoreThemeHandler";
import Index from "./pages/Index";
import Login from "./pages/Login";
import RoleLogin from "./pages/RoleLogin";
import Unauthorized from "./pages/Unauthorized";
import Store from "./pages/store/Store";
import ProductDetail from "./pages/store/ProductDetail";
import StoreCategories from "./pages/store/StoreCategories";
import Checkout from "./pages/store/Checkout";
import Wishlist from "./pages/store/Wishlist";
import Returns from "./pages/store/Returns";
import NotFound from "./pages/NotFound";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Orders from "./pages/Orders";
import Analytics from "./pages/Analytics";
import Localization from "./pages/Localization";
import { BannerManagement } from "./components/store-management/BannerManagement";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ResponsiveImageProvider>
          <AuthProvider>
            <RoleAuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <SearchProvider>
                    <Router>
                      <StoreThemeHandler />
                      <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/role-login" element={<RoleLogin />} />
                        <Route path="/unauthorized" element={<Unauthorized />} />
                        <Route path="/store" element={<Store />} />
                        <Route path="/store/product/:slug" element={<ProductDetail />} />
                        <Route path="/store/categories" element={<StoreCategories />} />
                        <Route path="*" element={<NotFound />} />

                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                        <Route path="/returns" element={<ProtectedRoute><Returns /></ProtectedRoute>} />

                        <Route path="/products" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><Products /></RoleProtectedRoute>} />
                        <Route path="/categories" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><Categories /></RoleProtectedRoute>} />
                        <Route path="/orders" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><Orders /></RoleProtectedRoute>} />
                        <Route path="/analytics" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><Analytics /></RoleProtectedRoute>} />
                        <Route path="/localization" element={<RoleProtectedRoute allowedRoles={['super_admin']}><Localization /></RoleProtectedRoute>} />
                        <Route path="/banners" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><BannerManagement /></RoleProtectedRoute>} />
                      </Routes>
                      <Toaster />
                    </Router>
                  </SearchProvider>
                </WishlistProvider>
              </CartProvider>
            </RoleAuthProvider>
          </AuthProvider>
        </ResponsiveImageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
