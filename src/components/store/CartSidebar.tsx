
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useCountryCurrency } from "@/contexts/CountryCurrencyContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkoutService } from "@/services/checkoutService";
import { toast } from "@/hooks/use-toast";

export function CartSidebar() {
  const { items, updateQuantity, removeFromCart, getTotalItems, getTotalPrice, clearCart, isLoading } = useCart();
  const { selectedCountry, selectedCurrency } = useCountryCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!selectedCountry) {
      toast({
        title: "Country Required",
        description: "Please select a country before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);

    try {
      // Use selected country from context (saved in user_settings)
      if (!selectedCountry) {
        toast({
          title: "Country Required",
          description: "Please select your country from the header before proceeding to checkout.",
          variant: "destructive",
        });
        setIsCheckingOut(false);
        return;
      }

      const response = await checkoutService.startCheckout({
        country_id: selectedCountry.id,
        currency_id: selectedCurrency?.id,
      });

      // Store checkout session details
      sessionStorage.setItem('checkout_session', JSON.stringify(response.details));

      toast({
        title: "Checkout Started",
        description: response.message,
      });

      // Navigate to checkout with session data
      navigate('/store/checkout', {
        state: {
          checkoutSession: response.details,
        },
      });
      setIsOpen(false);
    } catch (error: any) {
      console.error('Checkout start error:', error);
      toast({
        title: "Checkout Failed",
        description: error.response?.data?.message || "Failed to start checkout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative hover:bg-cyan-50 hover:text-cyan-600 p-1.5 rounded-xl transition-all duration-300"
          data-cart-trigger
        >
          <ShoppingCart className="w-5 h-5" />
          {getTotalItems() > 0 && (
            <span className="absolute -top-1 -right-1 bg-cyan-500 text-white text-[10px] rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center font-bold shadow-lg">
              {getTotalItems()}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] flex flex-col" hideClose>
        <SheetHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <div className="flex items-center justify-between gap-2">
            <SheetTitle className="flex items-center gap-2">
              <span>Shopping Cart ({getTotalItems()})</span>
            </SheetTitle>
            <div className="flex items-center gap-1">
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCart}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-2"
                  title="Clear cart"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
              <SheetClose asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full p-2 hover:bg-gray-100"
                  title="Close"
                >
                  <X className="w-5 h-5" />
                </Button>
              </SheetClose>
            </div>
          </div>
          <SheetDescription className="sr-only">
            View and manage items in your shopping cart
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-4">Start shopping to add items to your cart</p>
              <Button onClick={() => setIsOpen(false)} className="bg-cyan-600 hover:bg-cyan-700">
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 bg-gray-50 p-3 rounded-lg">
                  <img
                    src={
                      typeof item.product.image === 'string'
                        ? item.product.image
                        : (() => {
                            const img = item.product.image as any;
                            if (img?.urls) {
                              return img.urls.catalog || img.urls.main || img.urls.original || img.urls.thumbnail_small || '/placeholder.svg';
                            }
                            return img?.desktop || img?.tablet || img?.mobile || img?.url || img?.image_url || '/placeholder.svg';
                          })()
                    }
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-md cursor-pointer flex-shrink-0 border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }}
                    onClick={() => {
                      navigate(`/store/product/${item.product.slug}`);
                      setIsOpen(false);
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-2 cursor-pointer hover:text-cyan-600 transition-colors mb-1"
                        onClick={() => {
                          navigate(`/store/product/${item.product.slug}`);
                          setIsOpen(false);
                        }}>
                      {item.product.name}
                    </h4>

                    {/* Show variant information if exists */}
                    {item.isVariant && item.selectedVariations && Array.isArray(item.selectedVariations) && item.selectedVariations.length > 0 && (
                      <div className="text-xs text-gray-500 mb-1 flex flex-wrap gap-1">
                        {item.selectedVariations.map((variation: any, idx: number) => (
                          <span key={idx} className="inline-flex items-center bg-gray-100 rounded px-1.5 py-0.5">
                            <span className="font-medium">{variation.attribute_name}:</span>
                            <span className="ml-0.5">{variation.value}</span>
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-sm font-semibold text-gray-900">${(item.price || item.product.price).toFixed(2)}</p>
                    <div className="flex items-center justify-between mt-3 gap-2">
                      <div className="flex items-center space-x-1 bg-white rounded-lg border border-gray-200 p-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 p-0 hover:bg-gray-100"
                          disabled={isLoading}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 p-0 hover:bg-gray-100"
                          disabled={isLoading}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          ${((item.price || item.product.price) * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 w-7 h-7 p-0"
                          disabled={isLoading}
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total:</span>
              <span>${getTotalPrice().toFixed(2)}</span>
            </div>
            <div className="space-y-2">
              <Button 
                onClick={handleCheckout}
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                size="lg"
                disabled={isCheckingOut || isLoading}
              >
                {isCheckingOut ? "Starting Checkout..." : "Proceed to Checkout"}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsOpen(false)}
                className="w-full"
                size="lg"
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
