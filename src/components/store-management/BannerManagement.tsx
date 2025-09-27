import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BannerModal } from "./BannerModal";
import { Plus, Edit, Trash2, Eye, EyeOff } from "lucide-react";
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
import { useBanners, Banner, BannerFormData } from "@/hooks/useBanners";
import { useResponsiveImage } from "@/contexts/ResponsiveImageContext";

function BannerManagement() {
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

  const handleSaveBanner = async (bannerData: BannerFormData) => {
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
                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Banner</th>
                    <th className="p-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner, index) => (
                    <tr key={banner.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={getResponsiveImage(banner.images)}
                            alt={banner.images.alt || banner.title}
                            className="w-full h-12 rounded-lg bg-gray-200 dark:bg-gray-700 object-cover max-w-xs"
                          />
                          <div>
                            <span className="font-medium text-gray-900 dark:text-gray-100">{banner.title}</span>
                            {banner.subtitle && (
                              <p className="text-sm text-gray-500 dark:text-gray-400">{banner.subtitle}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(banner.id)}
                            title={banner.isActive ? "Deactivate" : "Activate"}
                            disabled={isLoading}
                            className={banner.isActive ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"}
                          >
                            {banner.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
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
