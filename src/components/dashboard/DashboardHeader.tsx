
import { useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, User, ExternalLink, Settings, Upload, Download } from "lucide-react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MassUploadModal } from "@/components/MassUploadModal";
import { ProfileSettingsModal } from "@/components/ProfileSettingsModal";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const [isMassUploadOpen, setIsMassUploadOpen] = useState(false);
  const [uploadType, setUploadType] = useState<'products' | 'categories'>('products');
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleMassUpload = (type: 'products' | 'categories') => {
    setUploadType(type);
    setIsMassUploadOpen(true);
  };

  const handleUploadComplete = (data: any[]) => {
    console.log(`Uploaded ${data.length} ${uploadType}:`, data);
    // Here you would typically send the data to your backend
  };

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-4 border-b px-4 bg-white dark:bg-gray-900">
        <SidebarTrigger className="-ml-1" />
        <div className="flex-1" />
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-2 text-sm">
            <Link to="/" target="_blank">
              <ExternalLink className="h-4 w-4" />
              View Store
            </Link>
          </Button>
          
          <ThemeToggle />
          
          {/* Settings Button - Only for super admin */}
          {user?.role === 'super_admin' && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Application Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleMassUpload('products')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Mass Upload Products
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleMassUpload('categories')}>
                  <Upload className="mr-2 h-4 w-4" />
                  Mass Upload Categories
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="mr-2 h-4 w-4" />
                  Export All Data
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-3 py-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">{user?.name || 'User'}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuLabel className="text-sm font-normal text-muted-foreground">
                {user?.email}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setIsProfileOpen(true)}>
                <User className="mr-2 h-4 w-4" />
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 dark:text-red-400">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {user?.role === 'super_admin' && (
        <MassUploadModal
          isOpen={isMassUploadOpen}
          onClose={() => setIsMassUploadOpen(false)}
          type={uploadType}
          onUploadComplete={handleUploadComplete}
        />
      )}

      <ProfileSettingsModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
