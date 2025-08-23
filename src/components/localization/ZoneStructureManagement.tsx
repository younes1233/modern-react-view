import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, Layers } from "lucide-react";
import { ZoneStructureModal } from "./ZoneStructureModal";
import { LevelModal } from "./LevelModal";
import { useZoneStructures } from "@/hooks/useZoneStructures";
import { ZoneStructure, Level } from "@/services/zoneStructureService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ZoneStructureManagement = () => {
  const { 
    zoneStructures, 
    levels, 
    loading, 
    error, 
    createZoneStructure, 
    updateZoneStructure, 
    deleteZoneStructure,
    createLevel,
    updateLevel,
    deleteLevel
  } = useZoneStructures();

  const [isZoneStructureModalOpen, setIsZoneStructureModalOpen] = useState(false);
  const [isLevelModalOpen, setIsLevelModalOpen] = useState(false);
  const [editingZoneStructure, setEditingZoneStructure] = useState<ZoneStructure | null>(null);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);

  const handleAddZoneStructure = () => {
    setEditingZoneStructure(null);
    setIsZoneStructureModalOpen(true);
  };

  const handleEditZoneStructure = (zoneStructure: ZoneStructure) => {
    setEditingZoneStructure(zoneStructure);
    setIsZoneStructureModalOpen(true);
  };

  const handleDeleteZoneStructure = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this zone structure?')) {
      await deleteZoneStructure(id);
    }
  };

  const handleSaveZoneStructure = async (data: { name: string; levels: Array<{ id: number }> }) => {
    try {
      if (editingZoneStructure) {
        await updateZoneStructure(editingZoneStructure.id, data);
      } else {
        await createZoneStructure(data);
      }
      setIsZoneStructureModalOpen(false);
      setEditingZoneStructure(null);
    } catch (error) {
      console.error('Error saving zone structure:', error);
    }
  };

  const handleAddLevel = () => {
    setEditingLevel(null);
    setIsLevelModalOpen(true);
  };

  const handleEditLevel = (level: Level) => {
    setEditingLevel(level);
    setIsLevelModalOpen(true);
  };

  const handleDeleteLevel = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this level?')) {
      await deleteLevel(id);
    }
  };

  const handleSaveLevel = async (data: { type: string }) => {
    try {
      if (editingLevel) {
        await updateLevel(editingLevel.id, data);
      } else {
        await createLevel(data);
      }
      setIsLevelModalOpen(false);
      setEditingLevel(null);
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading zone structures...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="zone-structures" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="zone-structures" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Zone Structures
          </TabsTrigger>
          <TabsTrigger value="levels" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Levels
          </TabsTrigger>
        </TabsList>

        <TabsContent value="zone-structures" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Zone Structures</CardTitle>
                  <CardDescription>Manage zone structures by selecting and ordering levels</CardDescription>
                </div>
                <Button onClick={handleAddZoneStructure}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Zone Structure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {zoneStructures.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No zone structures found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Levels (in order)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {zoneStructures.map((zoneStructure) => (
                      <TableRow key={zoneStructure.id}>
                        <TableCell className="font-medium">{zoneStructure.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {zoneStructure.levels.map((level, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {index + 1}. {level.type} (D: {level.depth})
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditZoneStructure(zoneStructure)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteZoneStructure(zoneStructure.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Levels</CardTitle>
                  <CardDescription>Manage levels that can be assigned to zone structures</CardDescription>
                </div>
                <Button onClick={handleAddLevel}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Level
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {levels.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No levels found.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type</TableHead>
                      <TableHead>Depth</TableHead>
                      <TableHead>Zone Structures Count</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {levels.map((level) => (
                      <TableRow key={level.id}>
                        <TableCell className="font-medium">{level.type}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{level.depth}</Badge>
                        </TableCell>
                        <TableCell>{level.zone_structures_count}</TableCell>
                        <TableCell>{new Date(level.created_at).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditLevel(level)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteLevel(level.id)}
                              disabled={level.zone_structures_count > 0}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ZoneStructureModal
        isOpen={isZoneStructureModalOpen}
        onClose={() => setIsZoneStructureModalOpen(false)}
        onSave={handleSaveZoneStructure}
        zoneStructure={editingZoneStructure}
        levels={levels}
      />

      <LevelModal
        isOpen={isLevelModalOpen}
        onClose={() => setIsLevelModalOpen(false)}
        onSave={handleSaveLevel}
        level={editingLevel}
      />
    </div>
  );
};
