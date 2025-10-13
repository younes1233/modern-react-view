import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { StoreLayout } from "@/components/store/StoreLayout";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <StoreLayout>
      <div className="min-h-[60vh] flex items-center justify-center py-16">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-cyan-600 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Page Not Found</h2>
            <p className="text-gray-600 mb-8">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="space-y-4">
            <Link to="/">
              <Button className="w-full sm:w-auto bg-cyan-600 hover:bg-cyan-700 text-white">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            
            <div className="text-sm text-gray-500">
              <p>Or try searching for what you're looking for:</p>
            </div>
            
            <Link to="/products">
              <Button variant="outline" className="w-full sm:w-auto border-cyan-600 text-cyan-600 hover:bg-cyan-50">
                <Search className="w-4 h-4 mr-2" />
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </StoreLayout>
  );
};

export default NotFound;
