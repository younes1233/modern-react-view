
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { WarehouseModal } from "./WarehouseModal";

interface Warehouse {
  id: number;
  name: string;
  code: string;
  address: string;
  countryCode: string;
  countryName: string;
  capacity: number;
  isActive: boolean;
}

// Mock data
const mockWarehouses: Warehouse[] = [
  { 
    id: 1, 
    name: "New York Distribution Center", 
    code: "NYC-DC", 
    address: "123 Industrial Ave, New York, NY", 
    countryCode: "US", 
    countryName: "United States",
    capacity: 10000,
    isActive: true 
  },
  { 
    id: 2, 
    name: "London Warehouse", 
    code: "LON-WH", 
    address: "456 Storage St, London, UK", 
    countryCode: "GB", 
    countryName: "United Kingdom",
    capacity: 7500,
    isActive: true 
  },
  { 
    id: 3, 
    name: "Berlin Logistics Hub", 
    code: "BER-LH", 
    address: "789 Logistics Blvd, Berlin, Germany", 
    countryCode: "DE", 
    countryName: "Germany",
    capacity: 12000,
    isActive: false 
  },
];

export const WarehouseManagement = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>(mockWarehouses);
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

  const handleDeleteWarehouse = (id: number) => {
    setWarehouses(warehouses.filter(warehouse => warehouse.id !== id));
  };

  const handleSaveWarehouse = (warehouseData: Omit<Warehouse, 'id'>) => {
    if (editingWarehouse) {
      setWarehouses(warehouses.map(warehouse => 
        warehouse.id === editingWarehouse.id 
          ? { ...warehouseData, id: editingWarehouse.id }
          : warehouse
      ));
    } else {
      const newWarehouse = { ...warehouseData, id: Date.now() };
      setWarehouses([...warehouses, newWarehouse]);
    }
    setIsModalOpen(false);
    setEditingWarehouse(null);
  };

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Status</TableHead>
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
                    <Badge variant="secondary">{warehouse.countryName}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{warehouse.address}</TableCell>
                  <TableCell>{warehouse.capacity.toLocaleString()} sq ft</TableCell>
                  <TableCell>
                    <Badge variant={warehouse.isActive ? "default" : "secondary"}>
                      {warehouse.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
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
