
import React, { createContext, useContext, useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

interface ResponsiveImageContextType {
  deviceType: DeviceType;
  getResponsiveImage: (images: BannerImages) => string;
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

    // Set initial device type
    checkDeviceType();

    // Add resize listener
    window.addEventListener('resize', checkDeviceType);

    return () => {
      window.removeEventListener('resize', checkDeviceType);
    };
  }, []);

  const getResponsiveImage = (images: BannerImages): string => {
    // Return the appropriate image based on device type
    return images.urls.banner[deviceType] || images.urls.original;
  };

  return (
    <ResponsiveImageContext.Provider value={{ deviceType, getResponsiveImage }}>
      {children}
    </ResponsiveImageContext.Provider>
  );
};

export type { BannerImages };
