
import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [deviceType, setDeviceType] = useState<DeviceType>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    checkDeviceType();
    window.addEventListener('resize', checkDeviceType);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  const getResponsiveImage = (images: BannerImages): string => {
    // Add null checks to prevent errors
    if (!images || !images.urls || !images.urls.banner) {
      return images?.urls?.original || '/placeholder.svg';
    }
    return images.urls.banner[deviceType] || images.urls.original || '/placeholder.svg';
  };

  const getImageUrl = (banner: { desktop: string; tablet: string; mobile: string }): string => {
    if (!banner) {
      return '/placeholder.svg';
    }
    return banner[deviceType] || banner.desktop || '/placeholder.svg';
  };

  return (
    <ResponsiveImageContext.Provider value={{ deviceType, getResponsiveImage, getImageUrl }}>
      {children}
    </ResponsiveImageContext.Provider>
  );
};

export type { BannerImages };
