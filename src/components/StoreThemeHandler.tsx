
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function StoreThemeHandler() {
  const location = useLocation();

  useEffect(() => {
    const root = window.document.documentElement;
    const isStorePage = location.pathname.startsWith('/store');

    // Force light mode for store pages
    if (isStorePage) {
      root.classList.remove("dark");
      root.classList.add("light");
    }
  }, [location.pathname]);

  return null; // This component doesn't render anything
}
