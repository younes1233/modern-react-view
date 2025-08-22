
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Currency } from "@/services/currencyService";

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currency: {
    code: string;
    name: string;
    symbol: string;
    is_active: boolean;
  }) => void;
  currency: Currency | null;
}

export const CurrencyModal = ({ isOpen, onClose, onSave, currency }: CurrencyModalProps) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    is_active: true,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currency) {
      console.log('Editing currency:', currency);
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        is_active: currency.is_active,
      });
    } else {
      console.log('Creating new currency');
      setFormData({
        code: "",
        name: "",
        symbol: "",
        is_active: true,
      });
    }
  }, [currency, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.code.trim() || !formData.name.trim() || !formData.symbol.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Submitting currency form:', formData);
      await onSave({
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        symbol: formData.symbol.trim(),
        is_active: formData.is_active,
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    console.log('Modal close requested');
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currency ? "Edit Currency" : "Add New Currency"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Currency Code *</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="USD"
              maxLength={3}
              required
              disabled={!!currency || isSubmitting}
              className="font-mono"
            />
            {currency && (
              <p className="text-sm text-muted-foreground">
                Currency code cannot be changed for existing currencies
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Currency Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="US Dollar"
              maxLength={255}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symbol">Currency Symbol *</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="$"
              maxLength={3}
              required
              disabled={isSubmitting}
              className="font-bold text-lg"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              disabled={isSubmitting}
            />
            <Label htmlFor="is_active">Active Currency</Label>
          </div>

          <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-md">
            <p className="font-medium text-blue-900 mb-1">Note:</p>
            <p className="text-blue-800">
              This currency will be available for assignment in countries. 
              Exchange rates are configured per country in the Countries section.
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {currency ? "Updating..." : "Creating..."}
                </>
              ) : (
                currency ? "Update Currency" : "Create Currency"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
