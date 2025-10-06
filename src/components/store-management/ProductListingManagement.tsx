
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductListingModal } from "./ProductListingModal";
import { Plus, Edit, Trash2, Eye, EyeOff, Package, Star, Zap, Percent, Folder, Cog } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useProductListings } from "@/hooks/useProductListings";
import { ProductListingAPI, CreateProductListingRequest, UpdateProductListingRequest } from "@/services/productListingService";

export function ProductListingManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedListing, setSelectedListing] = useState<ProductListingAPI | null>(null);
  
  const {
    productListings,
    isLoading,
    createProductListing,
    updateProductListing,
    deleteProductListing,
    isCreating,
    isUpdating,
    isDeleting
  } = useProductListings();

  const handleAddListing = () => {
    setModalMode('add');
    setSelectedListing(null);
    setIsModalOpen(true);
  };

  const handleEditListing = (listing: ProductListingAPI) => {
    setModalMode('edit');
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleSaveListing = async (listingData: CreateProductListingRequest | UpdateProductListingRequest) => {
    try {
      if (modalMode === 'add') {
        await createProductListing(listingData as CreateProductListingRequest);
      } else if (selectedListing) {
        await updateProductListing({ 
          id: selectedListing.id, 
          data: listingData as UpdateProductListingRequest 
        });
      }
      setIsModalOpen(false);
    } catch (error) {
      console.error('Failed to save listing:', error);
    }
  };

  const handleDeleteListing = async (listingId: number) => {
    try {
      await deleteProductListing(listingId);
    } catch (error) {
      console.error('Failed to delete listing:', error);
    }
  };

  const handleToggleActive = async (listing: ProductListingAPI) => {
    try {
      await updateProductListing({ 
        id: listing.id, 
        data: { is_active: !listing.is_active } 
      });
    } catch (error) {
      console.error('Failed to toggle listing status:', error);
    }
  };

  const getDisplayName = (type: string) => {
    switch(type) {
      case 'new_arrivals': return 'New Arrivals';
      case 'on_sales': return 'On Sale';
      case 'featured': return 'Featured';
      case 'category': return 'Category';
      case 'custom': return 'Custom';
      default: return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };

  const getListingTitle = (listing: any) => {
    if (listing.type === 'category' && listing.category) {
      return `Category: ${listing.category.name}`;
    }

    if (listing.title) {
      return listing.title;
    }

    return getDisplayName(listing.type);
  };

  const getTypeIcon = (type: string) => {
    const iconMap = {
      featured: Star,
      newArrivals: Zap,
      sale: Percent,
      category: Folder,
      custom: Cog
    };
    const IconComponent = iconMap[type as keyof typeof iconMap] || Package;
    return IconComponent;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      featured: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      new_arrivals: "bg-green-100 text-green-800 hover:bg-green-200",
      on_sales: "bg-red-100 text-red-800 hover:bg-red-200",
      category: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      custom: "bg-orange-100 text-orange-800 hover:bg-orange-200"
    };

    return (
      <Badge className={variants[type as keyof typeof variants]}>
        {type === 'featured' && <Star className="w-3 h-3 mr-1" />}
        {type === 'new_arrivals' && <Zap className="w-3 h-3 mr-1" />}
        {type === 'on_sales' && <Percent className="w-3 h-3 mr-1" />}
        {type === 'category' && <Folder className="w-3 h-3 mr-1" />}
        {type === 'custom' && <Cog className="w-3 h-3 mr-1" />}
        {getDisplayName(type)}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="ml-4 text-gray-600">Loading product listings...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Product Listings</h2>
          <p className="text-gray-600 dark:text-gray-400">Create and manage product sections for your store</p>
        </div>
        <Button onClick={handleAddListing} className="gap-2" disabled={isCreating}>
          <Plus className="w-4 h-4" />
          Add Product Listing
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Listings ({productListings.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                <tr className="text-left">
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Listing</th>
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Type</th>
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Preview</th>
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productListings.map((listing) => (
                  <tr key={listing.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${
                          listing.type === 'featured' ? 'bg-blue-500/10' :
                          listing.type === 'newArrivals' ? 'bg-green-500/10' :
                          listing.type === 'sale' ? 'bg-red-500/10' :
                          listing.type === 'category' ? 'bg-purple-500/10' :
                          'bg-orange-500/10'
                        }`}>
                          {listing.type === 'featured' && <Star className="w-6 h-6 text-blue-600" />}
                          {listing.type === 'newArrivals' && <Zap className="w-6 h-6 text-green-600" />}
                          {listing.type === 'sale' && <Percent className="w-6 h-6 text-red-600" />}
                          {listing.type === 'category' && <Folder className="w-6 h-6 text-purple-600" />}
                          {listing.type === 'custom' && <Cog className="w-6 h-6 text-orange-600" />}
                          {!['featured', 'newArrivals', 'sale', 'category', 'custom'].includes(listing.type) && <Package className="w-6 h-6 text-gray-600" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base">
                            {getListingTitle(listing)}
                          </h3>
                          {listing.subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{listing.subtitle}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-gray-500">Max: {listing.max_products} products</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {getTypeBadge(listing.type)}
                    </td>
                    <td className="p-4">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded p-2 w-16">
                        <div className="space-y-1">
                          {listing.layout === 'grid' && (
                            <div className="grid grid-cols-2 gap-0.5">
                              {Array.from({ length: Math.min(listing.max_products, 4) }).map((_, i) => (
                                <div key={i} className="aspect-square bg-gray-300 rounded-sm"></div>
                              ))}
                            </div>
                          )}
                          {listing.layout === 'slider' && (
                            <div className="flex gap-0.5 overflow-hidden">
                              {Array.from({ length: Math.min(listing.max_products, 3) }).map((_, i) => (
                                <div key={i} className="w-4 h-4 bg-gray-300 rounded-sm flex-shrink-0"></div>
                              ))}
                              <div className="w-2 h-4 bg-gray-200 rounded-sm opacity-50"></div>
                            </div>
                          )}
                          {/* No list or carousel layout in current types */}
                          <div className="text-xs text-gray-500 text-center truncate">
                            {listing.layout}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditListing(listing)}
                          disabled={isUpdating}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              disabled={isDeleting}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Product Listing</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{listing.title}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteListing(listing.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <ProductListingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveListing}
        listing={selectedListing}
        mode={modalMode}
      />
    </div>
  );
}
