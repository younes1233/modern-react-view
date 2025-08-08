
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CountryCurrency {
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  exchangeRate: number;
  isBaseCurrency: boolean;
}

interface Country {
  id: number;
  name: string;
  code: string;
  flag: string;
  isActive: boolean;
  currencies: CountryCurrency[];
}

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (country: Omit<Country, 'id'>) => void;
  country: Country | null;
}

export const CountryModal = ({ isOpen, onClose, onSave, country }: CountryModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    flag: "",
    isActive: true,
    currencies: [] as CountryCurrency[],
  });

  useEffect(() => {
    if (country) {
      setFormData({
        name: country.name,
        code: country.code,
        flag: country.flag,
        isActive: country.isActive,
        currencies: country.currencies,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        flag: "",
        isActive: true,
        currencies: [],
      });
    }
  }, [country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="United States"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">Country Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="US"
              maxLength={2}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="flag">Flag Emoji</Label>
            <Input
              id="flag"
              value={formData.flag}
              onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
              placeholder="🇺🇸"
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
            Note: Use the currency management button to add and configure currencies for this country.
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {country ? "Update" : "Create"} Country
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
