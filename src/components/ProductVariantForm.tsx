import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUpload } from "@/components/ui/file-upload";
import { MultiSelect, MultiSelectOption } from "@/components/ui/multi-select";
import { cn } from "@/lib/utils";

// Types
export interface VariantEntry {
  id: number;
  image: File | string | null;
  imagePreviewUrl?: string;
  variations: number[];
  variantPrices: {
    net_price: string;
    cost: string;
  };
  variantSpecs: { id: number; name: string; value: string }[];
  delivery_type: string;
  delivery_cost: string;
  stock: number;
  shelf_id?: number;
}

export interface Attribute {
  id: number;
  name: string;
  type: string;
  values: Array<{
    id: number;
    value: string;
    hex_color?: string;
  }>;
}

export interface Shelf {
  id: number;
  name: string;
}

interface ProductVariantFormProps {
  variant: VariantEntry;
  mode: "add" | "edit";
  attributes: Attribute[];
  attributesLoading: boolean;
  shelves: Shelf[];
  formData: {
    delivery_type?: string;
    delivery_cost?: string | number;
    shelf_id?: number;
  };
  DELIVERY_TYPES: Array<{ value: string; label: string }>;
  onRemove: (variantId: number) => void;
  onUpdateField: (variantId: number, field: string, value: any) => void;
  onUpdatePrice: (variantId: number, field: string, value: string) => void;
  onUpdateSpec: (variantId: number, index: number, field: string, value: string) => void;
  onAddSpec: (variantId: number) => void;
  onRemoveSpec: (variantId: number, index: number) => void;
  onUpdateVariations: (variantId: number, variations: number[]) => void;
}

export const ProductVariantForm: React.FC<ProductVariantFormProps> = ({
  variant,
  mode,
  attributes,
  attributesLoading,
  shelves,
  formData,
  DELIVERY_TYPES,
  onRemove,
  onUpdateField,
  onUpdatePrice,
  onUpdateSpec,
  onAddSpec,
  onRemoveSpec,
  onUpdateVariations,
}) => {
  return (
    <div className="border p-4 rounded space-y-2">
      <div className="flex justify-between items-center mb-2">
        <Label>Variant</Label>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={() => onRemove(variant.id)}
        >
          Remove
        </Button>
      </div>

      {/* Variant image */}
      <div>
        <Label>Variant Image</Label>
        <FileUpload
          onFileSelect={(files) => {
            if (files.length > 0) {
              const file = files[0];
              const url = URL.createObjectURL(file);
              onUpdateField(variant.id, 'image', file);
              onUpdateField(variant.id, 'imagePreviewUrl', url);
            }
          }}
          accept="image/*"
        />
        {(() => {
          const v = variant as any;
          const previewUrl = v.imagePreviewUrl || (typeof v.image === 'string' ? v.image : '');
          return previewUrl ? (
            <div className="mt-2">
              <img src={previewUrl} alt="Variant" className="w-32 h-32 object-cover rounded" />
            </div>
          ) : null;
        })()}
      </div>

      {/* Variant variations */}
      <div>
        <Label>Attribute Values *</Label>
        {attributesLoading ? (
          <div className="text-muted-foreground mt-2">Loading attributes...</div>
        ) : attributes.length === 0 ? (
          <div className="text-muted-foreground mt-2">No attributes available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
            {attributes.map((attribute) => {
              const attributeOptions: MultiSelectOption[] = attribute.values.map((value: any) => ({
                id: value.id,
                label: value.value,
                value: value.value.toLowerCase(),
                color: value.hex_color || undefined
              }));

              // Find the currently selected value for this attribute
              const selectedAttributeValue = variant.variations.find(varId =>
                attribute.values.some((val: any) => val.id === varId)
              ) || null;

              return (
                <div key={attribute.id} className="space-y-2">
                  <Label className="text-sm font-medium">{attribute.name} ({attribute.type})</Label>
                  <MultiSelect
                    options={attributeOptions}
                    selected={selectedAttributeValue}
                    onSelectionChange={(selected) => {
                      // Remove any existing values for this attribute
                      const otherAttributeValues = variant.variations.filter(varId =>
                        !attribute.values.some((val: any) => val.id === varId)
                      );

                      // Add the new selected value (if any)
                      const newVariations = selected
                        ? [...otherAttributeValues, selected as number]
                        : otherAttributeValues;

                      onUpdateVariations(variant.id, newVariations);
                    }}
                    placeholder={`Select ${attribute.name.toLowerCase()}...`}
                    searchPlaceholder={`Search ${attribute.name.toLowerCase()}...`}
                  />
                </div>
              );
            })}
          </div>
        )}
        {variant.variations.length > 0 && (
          <div className="mt-3 p-2 bg-muted/50 rounded-md">
            <div className="text-xs text-muted-foreground">Selected attribute values: {variant.variations.join(', ')}</div>
          </div>
        )}
      </div>

      {/* Variant Pricing Overrides */}
      <div className="space-y-2">
        <Label>Variant Prices (overrides)</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Cost Price</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={variant.variantPrices.cost}
              onChange={(e) => onUpdatePrice(variant.id, 'cost', e.target.value)}
              placeholder="Cost (optional)"
            />
          </div>
          <div>
            <Label>Net Price</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={variant.variantPrices.net_price}
              onChange={(e) => onUpdatePrice(variant.id, 'net_price', e.target.value)}
              placeholder="Net Price (optional)"
            />
          </div>
        </div>
        {variant.variantPrices.net_price && variant.variantPrices.cost && parseFloat(variant.variantPrices.net_price) < parseFloat(variant.variantPrices.cost) && (
          <p className="text-sm text-red-600">Net price cannot be less than cost price</p>
        )}
      </div>

      {/* Variant Specs Overrides */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <Label>Variant Specifications (overrides)</Label>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="hover:bg-primary hover:text-primary-foreground transition-all duration-200 active:scale-95 hover:shadow-md"
            onClick={() => onAddSpec(variant.id)}
          >
            Add Specification
          </Button>
        </div>
        {variant.variantSpecs.map((spec, idx) => (
          <div key={idx} className="grid grid-cols-3 gap-2 items-center">
            <Input
              type="text"
              value={spec.name}
              onChange={(e) => onUpdateSpec(variant.id, idx, 'name', e.target.value)}
              placeholder="Name"
            />
            <Input
              type="text"
              value={spec.value}
              onChange={(e) => onUpdateSpec(variant.id, idx, 'value', e.target.value)}
              placeholder="Value"
            />
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => onRemoveSpec(variant.id, idx)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* Variant inventory and delivery overrides */}
      <div className={cn(
        "grid gap-4",
        mode === 'add' ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-2 lg:grid-cols-3"
      )}>
        <div>
          <Label>Stock *</Label>
          <Input
            type="number"
            value={variant.stock || ''}
            onChange={(e) => onUpdateField(variant.id, 'stock', parseInt(e.target.value) || 0)}
            placeholder="Stock quantity"
            required
          />
        </div>

        {/* Only show shelf override in create mode */}
        {mode === 'add' && (
          <div>
            <Label>Shelf (override)</Label>
            <Select
              value={variant.shelf_id ? String(variant.shelf_id) : "inherit"}
              onValueChange={(value) => onUpdateField(variant.id, 'shelf_id', value === "inherit" ? undefined : parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue>
                  {variant.shelf_id
                    ? shelves.find((s) => s.id === variant.shelf_id)?.name || "Unknown shelf"
                    : formData.shelf_id
                      ? `Use main: ${shelves.find((s) => s.id === formData.shelf_id)?.name || "No shelf"}`
                      : "Use main: No shelf"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inherit">Use main product shelf</SelectItem>
                <SelectItem value="0">No shelf</SelectItem>
                {shelves.map((shelf) => (
                  <SelectItem key={shelf.id} value={String(shelf.id)}>
                    {shelf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label>Delivery Type (override)</Label>
          <Select
            value={variant.delivery_type || ''}
            onValueChange={(value) => onUpdateField(variant.id, 'delivery_type', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select delivery method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="inherit">Use main product delivery method</SelectItem>
              {DELIVERY_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>
            Delivery Cost {
              (variant.delivery_type === 'meemhome' || (!variant.delivery_type && formData.delivery_type === 'meemhome'))
              ? '*'
              : ''
            }
          </Label>
          <Input
            type="number"
            value={
              (!variant.delivery_type || variant.delivery_type === 'inherit')
                ? formData.delivery_cost || ''
                : variant.delivery_cost || ''
            }
            onChange={(e) => onUpdateField(variant.id, 'delivery_cost', e.target.value)}
            placeholder={
              (!variant.delivery_type || variant.delivery_type === 'inherit')
                ? `Use main product cost: ${formData.delivery_cost || '0'}`
                : "Delivery Cost"
            }
            disabled={
              (!variant.delivery_type || variant.delivery_type === 'inherit') ||
              variant.delivery_type === 'company' ||
              (!variant.delivery_type && formData.delivery_type === 'company')
            }
            required={variant.delivery_type === 'meemhome' || (!variant.delivery_type && formData.delivery_type === 'meemhome')}
          />
          {(!variant.delivery_type || variant.delivery_type === 'inherit') && (
            <div className="text-xs text-muted-foreground mt-1">
              Use main product delivery cost: {formData.delivery_cost || '0'}
            </div>
          )}
          {(variant.delivery_type === 'company' || (!variant.delivery_type && formData.delivery_type === 'company')) && (
            <div className="text-xs text-muted-foreground mt-1">Delivery cost is handled by the delivery company</div>
          )}
        </div>
      </div>
    </div>
  );
};