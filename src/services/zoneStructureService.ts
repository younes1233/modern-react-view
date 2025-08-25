import BaseApiService, { ApiResponse } from './baseApiService';

export interface Level {
  id: number;
  type: string;
  depth: string;
  zone_structures_count: number;
  created_at: string;
  updated_at: string;
}

export interface ZoneStructureLevel {
  id: number;
  depth: string;
  type: string;
}

export interface ZoneStructure {
  id: number;
  name: string;
  levels: ZoneStructureLevel[];
  created_at: string;
  updated_at: string;
}

export interface ZoneStructuresResponse {
  zone_structures: ZoneStructure[];
}

export interface ZoneStructureResponse {
  zone_structure: ZoneStructure;
}

export interface LevelsResponse {
  levels: Level[];
}

export interface LevelResponse {
  level: Level;
}

export interface CreateZoneStructureRequest {
  name: string;
  levels: Array<{
    id: number;
  }>;
}

export interface UpdateZoneStructureRequest {
  name?: string;
  levels?: Array<{
    id: number;
  }>;
}

export interface CreateLevelRequest {
  type: string;
}

export interface UpdateLevelRequest {
  type?: string;
}

class ZoneStructureService extends BaseApiService {
  // Zone Structure methods
  async getZoneStructures(): Promise<ApiResponse<ZoneStructuresResponse>> {
    return this.get<ApiResponse<ZoneStructuresResponse>>('/admin/zone-structures');
  }

  async createZoneStructure(data: CreateZoneStructureRequest): Promise<ApiResponse<ZoneStructureResponse>> {
    return this.post<ApiResponse<ZoneStructureResponse>>('/admin/zone-structures', data);
  }

  async updateZoneStructure(id: number, data: UpdateZoneStructureRequest): Promise<ApiResponse<ZoneStructureResponse>> {
    return this.put<ApiResponse<ZoneStructureResponse>>(`/admin/zone-structures/${id}`, data);
  }

  async deleteZoneStructure(id: number): Promise<ApiResponse> {
    return this.delete<ApiResponse>(`/admin/zone-structures/${id}`);
  }

  // Level methods
  async getLevels(): Promise<ApiResponse<LevelsResponse>> {
    return this.get<ApiResponse<LevelsResponse>>('/admin/levels');
  }

  async createLevel(data: CreateLevelRequest): Promise<ApiResponse<LevelResponse>> {
    return this.post<ApiResponse<LevelResponse>>('/admin/levels', data);
  }

  async updateLevel(id: number, data: UpdateLevelRequest): Promise<ApiResponse<LevelResponse>> {
    return this.put<ApiResponse<LevelResponse>>(`/admin/levels/${id}`, data);
  }

  async deleteLevel(id: number): Promise<ApiResponse> {
    return this.delete<ApiResponse>(`/admin/levels/${id}`);
  }
}

export const zoneStructureService = new ZoneStructureService();
