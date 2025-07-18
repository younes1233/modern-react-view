
import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { RoleBasedSidebar } from "@/components/dashboard/RoleBasedSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Users, 
  Shield, 
  UserCheck, 
  Settings 
} from "lucide-react";
import { RoleManagement } from "@/components/RoleManagement";
import { UserList } from "@/components/UserList";

const UserManagement = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <RoleBasedSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6">
            <div className="max-w-7xl mx-auto space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Users className="w-8 h-8 text-blue-600" />
                    User Management
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">Manage users, roles, and permissions</p>
                </div>
              </div>

              <Tabs defaultValue="users" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="users" className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Users
                  </TabsTrigger>
                  <TabsTrigger value="roles" className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Role Permissions
                  </TabsTrigger>
                  <TabsTrigger value="suppliers" className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Suppliers
                  </TabsTrigger>
                  <TabsTrigger value="employees" className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Employees
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="users" className="space-y-6">
                  <UserList />
                </TabsContent>

                <TabsContent value="roles" className="space-y-6">
                  <RoleManagement />
                </TabsContent>

                <TabsContent value="suppliers" className="space-y-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <UserCheck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Suppliers Management</h3>
                    <p>Supplier management functionality coming soon...</p>
                  </div>
                </TabsContent>

                <TabsContent value="employees" className="space-y-6">
                  <div className="text-center py-12 text-muted-foreground">
                    <Settings className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-semibold mb-2">Employee Management</h3>
                    <p>Employee management functionality coming soon...</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UserManagement;
