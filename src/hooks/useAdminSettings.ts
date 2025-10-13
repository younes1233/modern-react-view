import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminSettingsService, AdminSettings, UpdateAdminSettingsRequest } from '@/services/adminSettingsService';
import { toast } from '@/components/ui/sonner';

export const useAdminSettings = () => {
  
  const queryClient = useQueryClient();

  // Query to get admin settings
  const {
    data: adminSettings,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const response = await adminSettingsService.getAdminSettings();
      if (response.error) {
        throw new Error(response.message);
      }
      return response.details;
    },
  });

  // Mutation to update admin settings
  const updateAdminSettingsMutation = useMutation({
    mutationFn: async (settings: UpdateAdminSettingsRequest) => {
      const response = await adminSettingsService.updateAdminSettings(settings);
      if (response.error) {
        throw new Error(response.message);
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Update the cache with new data
      queryClient.setQueryData(['admin-settings'], data);
      toast.success('Admin settings have been saved successfully.', { duration: 2000 });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update admin settings.', { duration: 2500 });
    },
  });

  return {
    adminSettings,
    isLoading,
    error,
    refetch,
    updateAdminSettings: updateAdminSettingsMutation.mutate,
    isUpdating: updateAdminSettingsMutation.isPending,
  };
};