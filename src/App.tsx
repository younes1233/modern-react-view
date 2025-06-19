
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { SearchProvider } from "./contexts/SearchContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Inventory from "./pages/Inventory";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Analytics from "./pages/Analytics";
import SalesReport from "./pages/SalesReport";
import StoreManagement from "./pages/StoreManagement";
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
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <SearchProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/store" element={<Store />} />
                    <Route path="/store/categories" element={<StoreCategories />} />
                    <Route path="/store/product/:id" element={<ProductDetail />} />
                    <Route path="/store/wishlist" element={<Wishlist />} />
                    <Route path="/store/checkout" element={<Checkout />} />
                    <Route path="/store/returns" element={<StoreReturns />} />
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Index />
                      </ProtectedRoute>
                    } />
                    <Route path="/products" element={
                      <ProtectedRoute>
                        <Products />
                      </ProtectedRoute>
                    } />
                    <Route path="/categories" element={
                      <ProtectedRoute>
                        <Categories />
                      </ProtectedRoute>
                    } />
                    <Route path="/inventory" element={
                      <ProtectedRoute>
                        <Inventory />
                      </ProtectedRoute>
                    } />
                    <Route path="/orders" element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="/returns" element={
                      <ProtectedRoute>
                        <Returns />
                      </ProtectedRoute>
                    } />
                    <Route path="/customers" element={
                      <ProtectedRoute>
                        <Customers />
                      </ProtectedRoute>
                    } />
                    <Route path="/analytics" element={
                      <ProtectedRoute>
                        <Analytics />
                      </ProtectedRoute>
                    } />
                    <Route path="/sales-report" element={
                      <ProtectedRoute>
                        <SalesReport />
                      </ProtectedRoute>
                    } />
                    <Route path="/store-management" element={
                      <ProtectedRoute>
                        <StoreManagement />
                      </ProtectedRoute>
                    } />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </SearchProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
