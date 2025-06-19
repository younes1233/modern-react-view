
import React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, Download, Mail, MoreHorizontal, Package, Truck, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OrderActionsProps {
  orderId: string;
  orderStatus: string;
  onView: (orderId: string) => void;
  onEdit: (orderId: string) => void;
  onDelete: (orderId: string) => void;
  onDownload: (orderId: string) => void;
  onEmail: (orderId: string) => void;
  onTrack?: (orderId: string) => void;
  onRefund?: (orderId: string) => void;
}

export const OrderActions: React.FC<OrderActionsProps> = ({
  orderId,
  orderStatus,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onEmail,
  onTrack,
  onRefund,
}) => {
  const { toast } = useToast();

  const handleTrackOrder = () => {
    if (onTrack) {
      onTrack(orderId);
    } else {
      toast({
        title: "Tracking Order",
        description: `Tracking information for order ${orderId}`,
      });
    }
  };

  const handleRefund = () => {
    if (onRefund) {
      onRefund(orderId);
    } else {
      toast({
        title: "Processing Refund",
        description: `Refund initiated for order ${orderId}`,
      });
    }
  };

  const canBeTracked = ["shipped", "delivered"].includes(orderStatus);
  const canBeRefunded = ["delivered", "shipped"].includes(orderStatus);

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onView(orderId)}
        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
      >
        <Eye className="w-4 h-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onEdit(orderId)}
        className="text-gray-600 hover:text-gray-700"
      >
        <Edit className="w-4 h-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-gray-600">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => onDownload(orderId)}>
            <Download className="w-4 h-4 mr-2" />
            Download Invoice
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onEmail(orderId)}>
            <Mail className="w-4 h-4 mr-2" />
            Send Email
          </DropdownMenuItem>
          
          {canBeTracked && (
            <DropdownMenuItem onClick={handleTrackOrder}>
              <Truck className="w-4 h-4 mr-2" />
              Track Package
            </DropdownMenuItem>
          )}
          
          {canBeRefunded && (
            <DropdownMenuItem onClick={handleRefund}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Process Refund
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Order
              </DropdownMenuItem>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Order</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete order {orderId}? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(orderId)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
