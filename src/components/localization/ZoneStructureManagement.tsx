import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  useZoneStructures,
  ZoneStructure as ZoneStructureType,
  Level as LevelType,
  CreateZoneStructureRequest,
  UpdateZoneStructureRequest
} from "@/hooks/useZoneStructures";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { ZoneStructureModal } from "./ZoneStructureModal";

interface ZoneStructure extends ZoneStructureType {
  created_at: string;
  updated_at: string;
}

export function ZoneStructureManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedZoneStructure, setSelectedZoneStructure] = useState<ZoneStructure | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const { toast } = useToast();
  const {
    zoneStructures,
    levels,
    loading,
    error,
    refetch,
    createZoneStructure,
    updateZoneStructure,
    deleteZoneStructure,
  } = useZoneStructures();

  useEffect(() => {
    refetch();
  }, []);

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setSelectedZoneStructure(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedZoneStructure(null);
  };

  const handleEditZoneStructure = (zoneStructure: ZoneStructure) => {
    setSelectedZoneStructure(zoneStructure);
    setIsModalOpen(true);
  };

  const handleDeleteZoneStructure = async (id: number) => {
    try {
      await deleteZoneStructure(id);
      toast({
        title: "Success",
        description: "Zone structure deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to delete zone structure",
        variant: "destructive",
      });
    }
  };

  const handleCreateZoneStructure = async (data: CreateZoneStructureRequest) => {
    try {
      const newZoneStructure = await createZoneStructure(data);
      if (newZoneStructure) {
        // Add default properties for the newly created zone structure
        const zoneStructureWithDefaults = {
          ...newZoneStructure,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setSelectedZoneStructure(zoneStructureWithDefaults);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error creating zone structure:', error);
    }
  };

  const handleUpdateZoneStructure = async (id: number, data: UpdateZoneStructureRequest) => {
    try {
      const updatedZoneStructure = await updateZoneStructure(id, data);
      if (updatedZoneStructure) {
        // Ensure updated zone structure has required properties
        const zoneStructureWithDefaults = {
          ...updatedZoneStructure,
          updated_at: new Date().toISOString()
        };
        setSelectedZoneStructure(zoneStructureWithDefaults);
        setIsModalOpen(false);
      }
    } catch (error) {
      console.error('Error updating zone structure:', error);
    }
  };

  const filteredZoneStructures = selectedLevel
    ? zoneStructures.filter(zs => zs.level_id === selectedLevel)
    : zoneStructures;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Zone Structures</h2>
          <p className="text-muted-foreground">
            Manage zone structures for your store.
          </p>
        </div>
        <Button onClick={handleOpenModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Zone Structure
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Zone Structures List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div>
              <Label htmlFor="level">Filter by Level</Label>
              <Select onValueChange={(value) => setSelectedLevel(value === 'all' ? null : parseInt(value))}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {levels.map((level) => (
                    <SelectItem key={level.id} value={level.id.toString()}>
                      {level.type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <ScrollArea className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Parent</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredZoneStructures.map((zoneStructure) => {
                    const level = levels.find(l => l.id === zoneStructure.level_id);
                    const parent = zoneStructures.find(zs => zs.id === zoneStructure.parent_id);

                    return (
                      <TableRow key={zoneStructure.id}>
                        <TableCell className="font-medium">{zoneStructure.id}</TableCell>
                        <TableCell>{zoneStructure.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{level?.type || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>{parent?.name || 'N/A'}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditZoneStructure(zoneStructure as ZoneStructure)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="sm" className="text-red-500">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This action cannot be undone. Are you sure you want to delete this zone structure?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteZoneStructure(zoneStructure.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredZoneStructures.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        No zone structures found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <ZoneStructureModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={selectedZoneStructure ? handleUpdateZoneStructure : handleCreateZoneStructure}
        zoneStructure={selectedZoneStructure}
        levels={levels}
        zoneStructures={zoneStructures}
      />
    </div>
  );
}
