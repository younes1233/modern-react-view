
import {
  BarChart3,
  Home,
  Package,
  ShoppingCart,
  Users,
  Settings,
  FileText,
  TrendingUp,
  Package2,
  Store,
  RotateCcw,
  ChevronRight,
  Tag,
  UserCheck,
  CheckCircle,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Link, useLocation } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRoleAuth } from "@/contexts/RoleAuthContext"

// Menu items for different roles
const roleMenuItems = {
  super_admin: {
    main: [
      { title: "Dashboard", url: "/", icon: Home, description: "Overview & analytics" },
    ],
    management: [
      { title: "User Management", url: "/user-management", icon: UserCheck, description: "Manage users & roles" },
      { title: "Product Approval", url: "/product-approval", icon: CheckCircle, description: "Review submissions" },
    ],
    catalog: [
      { title: "Products", url: "/products", icon: Package, description: "Manage inventory" },
      { title: "Categories", url: "/categories", icon: Settings, description: "Product categories" },
      { title: "Inventory", url: "/inventory", icon: Package2, description: "Stock management" },
    ],
    business: [
      { title: "Orders", url: "/orders", icon: ShoppingCart, description: "Order management", badge: "12" },
      { title: "Returns", url: "/returns", icon: RotateCcw, description: "Return requests", badge: "3" },
      { title: "Customers", url: "/customers", icon: Users, description: "Customer database" },
      { title: "Coupons", url: "/coupons", icon: Tag, description: "Discount management" },
    ],
    store: [
      { title: "Store Management", url: "/store-management", icon: Store, description: "Store settings" },
    ],
    analytics: [
      { title: "Analytics", url: "/analytics", icon: BarChart3, description: "Performance metrics" },
      { title: "Sales Report", url: "/sales-report", icon: FileText, description: "Revenue insights" },
    ],
  },
  manager: {
    catalog: [
      { title: "Products", url: "/products", icon: Package, description: "Manage inventory" },
      { title: "Categories", url: "/categories", icon: Settings, description: "Product categories" },
    ],
    business: [
      { title: "Orders", url: "/orders", icon: ShoppingCart, description: "Order management", badge: "12" },
      { title: "Returns", url: "/returns", icon: RotateCcw, description: "Return requests", badge: "3" },
      { title: "Customers", url: "/customers", icon: Users, description: "Customer database" },
    ],
  },
  seller: {
    main: [
      { title: "My Products", url: "/seller-products", icon: Package, description: "Manage your products" },
    ],
  },
};

export function RoleBasedSidebar() {
  const location = useLocation();
  const { user } = useRoleAuth();

  if (!user) return null;

  const menuItems = roleMenuItems[user.role] || {};

  // Check if we should show management sections (only for super_admin on dashboard)
  const showManagementSections = user.role === 'super_admin' && location.pathname === '/';

  const renderMenuGroup = (items: any[], title: string) => {
    if (!items || items.length === 0) return null;
    
    return (
      <SidebarGroup>
        <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          {title}
        </SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {items.map((item) => {
              const isActive = location.pathname === item.url
              return (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={isActive}
                    className={`
                      group relative h-11 rounded-lg transition-all duration-200 ease-in-out
                      ${isActive 
                        ? 'bg-gradient-to-r from-primary/10 to-primary/20 text-primary shadow-sm border border-primary/20' 
                        : 'hover:bg-accent hover:shadow-sm text-foreground'
                      }
                    `}
                  >
                    <Link to={item.url} className="flex items-center w-full">
                      <div className={`
                        flex items-center justify-center w-8 h-8 rounded-md mr-3 transition-colors
                        ${isActive 
                          ? 'bg-primary/20 text-primary' 
                          : 'bg-muted text-muted-foreground group-hover:bg-accent-foreground/10'
                        }
                      `}>
                        <item.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm truncate">{item.title}</span>
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="ml-2 bg-destructive/10 text-destructive text-xs px-1.5 py-0.5 h-5"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {isActive && (
                            <ChevronRight className="w-4 h-4 text-primary ml-1" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">{item.description}</p>
                      </div>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    );
  };

  return (
    <Sidebar className="border-r border-border bg-background">
      <SidebarHeader className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
            <Store className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">StoreHub</h2>
            <p className="text-xs text-muted-foreground capitalize">{user.role.replace('_', ' ')} Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-4 space-y-6">
        {menuItems.main && renderMenuGroup(menuItems.main, "Overview")}
        {menuItems.management && showManagementSections && (
          <>
            <Separator className="my-4" />
            {renderMenuGroup(menuItems.management, "Management")}
          </>
        )}
        {menuItems.catalog && (
          <>
            <Separator className="my-4" />
            {renderMenuGroup(menuItems.catalog, "Catalog")}
          </>
        )}
        {menuItems.business && (
          <>
            <Separator className="my-4" />
            {renderMenuGroup(menuItems.business, "Business")}
          </>
        )}
        {menuItems.store && (
          <>
            <Separator className="my-4" />
            {renderMenuGroup(menuItems.store, "Store")}
          </>
        )}
        {menuItems.analytics && (
          <>
            <Separator className="my-4" />
            {renderMenuGroup(menuItems.analytics, "Analytics")}
          </>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground text-center">
          <p>© 2024 StoreHub</p>
          <p>Version 1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
