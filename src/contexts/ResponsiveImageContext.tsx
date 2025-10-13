import React from 'react';
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveImageContextType {
  deviceType: DeviceType;
  getResponsiveImage: (images: BannerImages) => string;
  getImageUrl: (banner: { desktop: string; tablet: string; mobile: string }) => string;
}

interface BannerImages {
  urls: {
    original: string;
    banner: {
      desktop: string;
      tablet: string;
      mobile: string;
    };
  };
  alt?: string | null;
}

const ResponsiveImageContext = createContext<ResponsiveImageContextType | undefined>(undefined);

export const useResponsiveImage = () => {
  const context = useContext(ResponsiveImageContext);
  if (!context) {
    throw new Error('useResponsiveImage must be used within a ResponsiveImageProvider');
  }
  return context;
};

export const ResponsiveImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Device type is determined ONCE on initial load and never changes
  // This prevents unnecessary image reloads when resizing the browser
  const [deviceType] = useState<DeviceType>(() => {
    // Initialize with correct device type on first render
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  // Removed resize listener - device type is fixed for the session
  // This ensures loaded images stay loaded even when resizing

  const getResponsiveImage = useCallback((images: BannerImages): string => {
    // Add null checks to prevent errors
    if (!images || !images.urls || !images.urls.banner) {
      return images?.urls?.original || '/placeholder.svg';
    }
    return images.urls.banner[deviceType] || images.urls.original || '/placeholder.svg';
  }, [deviceType]);

  const getImageUrl = useCallback((banner: { desktop: string; tablet: string; mobile: string }): string => {
    if (!banner) {
      return '/placeholder.svg';
    }
    return banner[deviceType] || banner.desktop || '/placeholder.svg';
  }, [deviceType]);

  const contextValue = useMemo(() => ({
    deviceType,
    getResponsiveImage,
    getImageUrl
  }), [deviceType, getResponsiveImage, getImageUrl]);

  return (
    <ResponsiveImageContext.Provider value={contextValue}>
      {children}
    </ResponsiveImageContext.Provider>
  );
};

export type { BannerImages };
