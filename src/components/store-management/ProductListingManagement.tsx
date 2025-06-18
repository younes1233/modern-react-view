
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProductListingModal } from "./ProductListingModal";
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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
import { 
  getProductListings, 
  addProductListing, 
  updateProductListing, 
  deleteProductListing,
  ProductListing,
  getProductsForListing
} from "@/data/storeData";

export function ProductListingManagement() {
  const [productListings, setProductListings] = useState<ProductListing[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedListing, setSelectedListing] = useState<ProductListing | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setProductListings(getProductListings());
  }, []);

  const refreshListings = () => {
    setProductListings(getProductListings());
  };

  const handleAddListing = () => {
    setModalMode('add');
    setSelectedListing(null);
    setIsModalOpen(true);
  };

  const handleEditListing = (listing: ProductListing) => {
    setModalMode('edit');
    setSelectedListing(listing);
    setIsModalOpen(true);
  };

  const handleSaveListing = (listingData: Omit<ProductListing, 'id'>) => {
    if (modalMode === 'add') {
      addProductListing(listingData);
    } else if (selectedListing) {
      updateProductListing(selectedListing.id, listingData);
    }
    
    refreshListings();
    toast({
      title: "Success",
      description: `Product listing ${modalMode === 'add' ? 'added' : 'updated'} successfully`
    });
  };

  const handleDeleteListing = (listingId: number) => {
    deleteProductListing(listingId);
    refreshListings();
    toast({
      title: "Success",
      description: "Product listing deleted successfully"
    });
  };

  const handleToggleActive = (listingId: number) => {
    const listing = productListings.find(l => l.id === listingId);
    if (listing) {
      updateProductListing(listingId, { isActive: !listing.isActive });
      refreshListings();
      toast({
        title: "Success",
        description: "Listing status updated"
      });
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Product Listings</h2>
          <p className="text-gray-600 dark:text-gray-400">Create and manage product sections for your store</p>
        </div>
        <Button onClick={handleAddListing} className="gap-2">
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
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Products</th>
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Layout</th>
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                  <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {productListings.map((listing) => {
                  const products = getProductsForListing(listing);
                  return (
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
                        <span className="text-sm text-gray-600">
                          {products.length} / {listing.maxProducts} max
                        </span>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{listing.layout}</Badge>
                      </td>
                      <td className="p-4">
                        <Badge variant={listing.isActive ? "default" : "secondary"}>
                          {listing.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleToggleActive(listing.id)}
                            title={listing.isActive ? "Deactivate" : "Activate"}
                          >
                            {listing.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditListing(listing)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
                  );
                })}
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
