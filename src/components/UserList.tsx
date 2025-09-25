import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  UserCheck, 
  UserX,
  Loader2
} from "lucide-react";
import { roleService } from "@/services/roleService";
import { userService, UserAPIResponse } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";

export const UserList = () => {
  const [users, setUsers] = useState<UserAPIResponse[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [availableRoles, setAvailableRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    current_page: "1",
    per_page: "20",
    total: "0",
    last_page: "1"
  });
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    role: 'seller'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchAvailableRoles();
    fetchUsers();
  }, [currentPage, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers(
        currentPage, 
        20, 
        searchTerm || undefined, 
        roleFilter !== "all" ? roleFilter : undefined
      );
      
      if (!response.error) {
        setUsers(response.details.users);
        setPagination(response.details.pagination);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch users",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRoles = async () => {
    try {
      const response = await roleService.getAssignableRoles();
      console.log('Roles response:', response);
      if (!response.error && response.details?.roles) {
        // Ensure all roles are strings
        const stringRoles = response.details.roles.map(role => getStringValue(role));
        console.log('Processed roles:', stringRoles);
        setAvailableRoles(stringRoles);
      }
    } catch (error) {
      console.error('Failed to fetch available roles:', error);
      // Fallback to default roles
      setAvailableRoles(['super_admin', 'manager', 'seller', 'customer']);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.firstName || !newUser.lastName || !newUser.email || !newUser.password || !newUser.role) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (users.some(u => u.email === newUser.email)) {
      toast({
        title: "Error",
        description: "A user with this email already exists",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const response = await userService.createUser(newUser);
      
      if (!response.error) {
        setNewUser({ 
          firstName: '', 
          lastName: '', 
          email: '', 
          phone: '', 
          password: '', 
          role: 'seller' 
        });
        setIsAddModalOpen(false);
        await fetchUsers(); // Refresh the list
        
        toast({
          title: "User Added",
          description: `${newUser.firstName} ${newUser.lastName} has been added as ${newUser.role}`,
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to add user",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string) => {
    try {
      const response = await userService.toggleUserStatus(userId);
      
      if (!response.error) {
        await fetchUsers(); // Refresh the list
        const user = users.find(u => u.id === userId);
        toast({
          title: "User Status Updated",
          description: `${user?.firstName} ${user?.lastName} status has been updated`,
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update user status",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive"
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await userService.updateUserRole(userId, newRole);
      
      if (!response.error) {
        await fetchUsers(); // Refresh the list
        const user = users.find(u => u.id === userId);
        toast({
          title: "Role Updated",
          description: `${user?.firstName} ${user?.lastName}'s role has been changed to ${newRole}`,
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update user role",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'super_admin': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'manager': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'seller': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'customer': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusBadgeColor = (isActive: string | boolean | { id: string; name: string }) => {
    const active = typeof isActive === 'object' && isActive?.name 
      ? isActive.name === 'active' || isActive.name === 'Active'
      : typeof isActive === 'string' 
        ? isActive === 'true' || isActive === '1' || isActive === 'active' || isActive === 'Active'
        : isActive;
    return active 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
  };

  const isUserActive = (isActive: string | boolean | { id: string; name: string }) => {
    if (typeof isActive === 'object' && isActive?.name) {
      return isActive.name === 'active' || isActive.name === 'Active';
    }
    return typeof isActive === 'string' 
      ? isActive === 'true' || isActive === '1' || isActive === 'active' || isActive === 'Active'
      : isActive;
  };

  // Helper function to safely extract string value from potentially object field
  const getStringValue = (field: any): string => {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field.name) return field.name;
    if (typeof field === 'object' && field.id) return field.id.toString();
    return String(field);
  };

  const roleStats = {
    total: users.length,
    active: users.filter(u => isUserActive(u.isActive)).length,
    super_admin: users.filter(u => getStringValue(u.role) === 'super_admin').length,
    manager: users.filter(u => getStringValue(u.role) === 'manager').length,
    seller: users.filter(u => getStringValue(u.role) === 'seller').length,
    customer: users.filter(u => getStringValue(u.role) === 'customer').length,
  };

  // Debounced search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, roleFilter]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Users</h2>
          <p className="text-muted-foreground">Manage user accounts and assignments</p>
        </div>
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2" disabled={loading}>
              <UserPlus className="w-4 h-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with specific role permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={newUser.firstName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={newUser.lastName}
                    onChange={(e) => setNewUser(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Enter last name"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter email address"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newUser.phone}
                  onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
              <div>
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter password"
                />
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select 
                  value={newUser.role} 
                  onValueChange={(value) => setNewUser(prev => ({ ...prev, role: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map(role => (
                      <SelectItem key={getStringValue(role)} value={getStringValue(role)}>
                        {getStringValue(role)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddUser} className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  'Add User'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{roleStats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{roleStats.super_admin}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Managers</p>
                <p className="text-2xl font-bold">{roleStats.manager}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Sellers</p>
                <p className="text-2xl font-bold">{roleStats.seller}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm text-muted-foreground">Customers</p>
                <p className="text-2xl font-bold">{roleStats.customer}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>User List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="super_admin">Super Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="seller">Seller</SelectItem>
                <SelectItem value="customer">Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading users...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Email Verified</TableHead>
                  <TableHead>Is Seller</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => {
                  // Comprehensive debug logging
                  console.log('=== USER DEBUG ===');
                  console.log('Full user object:', user);
                  Object.entries(user).forEach(([key, value]) => {
                    if (value && typeof value === 'object' && !Array.isArray(value)) {
                      console.log(`OBJECT FIELD DETECTED - ${key}:`, value);
                    }
                  });
                  console.log('==================');
                  
                  return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getStringValue(user.firstName)} {getStringValue(user.lastName)}</p>
                        <p className="text-sm text-muted-foreground">{getStringValue(user.email)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={getStringValue(user.role)}
                        onValueChange={(value) => handleRoleChange(user.id, value)}
                        disabled={loading}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map(role => (
                            <SelectItem key={getStringValue(role)} value={getStringValue(role)}>
                              {getStringValue(role)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Badge className={(() => {
                        const active = typeof user.isActive === 'object' && user.isActive?.name 
                          ? user.isActive.name === 'active' || user.isActive.name === 'Active'
                          : typeof user.isActive === 'string' 
                            ? user.isActive === 'active' || user.isActive === 'Active' || user.isActive === '1'
                            : user.isActive === true;
                        return getStatusBadgeColor(active ? 'active' : 'inactive');
                      })()}>
                        {(() => {
                          const active = typeof user.isActive === 'object' && user.isActive?.name 
                            ? user.isActive.name === 'active' || user.isActive.name === 'Active'
                            : typeof user.isActive === 'string' 
                              ? user.isActive === 'active' || user.isActive === 'Active' || user.isActive === '1'
                              : user.isActive === true;
                          return active ? 'Active' : 'Inactive';
                        })()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getStringValue(user.permissions) || 'N/A'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge className={user.isEmailVerified ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}>
                          {user.isEmailVerified ? 'Verified' : 'Unverified'}
                        </Badge>
                        {user.emailVerifiedAt && (
                          <span className="text-xs text-muted-foreground">
                            {getStringValue(user.emailVerifiedAt) ? new Date(getStringValue(user.emailVerifiedAt)).toLocaleDateString() : ''}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={user.isSeller ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'}>
                        {user.isSeller ? 'Yes' : 'No'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getStringValue(user.createdAt) 
                          ? new Date(getStringValue(user.createdAt)).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getStringValue(user.updatedAt) 
                          ? new Date(getStringValue(user.updatedAt)).toLocaleDateString()
                          : 'N/A'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {getStringValue(user.lastLogin) 
                          ? new Date(getStringValue(user.lastLogin)).toLocaleDateString()
                          : 'Never'
                        }
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleUserStatus(user.id)}
                        className="gap-2"
                        disabled={loading}
                      >
                        {isUserActive(user.isActive) ? (
                          <>
                            <UserX className="w-4 h-4" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <UserCheck className="w-4 h-4" />
                            Activate
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {parseInt(pagination.last_page) > 1 && (
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((parseInt(pagination.current_page) - 1) * parseInt(pagination.per_page)) + 1} to{' '}
                {Math.min(parseInt(pagination.current_page) * parseInt(pagination.per_page), parseInt(pagination.total))} of{' '}
                {pagination.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(parseInt(pagination.last_page), prev + 1))}
                  disabled={currentPage === parseInt(pagination.last_page) || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};