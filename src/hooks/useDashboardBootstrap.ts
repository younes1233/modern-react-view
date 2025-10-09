import { useQuery, useQueryClient } from '@tanstack/react-query';
import { dashboardService } from '@/services/dashboardService';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook to load all dashboard initialization data in a single API call
 * This replaces multiple separate calls to countries, warehouses, and settings
 *
 * Benefits:
 * - Single HTTP request instead of 3-4
 * - Cached by React Query (no duplicate calls)
 * - Automatic loading/error states
 * - Shared across all dashboard components
 */
export function useDashboardBootstrap() {
  const queryClient = useQueryClient();
  const authContext = useAuth();
  const user = authContext?.user;

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard-bootstrap', user?.id],
    queryFn: () => dashboardService.bootstrap(),
    enabled: !!user && user.role !== 'customer', // Only load for dashboard users
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchOnWindowFocus: false,
  });

  // Helper to invalidate cache (call after settings change)
  const invalidate = async () => {
    await dashboardService.clearCache();
    queryClient.invalidateQueries({ queryKey: ['dashboard-bootstrap'] });
  };

  return {
    countries: data?.details?.countries || [],
    warehouses: data?.details?.warehouses || [],
    selectedCountryId: data?.details?.selected_country_id || null,
    settings: data?.details?.settings || {},
    userPreferences: data?.details?.user || {},
    isLoading,
    error,
    invalidate,
  };
}
