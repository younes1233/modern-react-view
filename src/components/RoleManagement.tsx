import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Shield,
  Eye,
  RefreshCw
} from "lucide-react";
import { roleService, Role } from "@/services/roleService";
import { toast } from '@/components/ui/sonner';

export const RoleManagement = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [availablePermissions, setAvailablePermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewingPermissionsRole, setViewingPermissionsRole] = useState<Role | null>(null);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });
  // Removed useToast hook;

  const protectedRoles = ['super_admin', 'seller', 'user'];

  useEffect(() => {
    console.log('RoleManagement: Component mounted, fetching data...');
    fetchRoles();
    fetchAvailablePermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      console.log('RoleManagement: Fetching roles...');
      setError(null);
      setLoading(true);
      
      const response = await roleService.getRoles();
      console.log('RoleManagement: Roles response:', response);
      
      if (!response.error && response.details && response.details.roles) {
        setRoles(response.details.roles);
        console.log('RoleManagement: Roles set successfully:', response.details.roles);
      } else {
        const errorMessage = response.message || 'Failed to fetch roles';
        setError(errorMessage);
        console.error('RoleManagement: Error in roles response:', errorMessage);
        toast.error(errorMessage, { duration: 2500 });
      }
    } catch (error) {
      console.error('RoleManagement: Failed to fetch roles:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch roles';
      setError(errorMessage);
      toast.error("Failed to fetch roles. Please check your connection and try again.", { duration: 2500 });
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailablePermissions = async () => {
    try {
      console.log('RoleManagement: Fetching available permissions...');
      const response = await roleService.getAssignableRolesAndPermissions();
      console.log('RoleManagement: Permissions response:', response);
      
      if (!response.error && response.details && response.details.permissions) {
        setAvailablePermissions(response.details.permissions);
        console.log('RoleManagement: Permissions set successfully:', response.details.permissions);
      }
    } catch (error) {
      console.error('RoleManagement: Failed to fetch available permissions:', error);
    }
  };

  const handleAddRole = async () => {
    if (!newRole.name.trim()) {
      toast.error("Role name is required", { duration: 2500 });
      return;
    }

    try {
      console.log('RoleManagement: Creating role:', newRole);
      const response = await roleService.createRole(
        newRole.name.trim(),
        newRole.description.trim() || undefined,
        newRole.permissions.length > 0 ? newRole.permissions : undefined
      );
      
      console.log('RoleManagement: Create role response:', response);
      
      if (!response.error) {
        setRoles(prev => [...prev, response.details.role]);
        setNewRole({ name: '', description: '', permissions: [] });
        setIsAddModalOpen(false);
        toast({
          title: "Success",
          description: "Role created successfully",
        });
      } else {
        toast.error(response.message, { duration: 2500 });
      }
    } catch (error) {
      console.error('RoleManagement: Failed to create role:', error);
      toast.error("Failed to create role", { duration: 2500 });
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole || !newRole.name.trim()) return;

    try {
      console.log('RoleManagement: Updating role:', editingRole.id, newRole);
      const response = await roleService.updateRole(
        editingRole.id,
        newRole.name.trim(),
        newRole.description.trim() || undefined,
        newRole.permissions.length > 0 ? newRole.permissions : undefined
      );
      
      console.log('RoleManagement: Update role response:', response);
      
      if (!response.error) {
        setRoles(prev => prev.map(role => 
          role.id === editingRole.id ? response.details.role : role
        ));
        setEditingRole(null);
        setNewRole({ name: '', description: '', permissions: [] });
        toast({
          title: "Success",
          description: "Role updated successfully",
        });
      } else {
        toast.error(response.message, { duration: 2500 });
      }
    } catch (error) {
      console.error('RoleManagement: Failed to update role:', error);
      toast.error("Failed to update role", { duration: 2500 });
    }
  };

  const handleDeleteRole = async (roleId: number, roleName: string) => {
    if (protectedRoles.includes(roleName)) {
      toast.error("Cannot delete protected roles", { duration: 2500 });
      return;
    }

    try {
      console.log('RoleManagement: Deleting role:', roleId);
      const response = await roleService.deleteRole(roleId);
      console.log('RoleManagement: Delete role response:', response);
      
      if (!response.error) {
        setRoles(prev => prev.filter(role => role.id !== roleId));
        toast({
          title: "Success",
          description: "Role deleted successfully",
        });
      } else {
        toast.error(response.message, { duration: 2500 });
      }
    } catch (error) {
      console.error('RoleManagement: Failed to delete role:', error);
      toast.error("Failed to delete role", { duration: 2500 });
    }
  };

  const handlePermissionToggle = (permission: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const startEditing = (role: Role) => {
    console.log('RoleManagement: Starting to edit role:', role);
    setEditingRole(role);
    
    // Extract permission names from objects if needed
    const extractedPermissions = extractPermissionNames(role.permissions);
    
    setNewRole({
      name: role.name,
      description: role.description || '',
      permissions: extractedPermissions
    });
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setNewRole({ name: '', description: '', permissions: [] });
    setEditingRole(null);
  };

  // Helper function to extract permission names from objects or strings
  const extractPermissionNames = (permissions: any): string[] => {
    if (!permissions || !Array.isArray(permissions)) {
      return [];
    }

    return permissions.map(permission => {
      if (typeof permission === 'string') {
        return permission;
      } else if (typeof permission === 'object' && permission.name) {
        return permission.name;
      } else {
        console.warn('Unknown permission format:', permission);
        return String(permission);
      }
    });
  };

  // Helper function to safely render permissions
  const renderPermissions = (permissions: any, showViewAll: boolean = true) => {
    console.log('RoleManagement: Rendering permissions:', permissions);
    
    if (!permissions || !Array.isArray(permissions)) {
      return <span className="text-gray-500">No permissions</span>;
    }

    if (permissions.length === 0) {
      return <span className="text-gray-500">No permissions</span>;
    }

    // Extract permission names from objects
    const permissionNames = extractPermissionNames(permissions);
    
    if (permissionNames.length === 0) {
      return <span className="text-gray-500">No permissions</span>;
    }

    return (
      <div className="flex flex-wrap gap-1">
        {permissionNames.slice(0, 3).map((permission, index) => (
          <span
            key={`${permission}-${index}`}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
          >
            {permission}
          </span>
        ))}
        {permissionNames.length > 3 && showViewAll && (
          <button
            onClick={() => setViewingPermissionsRole({ permissions } as Role)}
            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs rounded transition-colors cursor-pointer"
          >
            +{permissionNames.length - 3} more
          </button>
        )}
      </div>
    );
  };

  console.log('RoleManagement: Rendering component', { loading, error, roles: roles.length, availablePermissions: availablePermissions.length });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading roles...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <div className="text-lg text-red-600">Error: {error}</div>
        <Button onClick={fetchRoles} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6" />
            Role Permissions
          </h2>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
        <Dialog open={isAddModalOpen || !!editingRole} onOpenChange={(open) => {
          if (!open) {
            resetForm();
            setIsAddModalOpen(false);
          }
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
              <UserPlus className="w-4 h-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingRole ? 'Edit Role' : 'Add New Role'}
              </DialogTitle>
              <DialogDescription>
                {editingRole ? 'Update role details and permissions' : 'Create a new role with specific permissions'}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Role Name *</Label>
                <Input
                  id="name"
                  value={newRole.name}
                  onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter role name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newRole.description}
                  onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Enter role description"
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                  {availablePermissions.map((permission) => (
                    <div key={permission} className="flex items-center space-x-2">
                      <Checkbox
                        id={permission}
                        checked={newRole.permissions.includes(permission)}
                        onCheckedChange={() => handlePermissionToggle(permission)}
                      />
                      <Label htmlFor={permission} className="text-sm">
                        {permission}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setIsAddModalOpen(false);
                }}>
                  Cancel
                </Button>
                <Button onClick={editingRole ? handleUpdateRole : handleAddRole}>
                  {editingRole ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* View All Permissions Modal */}
      <Dialog open={!!viewingPermissionsRole} onOpenChange={(open) => {
        if (!open) setViewingPermissionsRole(null);
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              All Permissions
            </DialogTitle>
            <DialogDescription>
              Complete list of permissions for this role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {viewingPermissionsRole && (
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {extractPermissionNames(viewingPermissionsRole.permissions).map((permission, index) => (
                  <span
                    key={`${permission}-${index}`}
                    className="px-3 py-2 bg-blue-100 text-blue-800 text-sm rounded"
                  >
                    {permission}
                  </span>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex justify-between items-center">
        <Input
          placeholder="Search roles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles ({filteredRoles.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRoles.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No roles found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Role Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Permissions</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell>
                      {renderPermissions(role.permissions)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEditing(role)}
                          className="gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                        {!protectedRoles.includes(role.name) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRole(role.id, role.name)}
                            className="gap-1 text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
