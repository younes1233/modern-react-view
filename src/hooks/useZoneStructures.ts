import { useState, useEffect } from 'react';
import { 
  zoneStructureService, 
  ZoneStructure, 
  Level,
  CreateZoneStructureRequest,
  UpdateZoneStructureRequest,
  CreateLevelRequest,
  UpdateLevelRequest
} from '../services/zoneStructureService';
import { useToast } from '@/hooks/use-toast';

export const useZoneStructures = () => {
  const [zoneStructures, setZoneStructures] = useState<ZoneStructure[]>([]);
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchZoneStructures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await zoneStructureService.getZoneStructures();
      
      if (!response.error && response.details?.zone_structures) {
        setZoneStructures(response.details.zone_structures);
      } else {
        setError(response.message || 'Failed to load zone structures');
        setZoneStructures([]);
      }
    } catch (err) {
      console.error('Error fetching zone structures:', err);
      setError('Failed to load zone structures');
      setZoneStructures([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await zoneStructureService.getLevels();
      
      if (!response.error && response.details?.levels) {
        setLevels(response.details.levels);
      } else {
        console.error('Failed to load levels:', response.message);
        setLevels([]);
      }
    } catch (err) {
      console.error('Error fetching levels:', err);
      setLevels([]);
    }
  };

  const createZoneStructure = async (data: CreateZoneStructureRequest) => {
    try {
      const response = await zoneStructureService.createZoneStructure(data);
      
      if (!response.error && response.details?.zone_structure) {
        setZoneStructures([...zoneStructures, response.details.zone_structure]);
        toast({
          title: "Success",
          description: "Zone structure created successfully",
        });
        return response.details.zone_structure;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create zone structure",
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error creating zone structure:', error);
      throw error;
    }
  };

  const updateZoneStructure = async (id: number, data: UpdateZoneStructureRequest) => {
    try {
      const response = await zoneStructureService.updateZoneStructure(id, data);
      
      if (!response.error && response.details?.zone_structure) {
        setZoneStructures(zoneStructures.map(zs => 
          zs.id === id ? response.details!.zone_structure : zs
        ));
        toast({
          title: "Success",
          description: "Zone structure updated successfully",
        });
        return response.details.zone_structure;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update zone structure",
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating zone structure:', error);
      throw error;
    }
  };

  const deleteZoneStructure = async (id: number) => {
    try {
      const response = await zoneStructureService.deleteZoneStructure(id);
      
      if (!response.error) {
        setZoneStructures(zoneStructures.filter(zs => zs.id !== id));
        toast({
          title: "Success",
          description: "Zone structure deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete zone structure",
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting zone structure:', error);
      throw error;
    }
  };

  const createLevel = async (data: CreateLevelRequest) => {
    try {
      const response = await zoneStructureService.createLevel(data);
      
      if (!response.error && response.details?.level) {
        setLevels([...levels, response.details.level]);
        toast({
          title: "Success",
          description: "Level created successfully",
        });
        return response.details.level;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create level",
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error creating level:', error);
      throw error;
    }
  };

  const updateLevel = async (id: number, data: UpdateLevelRequest) => {
    try {
      const response = await zoneStructureService.updateLevel(id, data);
      
      if (!response.error && response.details?.level) {
        setLevels(levels.map(level => 
          level.id === id ? response.details!.level : level
        ));
        toast({
          title: "Success",
          description: "Level updated successfully",
        });
        return response.details.level;
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update level",
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error updating level:', error);
      throw error;
    }
  };

  const deleteLevel = async (id: number) => {
    try {
      const response = await zoneStructureService.deleteLevel(id);
      
      if (!response.error) {
        setLevels(levels.filter(level => level.id !== id));
        toast({
          title: "Success",
          description: "Level deleted successfully",
        });
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete level",
          variant: "destructive",
        });
        throw new Error(response.message);
      }
    } catch (error) {
      console.error('Error deleting level:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchZoneStructures();
    fetchLevels();
  }, []);

  return {
    zoneStructures,
    levels,
    loading,
    error,
    refetch: () => {
      fetchZoneStructures();
      fetchLevels();
    },
    createZoneStructure,
    updateZoneStructure,
    deleteZoneStructure,
    createLevel,
    updateLevel,
    deleteLevel,
  };
};

export {
  type ZoneStructure,
  type Level,
  type CreateZoneStructureRequest,
  type UpdateZoneStructureRequest,
  useZoneStructures
};
