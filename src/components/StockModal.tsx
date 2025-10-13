
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/sonner';
import { Package, Plus, Minus } from "lucide-react";

interface StockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (stockData: any) => void;
  mode: 'add' | 'adjust';
  products?: any[];
}

export function StockModal({ 
  isOpen, 
  onClose, 
  onSave, 
  mode,
  products = []
}: StockModalProps) {
  // Removed useToast hook;
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    reason: '',
    notes: '',
    supplier: '',
    cost: ''
  });

  const resetForm = () => {
    setFormData({
      productId: '',
      quantity: '',
      reason: '',
      notes: '',
      supplier: '',
      cost: ''
    });
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity) {
      toast.error("Product and quantity are required", { duration: 2500 });
      return;
    }

    const quantity = parseInt(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      toast.error("Quantity must be a positive number", { duration: 2500 });
      return;
    }

    const stockData = {
      ...formData,
      quantity,
      cost: formData.cost ? parseFloat(formData.cost) : 0,
      timestamp: new Date().toISOString(),
      type: mode
    };

    onSave(stockData);
    toast.success(`Stock ${mode === 'add' ? 'added' : 'adjusted'} successfully`, { duration: 2000 });
    onClose();
  };

  const adjustmentReasons = [
    { value: 'restock', label: 'New Stock Received' },
    { value: 'damaged', label: 'Damaged Items' },
    { value: 'returned', label: 'Customer Returns' },
    { value: 'lost', label: 'Lost/Stolen' },
    { value: 'expired', label: 'Expired Items' },
    { value: 'correction', label: 'Inventory Correction' },
    { value: 'other', label: 'Other' }
  ];

  // Mock products for demo - in real app this would come from props
  const mockProducts = [
    { id: 'WH-001', name: 'Wireless Headphones' },
    { id: 'SW-002', name: 'Smart Watch' },
    { id: 'BS-003', name: 'Bluetooth Speaker' },
    { id: 'PC-004', name: 'Phone Case' },
    { id: 'LS-005', name: 'Laptop Stand' }
  ];

  const availableProducts = products.length > 0 ? products : mockProducts;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            {mode === 'add' ? 'Add Stock' : 'Adjust Stock'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select 
              value={formData.productId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, productId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {availableProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name} ({product.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">Quantity *</Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseInt(formData.quantity) || 0;
                  if (current > 1) {
                    setFormData(prev => ({ ...prev, quantity: (current - 1).toString() }));
                  }
                }}
                className="px-3"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="0"
                min="1"
                className="text-center"
                required
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const current = parseInt(formData.quantity) || 0;
                  setFormData(prev => ({ ...prev, quantity: (current + 1).toString() }));
                }}
                className="px-3"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {mode === 'adjust' && (
            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Select 
                value={formData.reason} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select reason for adjustment" />
                </SelectTrigger>
                <SelectContent>
                  {adjustmentReasons.map((reason) => (
                    <SelectItem key={reason.value} value={reason.value}>
                      {reason.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === 'add' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Input
                  id="supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Enter supplier name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Unit Cost</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {mode === 'add' ? 'Add Stock' : 'Adjust Stock'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
