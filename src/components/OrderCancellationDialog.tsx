import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertTriangle, Package, CheckCircle2, XCircle } from "lucide-react";
import { orderService } from "@/services/orderService";
import { toast } from "@/components/ui/sonner";

interface OrderCancellationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  orderId: string | null;
}

export function OrderCancellationDialog({
  isOpen,
  onClose,
  onSuccess,
  orderId,
}: OrderCancellationDialogProps) {
  const [reason, setReason] = useState("");
  const [restoreInventory, setRestoreInventory] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [impact, setImpact] = useState<any>(null);

  // Fetch cancellation impact when dialog opens
  useEffect(() => {
    if (isOpen && orderId) {
      fetchCancellationImpact();
    } else {
      // Reset state when dialog closes
      setReason("");
      setRestoreInventory(true);
      setImpact(null);
    }
  }, [isOpen, orderId]);

  const fetchCancellationImpact = async () => {
    if (!orderId) return;

    setIsAnalyzing(true);
    try {
      const response = await orderService.getCancellationImpact(orderId);
      setImpact(response.details);
    } catch (error: any) {
      toast.error("Failed to analyze cancellation impact", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCancel = async () => {
    if (!orderId || !reason.trim()) {
      toast.error("Please provide a cancellation reason");
      return;
    }

    setIsCancelling(true);
    try {
      const response = await orderService.cancelOrderAdmin(
        orderId,
        reason.trim(),
        restoreInventory
      );

      if (response.error) {
        toast.error(response.message || "Failed to cancel order");
        return;
      }

      toast.success("Order cancelled successfully", {
        description: `Order #${orderId} has been cancelled`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error("Failed to cancel order", {
        description: error.message || "Please try again",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Cancel Order #{orderId}</DialogTitle>
          <DialogDescription>
            Review the impact and provide a reason for cancellation
          </DialogDescription>
        </DialogHeader>

        {isAnalyzing ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            <span className="ml-3 text-gray-600">Analyzing impact...</span>
          </div>
        ) : impact ? (
          <div className="space-y-4">
            {/* Can Cancel Check */}
            {!impact.can_cancel && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  This order cannot be cancelled. Current status: {impact.current_status}
                </AlertDescription>
              </Alert>
            )}

            {/* Warnings */}
            {impact.warnings && impact.warnings.length > 0 && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="font-semibold mb-2">Warnings:</div>
                  <ul className="list-disc list-inside space-y-1">
                    {impact.warnings.map((warning: string, index: number) => (
                      <li key={index} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Order Info */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 uppercase">Status</div>
                <div className="font-semibold capitalize">{impact.current_status}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 uppercase">Items</div>
                <div className="font-semibold">{impact.items_count}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md">
                <div className="text-xs text-gray-500 uppercase">Payments</div>
                <div className="font-semibold">
                  {impact.has_payment ? (
                    <Badge variant="secondary">{impact.transactions_count}</Badge>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </div>
              </div>
            </div>

            {/* Inventory Impact */}
            {impact.inventory_impact && impact.inventory_impact.length > 0 && (
              <div>
                <Label className="mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Inventory Impact
                </Label>
                <div className="border rounded-md divide-y max-h-48 overflow-y-auto">
                  {impact.inventory_impact.map((item: any, index: number) => (
                    <div key={index} className="p-3 flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          Product #{item.product_id}
                          {item.variant_id && ` - Variant #{item.variant_id}`}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          Quantity to restore: {item.quantity_to_restore} units
                          {item.refunded_quantity > 0 && ` (${item.refunded_quantity} already refunded)`}
                        </div>
                      </div>
                      <div className="text-right">
                        {item.inventory_found ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs">
                              Stock: {item.current_stock ?? 'N/A'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertTriangle className="w-4 h-4" />
                            <span className="text-xs">Not found</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancellation Reason */}
            <div>
              <Label htmlFor="reason">
                Cancellation Reason <span className="text-red-500">*</span>
              </Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter reason for cancellation..."
                className="mt-1"
                maxLength={500}
                disabled={!impact.can_cancel}
              />
              <div className="text-xs text-gray-500 mt-1">
                {reason.length}/500 characters
              </div>
            </div>

            {/* Restore Inventory Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="restore-inventory"
                checked={restoreInventory}
                onCheckedChange={(checked) => setRestoreInventory(checked as boolean)}
                disabled={!impact.can_cancel}
              />
              <Label
                htmlFor="restore-inventory"
                className="text-sm font-normal cursor-pointer"
              >
                Restore inventory after cancellation
              </Label>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCancelling}
          >
            Close
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={
              isCancelling ||
              isAnalyzing ||
              !impact?.can_cancel ||
              !reason.trim()
            }
            className={isCancelling ? "cursor-not-allowed opacity-80" : "hover:opacity-90 active:scale-95 transition-all"}
          >
            {isCancelling ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Cancel Order"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
