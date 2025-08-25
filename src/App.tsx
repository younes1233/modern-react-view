import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { RoleAuthProvider } from "@/contexts/RoleAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { ResponsiveImageProvider } from "@/contexts/ResponsiveImageContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import RoleProtectedRoute from "@/components/RoleProtectedRoute";
import StoreThemeHandler from "@/components/StoreThemeHandler";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Store from "./pages/store/Store";
import ProductDetails from "./pages/store/ProductDetails";
import CategoryPage from "./pages/store/CategoryPage";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Orders from "./pages/Orders";
import Wishlist from "./pages/Wishlist";
import SearchResults from "./pages/SearchResults";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import FAQ from "./pages/FAQ";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/dashboard/Dashboard";
import UsersManagement from "./pages/dashboard/UsersManagement";
import ProductsManagement from "./pages/dashboard/ProductsManagement";
import CategoriesManagement from "./pages/dashboard/CategoriesManagement";
import OrdersManagement from "./pages/dashboard/OrdersManagement";
import Settings from "./pages/dashboard/Settings";
import ProductListingManagement from "./pages/dashboard/ProductListingManagement";
import Analytics from "./pages/dashboard/Analytics";
import Localization from "./pages/dashboard/Localization";
import BannersManagement from "./pages/store-management/BannerManagement";

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
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/store" element={<Store />} />
                        <Route path="/store/product/:slug" element={<ProductDetails />} />
                        <Route path="/store/category/:slug" element={<CategoryPage />} />
                        <Route path="/search" element={<SearchResults />} />
                        <Route path="/about" element={<AboutUs />} />
                        <Route path="/contact" element={<ContactUs />} />
                        <Route path="/faq" element={<FAQ />} />
                        <Route path="*" element={<NotFound />} />

                        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                        <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                        <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

                        <Route path="/dashboard" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><Dashboard /></RoleProtectedRoute>} />
                        <Route path="/dashboard/users" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><UsersManagement /></RoleProtectedRoute>} />
                        <Route path="/dashboard/products" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><ProductsManagement /></RoleProtectedRoute>} />
                        <Route path="/dashboard/categories" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><CategoriesManagement /></RoleProtectedRoute>} />
                        <Route path="/dashboard/product-listings" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><ProductListingManagement /></RoleProtectedRoute>} />
                        <Route path="/dashboard/banners" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><BannersManagement /></RoleProtectedRoute>} />
                        <Route path="/dashboard/orders" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><OrdersManagement /></RoleProtectedRoute>} />
                        <Route path="/dashboard/analytics" element={<RoleProtectedRoute allowedRoles={['manager', 'super_admin']}><Analytics /></RoleProtectedRoute>} />
                        <Route path="/dashboard/localization" element={<RoleProtectedRoute allowedRoles={['super_admin']}><Localization /></RoleProtectedRoute>} />
                        <Route path="/dashboard/settings" element={<RoleProtectedRoute allowedRoles={['super_admin']}><Settings /></RoleProtectedRoute>} />
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
