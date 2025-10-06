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
  const [deviceType, setDeviceType] = useState<DeviceType>(() => {
    // Initialize with correct device type on first render
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      let newDeviceType: DeviceType;
      if (width < 768) {
        newDeviceType = 'mobile';
      } else if (width < 1024) {
        newDeviceType = 'tablet';
      } else {
        newDeviceType = 'desktop';
      }

      // Only update state if device type actually changed
      setDeviceType(prevType => prevType === newDeviceType ? prevType : newDeviceType);
    };

    window.addEventListener('resize', checkDeviceType);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

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
