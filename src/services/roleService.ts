
import { BaseApiService } from './baseApiService';

export interface Role {
  id: number;
  name: string;
  description?: string;
  permissions: string[];
}

export interface RoleResponse {
  error: boolean;
  message: string;
  details: {
    roles: Role[];
  };
}

export interface SingleRoleResponse {
  error: boolean;
  message: string;
  details: {
    role: Role;
  };
}

export interface PermissionsResponse {
  error: boolean;
  message: string;
  details: {
    permissions: string[];
  };
}

export interface AssignableRolesResponse {
  error: boolean;
  message: string;
  details: {
    roles: string[];
  };
}

export interface AssignableRolesAndPermissionsResponse {
  error: boolean;
  message: string;
  details: {
    roles: string[];
    permissions: string[];
  };
}

export interface UserWithRoleResponse {
  error: boolean;
  message: string;
  details: {
    user: {
      id: number;
      name: string;
      roles: string[];
      permissions: string[];
    };
  };
}

class RoleService extends BaseApiService {
  setToken(token: string) {
    super.setToken(token);
  }

  removeToken() {
    super.removeToken();
  }

  async getRoles(): Promise<RoleResponse> {
    return this.get<RoleResponse>('/roles');
  }

  async createRole(name: string, description?: string, permissions?: string[]): Promise<SingleRoleResponse> {
    return this.post<SingleRoleResponse>('/roles', {
      name,
      description,
      permissions
    });
  }

  async updateRole(roleId: number, name: string, description?: string, permissions?: string[]): Promise<SingleRoleResponse> {
    return this.put<SingleRoleResponse>(`/roles/${roleId}`, {
      name,
      description,
      permissions
    });
  }

  async deleteRole(roleId: number): Promise<{ error: boolean; message: string; details: [] }> {
    return this.delete<{ error: boolean; message: string; details: [] }>(`/roles/${roleId}`);
  }

  async getRolePermissions(roleId: number): Promise<PermissionsResponse> {
    return this.get<PermissionsResponse>(`/roles/${roleId}/permissions`);
  }

  async getAssignableRoles(): Promise<AssignableRolesResponse> {
    return this.get<AssignableRolesResponse>('/roles/available');
  }

  async getAssignableRolesAndPermissions(): Promise<AssignableRolesAndPermissionsResponse> {
    return this.get<AssignableRolesAndPermissionsResponse>('/roles/available-for-assignment');
  }

  async assignRoleToUser(userId: number, role: string): Promise<UserWithRoleResponse> {
    return this.post<UserWithRoleResponse>(`/users/${userId}/assign-role`, {
      role
    });
  }
}

export const roleService = new RoleService();
