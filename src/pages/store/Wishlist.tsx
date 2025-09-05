
import { StoreLayout } from '@/components/store/StoreLayout';
import { ProductCard } from '@/components/store/ProductCard';
import { Button } from '@/components/ui/button';
import { Heart, ShoppingBag, Lock } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { AuthModal } from '@/components/auth/AuthModal';
import { useState } from 'react';

const Wishlist = () => {
  const { items, clearWishlist, isLoading } = useWishlist();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (!user) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Lock className="w-24 h-24 text-gray-300 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Sign In Required</h1>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Please sign in to view and manage your wishlist items.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                onClick={() => setAuthModalOpen(true)}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                Sign In
              </Button>
              <Link to="/store">
                <Button variant="outline">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
          <AuthModal 
            open={authModalOpen} 
            onOpenChange={setAuthModalOpen} 
            defaultMode="signin"
          />
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Wishlist</h1>
            <p className="text-sm sm:text-base text-gray-600">Save your favorite items for later</p>
          </div>
          {items.length > 0 && (
            <Button
              variant="outline"
              onClick={clearWishlist}
              className="text-red-500 border-red-500 hover:bg-red-50 text-sm sm:text-base px-3 sm:px-4 py-1.5 sm:py-2"
              disabled={isLoading}
            >
              Clear All
            </Button>
          )}
        </div>

        {/* Wishlist Content */}
        {items.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <Heart className="w-20 sm:w-24 h-20 sm:h-24 text-gray-300 mx-auto mb-4 sm:mb-6" />
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3 sm:mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base px-4">
              Start browsing our products and add items you love to your wishlist for easy access later.
            </p>
            <Link to="/store/categories">
              <Button className="bg-cyan-600 hover:bg-cyan-700">
                <ShoppingBag className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-4 sm:mb-6">
              <p className="text-gray-600 text-sm sm:text-base">
                {items.length} {items.length === 1 ? 'item' : 'items'} in your wishlist
              </p>
            </div>
            
            {/* Force 2 columns on mobile, responsive grid on larger screens */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6">
              {items.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </StoreLayout>
  );
};

export default Wishlist;
