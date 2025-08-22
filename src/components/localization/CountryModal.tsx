
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { Country } from "@/services/countryService";
import { useCurrencies } from "@/hooks/useCurrencies";

interface CountryFormData {
  name: string;
  iso_code: string;
  default_vat_percentage: string;
  base_currency_id?: number;
  currencies?: number[] | string[];
}

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (country: CountryFormData) => void;
  country: Country | null;
}

export const CountryModal = ({ isOpen, onClose, onSave, country }: CountryModalProps) => {
  const { currencies, loading: currenciesLoading } = useCurrencies();
  const [formData, setFormData] = useState({
    name: "",
    iso_code: "",
    default_vat_percentage: "0",
    base_currency_id: 1,
    currencies: [1] as number[],
  });

  useEffect(() => {
    if (country) {
      setFormData({
        name: country.name,
        iso_code: country.iso_code,
        default_vat_percentage: country.default_vat_percentage,
        base_currency_id: country.base_currency.id,
        currencies: country.currencies.map(c => c.id),
      });
    } else {
      // Set default to first available currency when creating new country
      const firstActiveCurrency = currencies.find(c => c.is_active);
      const defaultCurrencyId = firstActiveCurrency?.id || 1;
      
      setFormData({
        name: "",
        iso_code: "",
        default_vat_percentage: "0",
        base_currency_id: defaultCurrencyId,
        currencies: [defaultCurrencyId],
      });
    }
  }, [country, currencies]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ensure base currency is included in currencies array
    const currenciesSet = new Set(formData.currencies);
    currenciesSet.add(formData.base_currency_id);
    
    const submitData: CountryFormData = {
      name: formData.name,
      iso_code: formData.iso_code,
      default_vat_percentage: formData.default_vat_percentage,
      base_currency_id: formData.base_currency_id,
      currencies: country ? Array.from(currenciesSet).map(id => id.toString()) : Array.from(currenciesSet),
    };
    
    onSave(submitData);
  };

  const handleChange = (field: string, value: string | number | number[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCurrencyToggle = (currencyId: number, checked: boolean) => {
    setFormData(prev => {
      const newCurrencies = checked
        ? [...prev.currencies, currencyId]
        : prev.currencies.filter(id => id !== currencyId);
      
      // If we're removing the base currency, set the first remaining currency as base
      if (!checked && currencyId === prev.base_currency_id && newCurrencies.length > 0) {
        return {
          ...prev,
          currencies: newCurrencies,
          base_currency_id: newCurrencies[0],
        };
      }
      
      return {
        ...prev,
        currencies: newCurrencies,
      };
    });
  };

  const activeCurrencies = currencies.filter(c => c.is_active);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {country ? "Edit Country" : "Add New Country"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Country Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter country name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="iso_code">ISO Code</Label>
            <Input
              id="iso_code"
              value={formData.iso_code}
              onChange={(e) => handleChange("iso_code", e.target.value.toUpperCase())}
              placeholder="US, GB, DE..."
              maxLength={3}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vat">Default VAT Percentage</Label>
            <Input
              id="vat"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={formData.default_vat_percentage}
              onChange={(e) => handleChange("default_vat_percentage", e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="space-y-2">
            <Label>Base Currency</Label>
            {currenciesLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select
                value={formData.base_currency_id.toString()}
                onValueChange={(value) => {
                  const currencyId = parseInt(value);
                  handleChange("base_currency_id", currencyId);
                  // Ensure base currency is in currencies array
                  if (!formData.currencies.includes(currencyId)) {
                    handleChange("currencies", [...formData.currencies, currencyId]);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select base currency" />
                </SelectTrigger>
                <SelectContent>
                  {activeCurrencies.map((currency) => (
                    <SelectItem key={currency.id} value={currency.id.toString()}>
                      {currency.code} - {currency.name} ({currency.symbol})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Supported Currencies</Label>
            {currenciesLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            ) : activeCurrencies.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                No active currencies available. Please add currencies first.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto border rounded p-2">
                {activeCurrencies.map((currency) => (
                  <div key={currency.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`currency-${currency.id}`}
                      checked={formData.currencies.includes(currency.id)}
                      onCheckedChange={(checked) => 
                        handleCurrencyToggle(currency.id, checked as boolean)
                      }
                      disabled={currency.id === formData.base_currency_id}
                    />
                    <Label 
                      htmlFor={`currency-${currency.id}`}
                      className="text-sm font-normal flex items-center gap-1"
                    >
                      <span className="font-mono">{currency.code}</span>
                      <span>{currency.symbol}</span>
                      {currency.id === formData.base_currency_id && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-1 rounded">base</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={formData.currencies.length === 0 || currenciesLoading}
            >
              {country ? "Update" : "Create"} Country
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
