
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown, Image, Package } from "lucide-react";
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
import { useBanners, Banner } from "@/hooks/useBanners";
import { useProductListings } from "@/hooks/useProductListings";
import { 
  useHomeSections, 
  useCreateHomeSection, 
  useUpdateHomeSection, 
  useDeleteHomeSection, 
  useReorderHomeSections 
} from "@/hooks/useHomeSections";

export function LayoutManagement() {
  const { toast } = useToast();
  
  const { data: homeSections = [], isLoading: homeSectionsLoading } = useHomeSections();
  const { banners, isLoading: bannersLoading } = useBanners();
  const { productListings, isLoading: listingsLoading } = useProductListings();
  
  const createHomeSection = useCreateHomeSection();
  const updateHomeSection = useUpdateHomeSection();
  const deleteHomeSection = useDeleteHomeSection();
  const reorderHomeSections = useReorderHomeSections();

  const getSectionItem = (section: any) => {
    if (section.type === 'banner') {
      return banners.find(b => b.id === section.item_id) || section.item;
    } else {
      return productListings.find(p => p.id === section.item_id) || section.item;
    }
  };

  const handleToggleActive = (sectionId: number) => {
    const section = homeSections.find(s => s.id === sectionId);
    if (section) {
      updateHomeSection.mutate({
        id: sectionId,
        data: { is_active: !section.is_active }
      });
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const newOrder = [...homeSections];
      [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
      const orderIds = newOrder.map(s => s.id);
      reorderHomeSections.mutate(orderIds);
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < homeSections.length - 1) {
      const newOrder = [...homeSections];
      [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
      const orderIds = newOrder.map(s => s.id);
      reorderHomeSections.mutate(orderIds);
    }
  };

  const handleDeleteSection = (sectionId: number) => {
    deleteHomeSection.mutate(sectionId);
  };

  const handleAddBannerSection = (bannerId: number) => {
    createHomeSection.mutate({
      type: 'banner',
      item_id: bannerId,
      is_active: true
    });
  };

  const handleAddProductSection = (listingId: number) => {
    createHomeSection.mutate({
      type: 'productListing',
      item_id: listingId,
      is_active: true
    });
  };

  const getTypeBadge = (type: string) => {
    return type === 'banner' ? (
      <Badge className="bg-blue-100 text-blue-800">
        <Image className="w-3 h-3 mr-1" />
        Banner
      </Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">
        <Package className="w-3 h-3 mr-1" />
        Products
      </Badge>
    );
  };

  const availableBanners = banners.filter(b => b.isActive && !homeSections.some(s => s.type === 'banner' && s.item_id === b.id));
  const availableListings = productListings.filter(p => p.is_active && !homeSections.some(s => s.type === 'productListing' && s.item_id === p.id));

  if (bannersLoading || listingsLoading || homeSectionsLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <p className="ml-4 text-gray-600">Loading layout data...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Home Page Layout</h2>
          <p className="text-gray-600 dark:text-gray-400">Manage the order and visibility of sections on your store's home page</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Layout */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Current Home Page Layout ({homeSections.length} sections)</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                    <tr className="text-left">
                      <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Order</th>
                      <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Section</th>
                      <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Type</th>
                      <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                      <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {homeSections.map((section, index) => {
                      const item = getSectionItem(section);
                      return (
                        <tr key={section.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <GripVertical className="w-4 h-4 text-gray-400" />
                              <div className="flex flex-col gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveUp(index)}
                                  disabled={index === 0}
                                  className="h-6 w-6 p-0"
                                >
                                  <ArrowUp className="w-3 h-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleMoveDown(index)}
                                  disabled={index === homeSections.length - 1}
                                  className="h-6 w-6 p-0"
                                >
                                  <ArrowDown className="w-3 h-3" />
                                </Button>
                              </div>
                              <span className="font-medium">{section.order}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              {item && (
                                <>
                                  <img 
                                    src={section.type === 'banner' ? (item as Banner).image : '/placeholder.svg'} 
                                    alt={(item as any).title} 
                                    className="w-16 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 object-cover" 
                                  />
                                  <div>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                      {(item as any).title}
                                    </span>
                                    {(item as any).subtitle && (
                                      <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {(item as any).subtitle}
                                      </p>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </td>
                          <td className="p-4">{getTypeBadge(section.type)}</td>
                          <td className="p-4">
                            <Badge variant={section.is_active ? "default" : "secondary"}>
                              {section.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => handleToggleActive(section.id)}
                                title={section.is_active ? "Hide" : "Show"}
                              >
                                {section.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove Section</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to remove this section from the home page?
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteSection(section.id)}>
                                      Remove
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
        </div>

        {/* Available Sections */}
        <div className="space-y-4">
          {/* Available Banners */}
          {availableBanners.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Banners</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableBanners.map((banner) => (
                  <div key={banner.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <img src={banner.image} alt={banner.title} className="w-8 h-6 rounded object-cover" />
                      <span className="text-sm font-medium">{banner.title}</span>
                    </div>
                    <Button size="sm" onClick={() => handleAddBannerSection(banner.id)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Available Product Listings */}
          {availableListings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Available Product Sections</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {availableListings.map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">{listing.title}</span>
                    </div>
                    <Button size="sm" onClick={() => handleAddProductSection(listing.id)}>
                      <Plus className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
