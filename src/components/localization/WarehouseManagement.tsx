
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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { WarehouseModal } from "./WarehouseModal";
import { useWarehouses } from "@/hooks/useWarehouses";
import { Warehouse } from "@/services/warehouseService";

export const WarehouseManagement = () => {
  const { warehouses, loading, error, createWarehouse, updateWarehouse, deleteWarehouse } = useWarehouses();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);

  const handleAddWarehouse = () => {
    setEditingWarehouse(null);
    setIsModalOpen(true);
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setIsModalOpen(true);
  };

  const handleDeleteWarehouse = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      await deleteWarehouse(id);
    }
  };

  const handleSaveWarehouse = async (warehouseData: {
    name: string;
    country_id: number;
    location: string;
    zone_structure_id?: number;
    code: string;
  }) => {
    try {
      if (editingWarehouse) {
        await updateWarehouse(editingWarehouse.id, warehouseData);
      } else {
        await createWarehouse(warehouseData);
      }
      setIsModalOpen(false);
      setEditingWarehouse(null);
    } catch (error) {
      console.error('Error saving warehouse:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="ml-2">Loading warehouses...</span>
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Warehouses</CardTitle>
              <CardDescription>Manage warehouses and their locations</CardDescription>
            </div>
            <Button onClick={handleAddWarehouse}>
              <Plus className="w-4 h-4 mr-2" />
              Add Warehouse
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {warehouses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No warehouses found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Country</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Zone Structure</TableHead>
                  <TableHead>Products</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell className="font-medium">{warehouse.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{warehouse.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{warehouse.country.flag}</span>
                        <Badge variant="secondary">{warehouse.country.name}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{warehouse.location}</TableCell>
                    <TableCell>
                      {warehouse.has_zone_structure && warehouse.zone_structure ? (
                        <Badge variant="default">{warehouse.zone_structure.name}</Badge>
                      ) : (
                        <Badge variant="secondary">No Structure</Badge>
                      )}
                    </TableCell>
                    <TableCell>{warehouse.products_count}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditWarehouse(warehouse)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWarehouse(warehouse.id)}
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

      <WarehouseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveWarehouse}
        warehouse={editingWarehouse}
      />
    </div>
  );
};
