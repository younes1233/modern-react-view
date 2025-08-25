
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
  ZoneStructure,
  Level,
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
      await createZoneStructure(data);
    } catch (error) {
      console.error('Error creating zone structure:', error);
    }
  };

  const handleUpdateZoneStructure = async (data: UpdateZoneStructureRequest) => {
    if (!selectedZoneStructure) return;
    
    try {
      await updateZoneStructure(selectedZoneStructure.id, data);
    } catch (error) {
      console.error('Error updating zone structure:', error);
    }
  };

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
            <ScrollArea className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Levels</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zoneStructures.map((zoneStructure) => (
                    <TableRow key={zoneStructure.id}>
                      <TableCell className="font-medium">{zoneStructure.id}</TableCell>
                      <TableCell>{zoneStructure.name}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {zoneStructure.levels.map((level, index) => (
                            <Badge key={index} variant="secondary">
                              {level.type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditZoneStructure(zoneStructure)}
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
                  ))}
                  {zoneStructures.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center">
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
      />
    </div>
  );
}
