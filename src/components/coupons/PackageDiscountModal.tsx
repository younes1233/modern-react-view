
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";

interface PackageDiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (packageDiscount: any) => void;
  editingPackage?: any;
}

export const PackageDiscountModal: React.FC<PackageDiscountModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingPackage
}) => {
  const [formData, setFormData] = useState({
    name: editingPackage?.name || '',
    description: editingPackage?.description || '',
    discountType: editingPackage?.discountType || 'percentage',
    discountValue: editingPackage?.discountValue || 0,
    minQuantity: editingPackage?.minQuantity || 2,
    maxQuantity: editingPackage?.maxQuantity || 10,
    applicableProducts: editingPackage?.applicableProducts || [],
    applicableCategories: editingPackage?.applicableCategories || [],
    isActive: editingPackage?.isActive !== false,
    validUntil: editingPackage?.validUntil || ''
  });

  const [newProduct, setNewProduct] = useState('');
  const [newCategory, setNewCategory] = useState('');

  const handleSave = () => {
    const packageData = {
      id: editingPackage?.id || Date.now().toString(),
      ...formData,
      createdAt: editingPackage?.createdAt || new Date(),
      updatedAt: new Date()
    };
    onSave(packageData);
    onClose();
  };

  const addProduct = () => {
    if (newProduct.trim()) {
      setFormData({
        ...formData,
        applicableProducts: [...formData.applicableProducts, newProduct.trim()]
      });
      setNewProduct('');
    }
  };

  const addCategory = () => {
    if (newCategory.trim()) {
      setFormData({
        ...formData,
        applicableCategories: [...formData.applicableCategories, newCategory.trim()]
      });
      setNewCategory('');
    }
  };

  const removeProduct = (index: number) => {
    setFormData({
      ...formData,
      applicableProducts: formData.applicableProducts.filter((_, i) => i !== index)
    });
  };

  const removeCategory = (index: number) => {
    setFormData({
      ...formData,
      applicableCategories: formData.applicableCategories.filter((_, i) => i !== index)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingPackage ? 'Edit' : 'Create'} Package Discount</DialogTitle>
          <DialogDescription>
            Set up bulk purchase discounts for multiple items
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Package Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bundle Deal"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discountType">Discount Type</Label>
              <Select value={formData.discountType} onValueChange={(value) => setFormData({ ...formData, discountType: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="buy_x_get_y">Buy X Get Y</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Description of the package discount"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="discountValue">
                {formData.discountType === 'percentage' ? 'Percentage (%)' : 'Amount ($)'}
              </Label>
              <Input
                id="discountValue"
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                placeholder={formData.discountType === 'percentage' ? '15' : '50'}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minQuantity">Min Quantity</Label>
              <Input
                id="minQuantity"
                type="number"
                value={formData.minQuantity}
                onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                placeholder="2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxQuantity">Max Quantity</Label>
              <Input
                id="maxQuantity"
                type="number"
                value={formData.maxQuantity}
                onChange={(e) => setFormData({ ...formData, maxQuantity: Number(e.target.value) })}
                placeholder="10"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Applicable Products</Label>
              <div className="flex gap-2">
                <Input
                  value={newProduct}
                  onChange={(e) => setNewProduct(e.target.value)}
                  placeholder="Enter product name or ID"
                />
                <Button onClick={addProduct} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.applicableProducts.map((product, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {product}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeProduct(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Applicable Categories</Label>
              <div className="flex gap-2">
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Enter category name"
                />
                <Button onClick={addCategory} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.applicableCategories.map((category, index) => (
                  <Badge key={index} variant="outline" className="flex items-center gap-1">
                    {category}
                    <X 
                      className="w-3 h-3 cursor-pointer" 
                      onClick={() => removeCategory(index)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validUntil">Valid Until</Label>
              <Input
                id="validUntil"
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="active">Activate package discount</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingPackage ? 'Update' : 'Create'} Package
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
