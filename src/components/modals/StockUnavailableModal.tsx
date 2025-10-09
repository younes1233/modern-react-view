import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UnavailableItem {
  product_name: string;
  requested_quantity: number;
  available_quantity: number;
}

interface StockUnavailableModalProps {
  isOpen: boolean;
  onClose: () => void;
  unavailableItems: UnavailableItem[];
}

export const StockUnavailableModal: React.FC<StockUnavailableModalProps> = ({
  isOpen,
  onClose,
  unavailableItems
}) => {
  const navigate = useNavigate();

  const handleGoToCart = () => {
    onClose();
    navigate('/cart');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-amber-600">
            <AlertTriangle className="h-5 w-5" />
            Items Not Available
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-600 mb-4">
            Some items in your cart are no longer available in the requested quantity. 
            Please update your cart before proceeding to checkout.
          </p>
          
          <div className="space-y-3">
            {unavailableItems.map((item, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-red-800">{item.product_name}</h4>
                    <div className="text-sm text-red-600 mt-1">
                      <span>Requested: {item.requested_quantity}</span>
                      <span className="mx-2">•</span>
                      <span>Available: {item.available_quantity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGoToCart} className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Update Cart
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};