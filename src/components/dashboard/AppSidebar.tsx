
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
  Globe,
  CheckCircle,
  UserCheck
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

// Menu items organized by category
const mainItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    description: "Overview & analytics"
  },
]

const catalogItems = [
  {
    title: "Products",
    url: "/products",
    icon: Package,
    description: "Manage inventory"
  },
  {
    title: "Categories",
    url: "/categories",
    icon: Settings,
    description: "Product categories"
  },
  {
    title: "Inventory",
    url: "/inventory",
    icon: Package2,
    description: "Stock management"
  },
]

const businessItems = [
  {
    title: "Orders",
    url: "/orders",
    icon: ShoppingCart,
    description: "Order management",
    badge: "12"
  },
  {
    title: "Returns",
    url: "/returns",
    icon: RotateCcw,
    description: "Return requests",
    badge: "3"
  },
  {
    title: "Customers",
    url: "/customers",
    icon: Users,
    description: "Customer database"
  },
  {
    title: "Coupons",
    url: "/coupons",
    icon: Tag,
    description: "Discount management"
  },
]

const storeItems = [
  {
    title: "Store Management",
    url: "/store-management",
    icon: Store,
    description: "Store settings"
  },
]

const analyticsItems = [
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
    description: "Performance metrics"
  },
  {
    title: "Sales Report",
    url: "/sales-report",
    icon: FileText,
    description: "Revenue insights"
  },
]

const managementItems = [
  {
    title: "User Management",
    url: "/user-management",
    icon: UserCheck,
    description: "Manage users & roles"
  },
  {
    title: "Product Approval",
    url: "/product-approval",
    icon: CheckCircle,
    description: "Review submissions"
  },
  {
    title: "Localization",
    url: "/localization",
    icon: Globe,
    description: "Countries & warehouses"
  },
]

export function AppSidebar() {
  const location = useLocation()

  const renderMenuGroup = (items: any[], title: string) => (
    <SidebarGroup className="mb-6">
      <SidebarGroupLabel className="text-xs font-bold text-muted-foreground/80 uppercase tracking-widest mb-3 px-2 flex items-center">
        <span className="w-2 h-2 bg-primary/40 rounded-full mr-2"></span>
        {title}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          {items.map((item) => {
            const isActive = location.pathname === item.url
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton 
                  asChild 
                  isActive={isActive}
                  className={`
                    group relative h-12 rounded-xl transition-all duration-300 ease-out overflow-hidden
                    ${isActive 
                      ? 'bg-gradient-to-r from-primary/15 via-primary/10 to-primary/5 text-primary shadow-lg shadow-primary/10 border border-primary/20 scale-[1.02]' 
                      : 'hover:bg-gradient-to-r hover:from-accent/50 hover:to-accent/30 hover:shadow-md hover:shadow-black/5 hover:scale-[1.01] text-foreground/80 hover:text-foreground'
                    }
                  `}
                >
                  <Link to={item.url} className="flex items-center w-full px-3 py-2">
                    <div className={`
                      relative flex items-center justify-center w-9 h-9 rounded-lg mr-3 transition-all duration-300
                      ${isActive 
                        ? 'bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-sm' 
                        : 'bg-gradient-to-br from-muted to-muted/50 text-muted-foreground group-hover:from-accent-foreground/10 group-hover:to-accent-foreground/5 group-hover:text-foreground'
                      }
                    `}>
                      <item.icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                      {isActive && (
                        <div className="absolute inset-0 bg-primary/10 rounded-lg animate-pulse"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm truncate transition-colors">{item.title}</span>
                        <div className="flex items-center space-x-1">
                          {item.badge && (
                            <Badge 
                              variant="secondary" 
                              className="bg-gradient-to-r from-destructive/15 to-destructive/10 text-destructive border-destructive/20 text-xs px-2 py-0.5 h-5 animate-pulse"
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {isActive && (
                            <div className="w-6 h-6 bg-primary/10 rounded-lg flex items-center justify-center">
                              <ChevronRight className="w-3 h-3 text-primary animate-pulse" />
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground/70 truncate mt-0.5 transition-colors group-hover:text-muted-foreground">{item.description}</p>
                    </div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )

  return (
    <Sidebar className="border-r border-border/50 bg-gradient-to-b from-background via-background/95 to-background/90 backdrop-blur-sm">
      <SidebarHeader className="p-6 border-b border-border/30 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="flex items-center space-x-3">
          <div className="relative w-11 h-11 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Store className="w-6 h-6 text-primary-foreground drop-shadow-sm" />
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">StoreHub</h2>
            <p className="text-xs text-muted-foreground/80 font-medium">Admin Dashboard</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-4 py-6 overflow-y-auto">
        {renderMenuGroup(mainItems, "Overview")}
        {renderMenuGroup(catalogItems, "Catalog")}
        {renderMenuGroup(businessItems, "Business")}
        {renderMenuGroup(storeItems, "Store")}
        {renderMenuGroup(managementItems, "Management")}
        {renderMenuGroup(analyticsItems, "Analytics")}
      </SidebarContent>

      <SidebarFooter className="p-4 border-t border-border/30 bg-gradient-to-r from-muted/30 to-transparent">
        <div className="text-xs text-muted-foreground/60 text-center space-y-1">
          <p className="font-medium">© 2024 StoreHub</p>
          <p className="text-muted-foreground/40">Version 1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
