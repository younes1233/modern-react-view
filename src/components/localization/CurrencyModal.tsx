
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

  useEffect(() => {
    if (currency) {
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        is_active: currency.is_active,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        symbol: "",
        is_active: true,
      });
    }
  }, [currency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {currency ? "Edit Currency" : "Add New Currency"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Currency Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="USD"
              maxLength={3}
              required
              disabled={!!currency} // Disable editing code for existing currencies
            />
            {currency && (
              <p className="text-sm text-muted-foreground">Currency code cannot be changed</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Currency Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="US Dollar"
              maxLength={255}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="symbol">Currency Symbol</Label>
            <Input
              id="symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              placeholder="$"
              maxLength={3}
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
          <div className="text-sm text-muted-foreground">
            Note: This currency will be available for assignment in countries. 
            Exchange rates are configured per country.
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {currency ? "Update" : "Create"} Currency
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
