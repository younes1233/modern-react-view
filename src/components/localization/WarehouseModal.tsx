
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Warehouse } from "@/services/warehouseService";
import { useCountries } from "@/hooks/useCountries";
import { Loader2 } from "lucide-react";

interface WarehouseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (warehouse: {
    name: string;
    country_id: number;
    location: string;
    zone_structure_id?: number;
    code: string;
  }) => void;
  warehouse: Warehouse | null;
}

export const WarehouseModal = ({ isOpen, onClose, onSave, warehouse }: WarehouseModalProps) => {
  const { countries, loading: countriesLoading } = useCountries();
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    country_id: 0,
    zone_structure_id: undefined as number | undefined,
  });

  useEffect(() => {
    if (warehouse) {
      setFormData({
        name: warehouse.name,
        code: warehouse.code,
        location: warehouse.location,
        country_id: warehouse.country.id,
        zone_structure_id: warehouse.zone_structure?.id,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        location: "",
        country_id: 0,
        zone_structure_id: undefined,
      });
    }
  }, [warehouse]);

  const handleCountryChange = (countryId: string) => {
    setFormData({
      ...formData,
      country_id: parseInt(countryId),
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country_id) {
      alert('Please select a country');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {warehouse ? "Edit Warehouse" : "Add New Warehouse"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Warehouse Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="New York Distribution Center"
              required
              maxLength={255}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="code">Warehouse Code</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              placeholder="NYC-DC"
              required
              maxLength={50}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            {countriesLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Loading countries...</span>
              </div>
            ) : (
              <Select
                value={formData.country_id ? formData.country_id.toString() : ""}
                onValueChange={handleCountryChange}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{country.flag}</span>
                        <span>{country.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="NYC"
              maxLength={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {warehouse ? "Update" : "Create"} Warehouse
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
