
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductListingModal } from "./ProductListingModal";
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from "lucide-react";
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

  const getTypeBadge = (type: string) => {
    const variants = {
      featured: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      newArrivals: "bg-green-100 text-green-800 hover:bg-green-200",
      sale: "bg-red-100 text-red-800 hover:bg-red-200",
      category: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      custom: "bg-orange-100 text-orange-800 hover:bg-orange-200"
    };
    return (
      <Badge className={variants[type as keyof typeof variants]}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
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
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Max Products</th>
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Layout</th>
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productListings.map((listing) => (
                  <tr key={listing.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-900 dark:text-gray-100">{listing.title}</span>
                          {listing.subtitle && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">{listing.subtitle}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{getTypeBadge(listing.type)}</td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{listing.max_products}</span>
                    </td>
                    <td className="p-4">
                      <Badge variant="outline">{listing.layout}</Badge>
                    </td>
                    <td className="p-4">
                      <Badge variant={listing.is_active ? "default" : "secondary"}>
                        {listing.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleToggleActive(listing)}
                          disabled={isUpdating}
                          title={listing.is_active ? "Deactivate" : "Activate"}
                        >
                          {listing.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
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
