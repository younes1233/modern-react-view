
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isBaseCurrency: boolean;
  isActive: boolean;
  countries: string[];
}

interface CurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currency: Omit<Currency, 'id'>) => void;
  currency: Currency | null;
}

// Mock countries data
const availableCountries = [
  "United States",
  "United Kingdom", 
  "Germany",
  "Canada",
  "Australia",
  "Japan",
  "France",
  "Italy",
  "Spain",
  "Netherlands"
];

export const CurrencyModal = ({ isOpen, onClose, onSave, currency }: CurrencyModalProps) => {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    symbol: "",
    exchangeRate: 1.0,
    isBaseCurrency: false,
    isActive: true,
    countries: [] as string[],
  });

  useEffect(() => {
    if (currency) {
      setFormData({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        exchangeRate: currency.exchangeRate,
        isBaseCurrency: currency.isBaseCurrency,
        isActive: currency.isActive,
        countries: currency.countries,
      });
    } else {
      setFormData({
        code: "",
        name: "",
        symbol: "",
        exchangeRate: 1.0,
        isBaseCurrency: false,
        isActive: true,
        countries: [],
      });
    }
  }, [currency]);

  const handleCountryToggle = (country: string, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        countries: [...formData.countries, country]
      });
    } else {
      setFormData({
        ...formData,
        countries: formData.countries.filter(c => c !== country)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
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
          <div className="space-y-2">
            <Label htmlFor="exchangeRate">Exchange Rate (to base currency)</Label>
            <Input
              id="exchangeRate"
              type="number"
              step="0.0001"
              value={formData.exchangeRate}
              onChange={(e) => setFormData({ ...formData, exchangeRate: parseFloat(e.target.value) || 0 })}
              placeholder="1.0000"
              disabled={formData.isBaseCurrency}
              required
            />
          </div>
          <div className="space-y-3">
            <Label>Attach to Countries</Label>
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded">
              {availableCountries.map((country) => (
                <div key={country} className="flex items-center space-x-2">
                  <Checkbox
                    id={country}
                    checked={formData.countries.includes(country)}
                    onCheckedChange={(checked) => 
                      handleCountryToggle(country, checked as boolean)
                    }
                  />
                  <Label htmlFor={country} className="text-sm">
                    {country}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isBaseCurrency"
              checked={formData.isBaseCurrency}
              onCheckedChange={(checked) => setFormData({ 
                ...formData, 
                isBaseCurrency: checked,
                exchangeRate: checked ? 1.0 : formData.exchangeRate
              })}
            />
            <Label htmlFor="isBaseCurrency">Base Currency</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
            />
            <Label htmlFor="isActive">Active</Label>
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
