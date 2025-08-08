
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  isActive: boolean;
  usedInCountries: string[];
}

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currency: Omit<Currency, 'id'>) => void;
  currency: Currency | null;
}

export const CurrencyModal = ({ isOpen, onClose, onSave, currency }: CurrencyModalProps) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    isActive: true,
    usedInCountries: [] as string[],
  });

  useEffect(() => {
    if (currency) {
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        isActive: currency.isActive,
        usedInCountries: currency.usedInCountries,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        symbol: "",
        isActive: true,
        usedInCountries: [],
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Currency Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="US Dollar"
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
              required
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
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
