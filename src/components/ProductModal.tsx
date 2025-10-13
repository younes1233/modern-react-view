import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "@/components/ui/file-upload";
import { toast } from '@/components/ui/sonner';
import { useFlatCategories } from "@/hooks/useCategories";
import { Plus, X, Star } from "lucide-react";

interface ProductThumbnail {
  id: number;
  url: string;
  alt: string;
}

interface ProductVariation {
  id: number;
  type: string;
  value: string;
  priceAdjustment?: number;
  inStock: boolean;
}

interface Product {
  id?: number;
  name: string;
  slug: string;
  category: string;
  price: number;
  stock: number;
  status: string;
  sku: string;
  description?: string;
  image: string;
  thumbnails: ProductThumbnail[];
  variations: ProductVariation[];
  rating: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  inStock: boolean;
  weight?: string;
  height?: string;
  width?: string;
  length?: string;
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
  product?: Product | null;
  mode: 'add' | 'edit';
}

export function ProductModal({ isOpen, onClose, onSave, product, mode }: ProductModalProps) {
  const [formData, setFormData] = useState<Product>({
    name: '',
    slug: '',
    category: '',
    price: 0,
    stock: 0,
    status: 'active',
    sku: '',
    description: '',
    image: '',
    thumbnails: [],
    variations: [],
    rating: 5,
    isFeatured: false,
    isNewArrival: false,
    inStock: true,
    weight: '29 kg',
    height: '66 cm',
    width: '66 cm',
    length: '66 cm'
  });
  
  const [newThumbnail, setNewThumbnail] = useState({ url: '', alt: '' });
  const [newVariation, setNewVariation] = useState({ type: '', value: '', priceAdjustment: 0, inStock: true });
  // Removed useToast hook;
  const { data: categories = [], isLoading: categoriesLoading } = useFlatCategories();

  useEffect(() => {
    if (product && mode === 'edit') {
      setFormData(product);
    } else {
      setFormData({
        name: '',
        slug: '',
        category: '',
        price: 0,
        stock: 0,
        status: 'active',
        sku: '',
        description: '',
        image: '',
        thumbnails: [],
        variations: [],
        rating: 5,
        isFeatured: false,
        isNewArrival: false,
        inStock: true,
        weight: '29 kg',
        height: '66 cm',
        width: '66 cm',
        length: '66 cm'
      });
    }
  }, [product, mode, isOpen]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }));
  };

  const addThumbnail = () => {
    if (newThumbnail.url && newThumbnail.alt) {
      setFormData(prev => ({
        ...prev,
        thumbnails: [...prev.thumbnails, { ...newThumbnail, id: Date.now() }]
      }));
      setNewThumbnail({ url: '', alt: '' });
    }
  };

  const removeThumbnail = (id: number) => {
    setFormData(prev => ({
      ...prev,
      thumbnails: prev.thumbnails.filter(t => t.id !== id)
    }));
  };

  const addVariation = () => {
    if (newVariation.type && newVariation.value) {
      setFormData(prev => ({
        ...prev,
        variations: [...prev.variations, { ...newVariation, id: Date.now() }]
      }));
      setNewVariation({ type: '', value: '', priceAdjustment: 0, inStock: true });
    }
  };

  const removeVariation = (id: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter(v => v.id !== id)
    }));
  };

  const handleImageUpload = (files: File[]) => {
    // Convert files to URLs for preview (in real app, upload to server)
    const urls = files.map(file => URL.createObjectURL(file));
    if (urls.length > 0) {
      setFormData(prev => ({ ...prev, image: urls[0] }));
    }
  };

  const handleThumbnailUpload = (files: File[]) => {
    // Convert files to thumbnails (in real app, upload to server)
    const newThumbnails = files.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      alt: file.name
    }));
    setFormData(prev => ({
      ...prev,
      thumbnails: [...prev.thumbnails, ...newThumbnails]
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.sku || !formData.image) {
      toast.error("Please fill in all required fields including main image", { duration: 2500 });
      return;
    }

    onSave(formData);
    onClose();
    
    toast.success(`Product ${mode === 'add' ? 'added' : 'updated'} successfully`, { duration: 2000 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{mode === 'add' ? 'Add New Product' : 'Edit Product'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Enter product name"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">URL Slug *</Label>
                  <Input
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="product-url-slug"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU *</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value }))}
                    placeholder="Enter SKU"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {!categoriesLoading && categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : null}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter product description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing & Inventory */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="price">Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) || 5 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-4 pt-8">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
                      className="rounded"
                    />
                    <span>Featured Product</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData(prev => ({ ...prev, isNewArrival: e.target.checked }))}
                      className="rounded"
                    />
                    <span>New Arrival</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Physical Dimensions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Physical Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Weight</Label>
                  <Input
                    id="weight"
                    value={formData.weight || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="e.g., 29 kg"
                  />
                </div>
                
                <div>
                  <Label htmlFor="height">Height</Label>
                  <Input
                    id="height"
                    value={formData.height || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, height: e.target.value }))}
                    placeholder="e.g., 66 cm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="width">Width</Label>
                  <Input
                    id="width"
                    value={formData.width || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, width: e.target.value }))}
                    placeholder="e.g., 66 cm"
                  />
                </div>
                
                <div>
                  <Label htmlFor="length">Length</Label>
                  <Input
                    id="length"
                    value={formData.length || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, length: e.target.value }))}
                    placeholder="e.g., 66 cm"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Images</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Main Product Image *</Label>
                <FileUpload
                  onFileSelect={handleImageUpload}
                  maxFiles={1}
                  placeholder="Upload main product image"
                  className="mt-2"
                />
                {formData.image && (
                  <div className="mt-4">
                    <img 
                      src={formData.image} 
                      alt="Main product" 
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                  </div>
                )}
              </div>

              <div>
                <Label>Additional Images</Label>
                <FileUpload
                  onFileSelect={handleThumbnailUpload}
                  maxFiles={5}
                  placeholder="Upload additional product images"
                  className="mt-2"
                />
                
                {formData.thumbnails.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {formData.thumbnails.map((thumbnail) => (
                      <div key={thumbnail.id} className="relative group">
                        <img 
                          src={thumbnail.url} 
                          alt={thumbnail.alt}
                          className="w-full h-24 object-cover rounded-lg border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeThumbnail(thumbnail.id)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Product Variations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Product Variations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2">
                <Select value={newVariation.type} onValueChange={(value) => setNewVariation(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                    <SelectItem value="material">Material</SelectItem>
                    <SelectItem value="style">Style</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Value (e.g., Red, XL)"
                  value={newVariation.value}
                  onChange={(e) => setNewVariation(prev => ({ ...prev, value: e.target.value }))}
                />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="Price adjustment"
                  value={newVariation.priceAdjustment}
                  onChange={(e) => setNewVariation(prev => ({ ...prev, priceAdjustment: parseFloat(e.target.value) || 0 }))}
                />
                <Button type="button" onClick={addVariation} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              
              {formData.variations.length > 0 && (
                <div className="space-y-2">
                  {formData.variations.map((variation) => (
                    <div key={variation.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{variation.type}</Badge>
                        <span>{variation.value}</span>
                        {variation.priceAdjustment !== 0 && (
                          <span className="text-sm text-gray-500">
                            ({variation.priceAdjustment > 0 ? '+' : ''}${variation.priceAdjustment})
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeVariation(variation.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {mode === 'add' ? 'Add Product' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
