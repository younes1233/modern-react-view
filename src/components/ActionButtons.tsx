
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Edit, Trash2, Eye, MoreHorizontal, Download, Mail } from "lucide-react";
import { toast } from '@/components/ui/sonner';

interface ActionButtonsProps {
  itemId: string | number;
  itemName?: string;
  onView?: (id: string | number) => void;
  onEdit?: (id: string | number) => void;
  onDelete?: (id: string | number) => void;
  onDownload?: (id: string | number) => void;
  onEmail?: (id: string | number) => void;
  showView?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  showDownload?: boolean;
  showEmail?: boolean;
  variant?: "default" | "compact";
}

export function ActionButtons({
  itemId,
  itemName,
  onView,
  onEdit,
  onDelete,
  onDownload,
  onEmail,
  showView = true,
  showEdit = true,
  showDelete = true,
  showDownload = false,
  showEmail = false,
  variant = "default"
}: ActionButtonsProps) {
  // Removed useToast hook;

  const handleView = () => {
    onView?.(itemId);
    toast({
      title: "Viewing item",
      description: `Opening details for ${itemName || `item ${itemId}`}`,
    });
  };

  const handleEdit = () => {
    onEdit?.(itemId);
    toast({
      title: "Edit mode",
      description: `Editing ${itemName || `item ${itemId}`}`,
    });
  };

  const handleDelete = () => {
    onDelete?.(itemId);
    toast({
      title: "Item deleted",
      description: `${itemName || `Item ${itemId}`} has been deleted`,
      variant: "destructive",
    });
  };

  const handleDownload = () => {
    onDownload?.(itemId);
    toast({
      title: "Download started",
      description: `Downloading ${itemName || `item ${itemId}`}`,
    });
  };

  const handleEmail = () => {
    onEmail?.(itemId);
    toast({
      title: "Email sent",
      description: `Email notification sent for ${itemName || `item ${itemId}`}`,
    });
  };

  if (variant === "compact") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border shadow-lg">
          {showView && (
            <DropdownMenuItem onClick={handleView} className="hover:bg-gray-50">
              <Eye className="mr-2 h-4 w-4" />
              View
            </DropdownMenuItem>
          )}
          {showEdit && (
            <DropdownMenuItem onClick={handleEdit} className="hover:bg-gray-50">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
          )}
          {showDownload && (
            <DropdownMenuItem onClick={handleDownload} className="hover:bg-gray-50">
              <Download className="mr-2 h-4 w-4" />
              Download
            </DropdownMenuItem>
          )}
          {showEmail && (
            <DropdownMenuItem onClick={handleEmail} className="hover:bg-gray-50">
              <Mail className="mr-2 h-4 w-4" />
              Email
            </DropdownMenuItem>
          )}
          {showDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="hover:bg-red-50 text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete {itemName || `item ${itemId}`}.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-1">
      {showView && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleView}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Eye className="w-4 h-4" />
        </Button>
      )}
      {showEdit && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleEdit}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Edit className="w-4 h-4" />
        </Button>
      )}
      {showDownload && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleDownload}
          className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <Download className="w-4 h-4" />
        </Button>
      )}
      {showEmail && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleEmail}
          className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
        >
          <Mail className="w-4 h-4" />
        </Button>
      )}
      {showDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete {itemName || `item ${itemId}`}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
