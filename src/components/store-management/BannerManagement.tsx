import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BannerModal } from "./BannerModal";
import { Plus, Edit, Trash2, Eye, EyeOff, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
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
import { useResponsiveImage } from "@/contexts/ResponsiveImageContext";

export function BannerManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  
  const { 
    banners, 
    isLoading, 
    error, 
    addBanner, 
    updateBanner, 
    deleteBanner, 
    reorderBanners 
  } = useBanners();

  const { getResponsiveImage } = useResponsiveImage();

  const handleAddBanner = () => {
    setModalMode('add');
    setSelectedBanner(null);
    setIsModalOpen(true);
  };

  const handleEditBanner = (banner: Banner) => {
    setModalMode('edit');
    setSelectedBanner(banner);
    setIsModalOpen(true);
  };

  const handleSaveBanner = async (bannerData: Omit<Banner, 'id'>) => {
    if (modalMode === 'add') {
      await addBanner(bannerData);
    } else if (selectedBanner) {
      await updateBanner(selectedBanner.id, bannerData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteBanner = async (bannerId: number) => {
    await deleteBanner(bannerId);
  };

  const handleToggleActive = async (bannerId: number) => {
    const banner = banners.find(b => b.id === bannerId);
    if (banner) {
      await updateBanner(bannerId, { isActive: !banner.isActive });
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index > 0) {
      const newBanners = [...banners];
      [newBanners[index], newBanners[index - 1]] = [newBanners[index - 1], newBanners[index]];
      const reorderedIds = newBanners.map(b => b.id);
      await reorderBanners(reorderedIds);
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index < banners.length - 1) {
      const newBanners = [...banners];
      [newBanners[index], newBanners[index + 1]] = [newBanners[index + 1], newBanners[index]];
      const reorderedIds = newBanners.map(b => b.id);
      await reorderBanners(reorderedIds);
    }
  };

  const getPositionBadge = (position: string) => {
    const variants = {
      hero: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      secondary: "bg-green-100 text-green-800 hover:bg-green-200",
      sidebar: "bg-purple-100 text-purple-800 hover:bg-purple-200"
    };
    return (
      <Badge className={variants[position as keyof typeof variants]}>
        {position.charAt(0).toUpperCase() + position.slice(1)}
      </Badge>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p>Error loading banners: {error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
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
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Banner Management</h2>
          <p className="text-gray-600 dark:text-gray-400">Create and manage banners for your store</p>
        </div>
        <Button onClick={handleAddBanner} className="gap-2" disabled={isLoading}>
          <Plus className="w-4 h-4" />
          Add Banner
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {isLoading ? "Loading banners..." : `Active Banners (${banners.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading banners...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800 border-b">
                  <tr className="text-left">
                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Order</th>
                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Banner</th>
                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Position</th>
                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner, index) => (
                    <tr key={banner.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-col gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveUp(index)}
                              disabled={index === 0 || isLoading}
                              className="h-6 w-6 p-0"
                            >
                              <ArrowUp className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMoveDown(index)}
                              disabled={index === banners.length - 1 || isLoading}
                              className="h-6 w-6 p-0"
                            >
                              <ArrowDown className="w-3 h-3" />
                            </Button>
                          </div>
                          <span className="font-medium">{banner.order}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={getResponsiveImage(banner.images)} 
                            alt={banner.images.alt || banner.title} 
                            className="w-16 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 object-cover" 
                          />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{banner.title}</span>
                            {banner.subtitle && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">{banner.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{getPositionBadge(banner.position)}</td>
                      <td className="p-4">
                        <Badge variant={banner.isActive ? "default" : "secondary"}>
                          {banner.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleToggleActive(banner.id)}
                            title={banner.isActive ? "Deactivate" : "Activate"}
                            disabled={isLoading}
                          >
                            {banner.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleEditBanner(banner)}
                            disabled={isLoading}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={isLoading}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Banner</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{banner.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteBanner(banner.id)}>
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
          )}
        </CardContent>
      </Card>

      <BannerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveBanner}
        banner={selectedBanner}
        mode={modalMode}
      />
    </div>
  );
}

export { BannerManagement };
