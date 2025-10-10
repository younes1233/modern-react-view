
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function StoreThemeHandler() {
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    const isStorePage = !location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/role-login');

    // Force light mode for store pages and prevent dark mode
    if (isStorePage) {
      root.classList.remove("dark");
      root.classList.add("light");
      
      // Override any theme provider attempts to apply dark mode
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
            if (root.classList.contains('dark') && (!location.pathname.startsWith('/dashboard') && !location.pathname.startsWith('/role-login'))) {
              root.classList.remove("dark");
              root.classList.add("light");
            }
          }
        });
      });
      
      observer.observe(root, { attributes: true, attributeFilter: ['class'] });
      
      return () => observer.disconnect();
    }
  }, [location.pathname]);

  return null;
}
