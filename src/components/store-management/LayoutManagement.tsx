
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBanners, Banner } from "@/hooks/useBanners";
import { useProductListings } from "@/hooks/useProductListings";
import { 
  useHomeSections, 
  useCreateHomeSection, 
  useUpdateHomeSection, 
  useDeleteHomeSection, 
  useReorderHomeSections 
} from "@/hooks/useHomeSections";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableLayoutRow } from './DraggableLayoutRow';

export function LayoutManagement() {
  const { toast } = useToast();
  
  const { data: homeSections = [], isLoading: homeSectionsLoading } = useHomeSections();
  const { banners, isLoading: bannersLoading } = useBanners();
  const { productListings, isLoading: listingsLoading } = useProductListings();
  
  const createHomeSection = useCreateHomeSection();
  const updateHomeSection = useUpdateHomeSection();
  const deleteHomeSection = useDeleteHomeSection();
  const reorderHomeSections = useReorderHomeSections();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getSectionItem = (section: any) => {
    if (section.type === 'banner') {
      return banners.find(b => b.id === section.item_id) || section.item;
    } else {
      return productListings.find(p => p.id === section.item_id) || section.item;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = homeSections.findIndex(section => section.id === active.id);
      const newIndex = homeSections.findIndex(section => section.id === over.id);
      
      const newOrder = arrayMove(homeSections, oldIndex, newIndex);
      const orderIds = newOrder.map(s => s.id);
      
      reorderHomeSections.mutate(orderIds);
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
          <p className="text-gray-600 dark:text-gray-400">Drag and drop to reorder sections on your store's home page</p>
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
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleDragEnd}
                    >
                      <SortableContext
                        items={homeSections.map(s => s.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {homeSections.map((section) => {
                          const item = getSectionItem(section);
                          return (
                            <DraggableLayoutRow
                              key={section.id}
                              section={section}
                              item={item}
                              onToggleActive={handleToggleActive}
                              onDeleteSection={handleDeleteSection}
                            />
                          );
                        })}
                      </SortableContext>
                    </DndContext>
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
