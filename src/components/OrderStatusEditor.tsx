import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Edit, Package, Truck, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from '@/components/ui/sonner';

interface OrderStatus {
  value: string;
  label: string;
  color: string;
  icon: string;
}

interface OrderStatusEditorProps {
  orderId: string;
  currentStatus: string;
  statuses: OrderStatus[];
  onStatusChange: (orderId: string, newStatus: string) => void;
}

const iconMap: Record<string, any> = {
  'clock': Clock,
  'package': Package,
  'truck': Truck,
  'check-circle': CheckCircle,
  'x-circle': XCircle,
};

export const OrderStatusEditor: React.FC<OrderStatusEditorProps> = ({
  orderId,
  currentStatus,
  statuses,
  onStatusChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  // Removed useToast hook;

  const statusOptions = useMemo(() => {
    return statuses.map(status => ({
      ...status,
      icon: iconMap[status.icon] || Clock,
      colorClass: `bg-${status.color}-100 text-${status.color}-800`,
    }));
  }, [statuses]);

  const handleStatusUpdate = () => {
    if (selectedStatus !== currentStatus) {
      onStatusChange(orderId, selectedStatus);
      toast({
        title: "Status Updated",
        description: `Order ${orderId} status changed to ${selectedStatus}`,
      });
    }
    setIsOpen(false);
  };

  const getCurrentStatusOption = () => {
    return statusOptions.find(option => option.value === currentStatus);
  };

  const currentOption = getCurrentStatusOption();
  const IconComponent = currentOption?.icon || Clock;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="p-1 h-auto">
          <Badge className={`${currentOption?.colorClass} hover:opacity-80 cursor-pointer flex items-center gap-1`}>
            <IconComponent className="w-3 h-3" />
            {currentOption?.label}
            <Edit className="w-3 h-3 ml-1" />
          </Badge>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Order Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Order: <span className="font-medium">{orderId}</span>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => {
                  const StatusIcon = status.icon;
                  return (
                    <SelectItem key={status.value} value={status.value}>
                      <div className="flex items-center gap-2">
                        <StatusIcon className="w-4 h-4" />
                        {status.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStatusUpdate}>
              Update Status
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
