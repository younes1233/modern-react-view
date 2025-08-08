
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Country } from "@/services/countryService";

interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (country: Partial<Country>) => void;
  country: Country | null;
}

export const CountryModal = ({ isOpen, onClose, onSave, country }: CountryModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    iso_code: "",
    default_vat_percentage: "0",
  });

  useEffect(() => {
    if (country) {
      setFormData({
        name: country.name,
        iso_code: country.iso_code,
        default_vat_percentage: country.default_vat_percentage,
      });
    } else {
      setFormData({
        name: "",
        iso_code: "",
        default_vat_percentage: "0",
      });
    }
  }, [country]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
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
              maxLength={2}
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

          <div className="flex justify-end space-x-2 pt-4">
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
