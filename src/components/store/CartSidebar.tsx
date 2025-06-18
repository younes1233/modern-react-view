
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useState } from "react";

export function CartSidebar() {
  const { items, updateQuantity, removeFromCart, getTotalItems, getTotalPrice, clearCart } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const handleCheckout = () => {
    alert("Checkout functionality would be implemented here!");
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="sm" className="relative hover:bg-cyan-50 hover:text-cyan-600">
          <ShoppingCart className="w-5 h-5" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-cyan-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-[400px] flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Shopping Cart ({getTotalItems()})</span>
            {items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </SheetTitle>
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
                <div key={item.product.id} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-2">
                      {item.product.name}
                    </h4>
                    <p className="text-sm text-gray-600">${item.product.price}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1"
                      >
                        <X className="w-4 h-4" />
                      </Button>
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
              >
                Checkout
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
