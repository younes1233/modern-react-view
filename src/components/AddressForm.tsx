import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SearchableDropdown, SearchableDropdownOption } from "@/components/ui/searchable-dropdown";
import { addressService, Address, CreateAddressRequest } from "@/services/addressService";
import { deliveryZoneService, DeliveryZone } from "@/services/deliveryZoneService";
import { toast } from '@/components/ui/sonner';
import { useAuth } from "@/contexts/AuthContext";

// Country codes data
const COUNTRY_CODES = [
  { code: "+961", country: "Lebanon", flag: "🇱🇧" },
  { code: "+1", country: "United States", flag: "🇺🇸" },
  { code: "+44", country: "United Kingdom", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+966", country: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+962", country: "Jordan", flag: "🇯🇴" },
  { code: "+20", country: "Egypt", flag: "🇪🇬" },
  { code: "+90", country: "Turkey", flag: "🇹🇷" },
  { code: "+33", country: "France", flag: "🇫🇷" },
  { code: "+49", country: "Germany", flag: "🇩🇪" },
  { code: "+39", country: "Italy", flag: "🇮🇹" },
  { code: "+34", country: "Spain", flag: "🇪🇸" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+91", country: "India", flag: "🇮🇳" },
  { code: "+81", country: "Japan", flag: "🇯🇵" },
  { code: "+82", country: "South Korea", flag: "🇰🇷" },
  { code: "+61", country: "Australia", flag: "🇦🇺" },
  { code: "+55", country: "Brazil", flag: "🇧🇷" },
  { code: "+7", country: "Russia", flag: "🇷🇺" },
  { code: "+27", country: "South Africa", flag: "🇿🇦" },
];

interface AddressFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address?: Address;
  onSuccess: () => void;
  inline?: boolean;
}

const AddressForm = ({ open, onOpenChange, address, onSuccess, inline = false }: AddressFormProps) => {
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
  const [isFirstAddress, setIsFirstAddress] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState("+961"); // Default to Lebanon
  const [phoneNumber, setPhoneNumber] = useState("");
  // Removed useToast hook;
  const { user } = useAuth();

  const [formData, setFormData] = useState<CreateAddressRequest>({
    type: "home",
    address: "",
    additional_address_details: "",
    phone: user?.phone || "",
    delivery_zone_id: undefined,
    is_default: false,
  });

  // Fetch delivery zones
  useEffect(() => {
    const fetchDeliveryZones = async () => {
      try {
        // Default to country ID 1, or use user's country if available
        const countryId = 1; // You can get this from user context or settings
        const zones = await deliveryZoneService.getDeliveryZones(countryId);
        setDeliveryZones(zones);
      } catch (error) {
        console.error('Failed to fetch delivery zones:', error);
      }
    };

    if (open) {
      fetchDeliveryZones();
    }
  }, [open]);

  // Check if this is the user's first address
  useEffect(() => {
    const checkFirstAddress = async () => {
      if (!address) {
        try {
          const addresses = await addressService.getAddresses();
          setIsFirstAddress(!addresses || addresses.length === 0);
        } catch (error) {
          setIsFirstAddress(true);
        }
      }
    };

    if (open) {
      checkFirstAddress();
    }
  }, [open, address]);

  useEffect(() => {
    if (address) {
      // Parse existing phone number
      const phone = address.phone || user?.phone || "";
      parsePhoneNumber(phone);

      setFormData({
        type: address.type || "home",
        address: address.address,
        additional_address_details: "",
        phone: phone,
        delivery_zone_id: address.delivery_zone?.id,
        is_default: address.is_default,
      });
    } else {
      // Parse user's phone number if available
      const phone = user?.phone || "";
      parsePhoneNumber(phone);

      setFormData({
        type: "home",
        address: "",
        additional_address_details: "",
        phone: phone,
        delivery_zone_id: undefined,
        is_default: isFirstAddress,
      });
    }
    setValidationErrors({});
  }, [address, open, user, isFirstAddress]);

  // Parse phone number to extract country code and number
  const parsePhoneNumber = (phone: string) => {
    if (!phone) {
      setSelectedCountryCode("+961");
      setPhoneNumber("");
      return;
    }

    // Try to match with known country codes
    const matchedCountry = COUNTRY_CODES.find(c => phone.startsWith(c.code));
    if (matchedCountry) {
      setSelectedCountryCode(matchedCountry.code);
      setPhoneNumber(phone.substring(matchedCountry.code.length).trim());
    } else {
      // Default to Lebanon if no match
      setSelectedCountryCode("+961");
      setPhoneNumber(phone);
    }
  };

  // Update formData.phone when country code or phone number changes
  useEffect(() => {
    const fullPhone = phoneNumber ? `${selectedCountryCode}${phoneNumber}` : "";
    setFormData(prev => ({ ...prev, phone: fullPhone }));
  }, [selectedCountryCode, phoneNumber]);

  // Convert country codes to dropdown options
  const countryCodeOptions: SearchableDropdownOption[] = COUNTRY_CODES.map((country) => ({
    value: country.code,
    label: country.code,
    icon: country.flag,
    subtitle: country.country,
    searchTerms: [country.code.replace('+', ''), country.country],
  }));

  // Convert delivery zones to dropdown options
  const deliveryZoneOptions: SearchableDropdownOption[] = deliveryZones.map((zone) => ({
    value: zone.id.toString(),
    label: zone.name,
  }));

  const renderFieldError = (fieldName: string) => {
    const errors = validationErrors[fieldName];
    if (!errors || errors.length === 0) return null;

    return (
      <div className="validation-error text-red-600 text-sm mt-1" data-field={fieldName}>
        {errors.map((error, index) => (
          <div key={index}>{error}</div>
        ))}
      </div>
    );
  };

  const scrollToFirstError = () => {
    const errorKeys = Object.keys(validationErrors);
    const firstErrorField = errorKeys[0];

    if (firstErrorField) {
      setTimeout(() => {
        const validationError = document.querySelector('.validation-error') as HTMLElement;
        if (validationError) {
          validationError.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 200);
    }
  };

  useEffect(() => {
    if (Object.keys(validationErrors).length > 0) {
      scrollToFirstError();
    }
  }, [validationErrors]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    try {
      setLoading(true);

      // Prepare data with additional_address_details as null
      const submitData = {
        ...formData,
        additional_address_details: null,
      };

      if (address) {
        await addressService.updateAddress(address.id, submitData);
        toast.success("Address updated successfully", { duration: 2000 });
      } else {
        await addressService.createAddress(submitData);
        toast.success("Address created successfully", { duration: 2000 });
      }
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        toast.error(error.message || "Failed to save address", { duration: 2500 });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: keyof CreateAddressRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formContent = (
    <form onSubmit={handleSubmit} className={inline ? "space-y-2 sm:space-y-3" : "space-y-6"}>
      <div className={inline ? "grid grid-cols-1 sm:grid-cols-3 gap-x-3 gap-y-1.5 sm:gap-y-2" : "space-y-4"}>
        {/* Type */}
        <div>
          <Label htmlFor="type" className="text-[11px] sm:text-xs">Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => updateFormData("type", value as any)}
          >
            <SelectTrigger className="h-7 sm:h-8 text-[11px] sm:text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              <SelectItem value="office">Office</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
          {renderFieldError("type")}
        </div>

        {/* Delivery Zone */}
        <div>
          <Label htmlFor="delivery_zone_id" className="text-[11px] sm:text-xs">Delivery Zone *</Label>
          <SearchableDropdown
            options={deliveryZoneOptions}
            value={formData.delivery_zone_id?.toString() || ""}
            onChange={(value) => updateFormData("delivery_zone_id", value ? Number(value) : undefined)}
            placeholder="Select zone"
            noResultsText="No delivery zone found."
          />
          {renderFieldError("delivery_zone_id")}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-[11px] sm:text-xs">Phone Number *</Label>
          <div className="flex gap-1 sm:gap-1.5">
            {/* Country Code Selector */}
            <SearchableDropdown
              options={countryCodeOptions}
              value={selectedCountryCode}
              onChange={setSelectedCountryCode}
              placeholder="Code"
              className="w-[100px] sm:w-[120px] shrink-0"
              dropdownClassName="w-[calc(100vw-2rem)] sm:w-[400px]"
              noResultsText="No country found."
            />

            {/* Phone Number Input */}
            <Input
              id="phone"
              type="tel"
              placeholder="71 123 456"
              className="h-7 sm:h-8 text-[11px] sm:text-xs flex-1 min-w-0"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </div>
          {renderFieldError("phone")}
        </div>

        {/* Address - spans 2 columns on desktop */}
        <div className="sm:col-span-2">
          <Label htmlFor="address" className="text-[11px] sm:text-xs">Address *</Label>
          <Textarea
            id="address"
            placeholder="Building, floor, apartment, street, near landmark..."
            rows={inline ? 2 : 3}
            className="resize-none text-[11px] sm:text-xs min-h-[50px] sm:min-h-[60px] py-1.5"
            value={formData.address}
            onChange={(e) => updateFormData("address", e.target.value)}
          />
          {renderFieldError("address")}
        </div>

        {/* Main Address Toggle - last column on desktop */}
        <div className="flex flex-col justify-end">
          <div className="flex items-center justify-between space-x-2 h-7 sm:h-8">
            <Label htmlFor="is_default" className="text-[11px] sm:text-xs font-medium">
              Main address
            </Label>
            <Switch
              id="is_default"
              checked={formData.is_default}
              onCheckedChange={(checked) => updateFormData("is_default", checked)}
              disabled={isFirstAddress && !address}
              className="scale-75 sm:scale-100"
            />
          </div>
          {isFirstAddress && !address && (
            <p className="text-[9px] sm:text-[10px] text-gray-500 leading-tight mt-1">
              First address is main
            </p>
          )}
        </div>
      </div>

      <div className={inline ? "flex gap-2 pt-0.5 sm:pt-1" : ""}>
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
          disabled={loading}
          className={inline ? "flex-1 h-7 sm:h-8 text-[11px] sm:text-xs" : ""}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className={inline ? "flex-1 h-7 sm:h-8 text-[11px] sm:text-xs bg-cyan-600 hover:bg-cyan-700" : ""}
        >
          {loading ? "Saving..." : address ? "Update" : "Add"}
        </Button>
      </div>
    </form>
  );

  if (inline) {
    return formContent;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{address ? "Edit Address" : "Add New Address"}</DialogTitle>
          <DialogDescription>
            {address ? "Update your delivery address details" : "Add a new delivery address"}
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};

export default AddressForm;