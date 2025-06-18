import { useState } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AdvancedFilterBar } from "@/components/AdvancedFilterBar";
import { Plus, Eye, Mail, Phone, Users } from "lucide-react";
import { exportToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// TODO: Replace with API call to fetch customers
const mockCustomers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1 (555) 123-4567", orders: 12, totalSpent: 1299.87, status: "active", joinDate: "2023-08-15" },
  { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "+1 (555) 987-6543", orders: 8, totalSpent: 899.23, status: "active", joinDate: "2023-09-22" },
  { id: 3, name: "Mike Johnson", email: "mike@example.com", phone: "+1 (555) 456-7890", orders: 15, totalSpent: 2156.45, status: "vip", joinDate: "2023-06-10" },
  { id: 4, name: "Sarah Wilson", email: "sarah@example.com", phone: "+1 (555) 321-9876", orders: 3, totalSpent: 234.56, status: "new", joinDate: "2024-01-05" },
  { id: 5, name: "Tom Brown", email: "tom@example.com", phone: "+1 (555) 654-3210", orders: 0, totalSpent: 0, status: "inactive", joinDate: "2023-12-20" },
];

const statusOptions = [
  { value: "active", label: "Active" },
  { value: "vip", label: "VIP" },
  { value: "new", label: "New" },
  { value: "inactive", label: "Inactive" },
];

const Customers = () => {
  const [customers] = useState(mockCustomers);
  const [filteredCustomers, setFilteredCustomers] = useState(mockCustomers);
  const { toast } = useToast();
    const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term: string) => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(term.toLowerCase()) ||
      customer.email.toLowerCase().includes(term.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };

  const handleStatusFilter = (status: string) => {
    if (!status) {
      setFilteredCustomers(customers);
      return;
    }
    const filtered = customers.filter(customer => customer.status === status);
    setFilteredCustomers(filtered);
  };

  const handleAmountRangeFilter = (min: number | undefined, max: number | undefined) => {
    if (min === undefined && max === undefined) {
      setFilteredCustomers(customers);
      return;
    }
    
    const filtered = customers.filter(customer => {
      if (min !== undefined && customer.totalSpent < min) return false;
      if (max !== undefined && customer.totalSpent > max) return false;
      return true;
    });
    setFilteredCustomers(filtered);
  };

  const handleExportExcel = () => {
    const exportData = filteredCustomers.map(customer => ({
      'Name': customer.name,
      'Email': customer.email,
      'Phone': customer.phone,
      'Orders': customer.orders,
      'Total Spent': `$${customer.totalSpent.toFixed(2)}`,
      'Status': customer.status.toUpperCase(),
      'Join Date': customer.joinDate
    }));
    
    exportToExcel(exportData, 'customers-export', 'Customers');
    toast({
      title: "Export Successful",
      description: "Customers data has been exported to Excel file"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "vip":
        return <Badge className="bg-purple-100 text-purple-800">VIP</Badge>;
      case "new":
        return <Badge className="bg-blue-100 text-blue-800">New</Badge>;
      case "inactive":
        return <Badge variant="secondary">Inactive</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <div className="flex-1 overflow-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
                <p className="text-gray-600">Manage your customer relationships</p>
              </div>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Customer
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-50">
                      <Phone className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold">2,547</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-green-50">
                      <Phone className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Active Customers</p>
                      <p className="text-2xl font-bold">2,234</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-50">
                      <Phone className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">VIP Customers</p>
                      <p className="text-2xl font-bold">157</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-yellow-50">
                      <Phone className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">New This Month</p>
                      <p className="text-2xl font-bold">89</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Filters */}
            <AdvancedFilterBar
              searchPlaceholder="Search customers by name or email..."
              statusOptions={statusOptions}
              onSearch={handleSearch}
              onStatusFilter={handleStatusFilter}
              onAmountRangeFilter={handleAmountRangeFilter}
              onExportExcel={handleExportExcel}
              showStatusFilter
              showAmountFilter
              showExcelExport
              exportLabel="Export"
            />

            {/* Customers Table */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Customer List</CardTitle>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search customers..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-80"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Contact</th>
                        <th className="pb-3 font-semibold">Orders</th>
                        <th className="pb-3 font-semibold">Total Spent</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Join Date</th>
                        <th className="pb-3 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCustomers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-gray-50">
                          <td className="py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <span className="text-sm font-medium text-white">
                                  {customer.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <span className="font-medium">{customer.name}</span>
                            </div>
                          </td>
                          <td className="py-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm">
                                <Mail className="w-4 h-4 text-gray-400" />
                                {customer.email}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Phone className="w-4 h-4 text-gray-400" />
                                {customer.phone}
                              </div>
                            </div>
                          </td>
                          <td className="py-4">{customer.orders}</td>
                          <td className="py-4">${customer.totalSpent.toFixed(2)}</td>
                          <td className="py-4">{getStatusBadge(customer.status)}</td>
                          <td className="py-4">{customer.joinDate}</td>
                          <td className="py-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Customers;
