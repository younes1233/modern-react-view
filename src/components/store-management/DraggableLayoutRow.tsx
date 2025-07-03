
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Trash2, GripVertical, Image, Package } from "lucide-react";
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
import { Banner } from "@/hooks/useBanners";

interface DraggableLayoutRowProps {
  section: any;
  item: any;
  onToggleActive: (sectionId: number) => void;
  onDeleteSection: (sectionId: number) => void;
}

export function DraggableLayoutRow({ 
  section, 
  item, 
  onToggleActive, 
  onDeleteSection 
}: DraggableLayoutRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getTypeBadge = (type: string) => {
    return type === 'banner' ? (
      <Badge className="bg-blue-100 text-blue-800">
        <Image className="w-3 h-3 mr-1" />
        Banner
      </Badge>
    ) : (
      <Badge className="bg-green-100 text-green-800">
        <Package className="w-3 h-3 mr-1" />
        Products
      </Badge>
    );
  };

  return (
    <tr 
      ref={setNodeRef}
      style={style}
      className={`border-b hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
        isDragging ? 'bg-gray-100 dark:bg-gray-700' : ''
      }`}
    >
      <td className="p-4">
        <div className="flex items-center gap-2">
          <div 
            {...attributes} 
            {...listeners}
            className="cursor-grab active:cursor-grabbing"
          >
            <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </div>
          <span className="font-medium">{section.order}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center gap-3">
          {item && (
            <>
              <img 
                src={section.type === 'banner' ? (item as Banner).image : '/placeholder.svg'} 
                alt={(item as any).title} 
                className="w-16 h-12 rounded-lg bg-gray-200 dark:bg-gray-700 object-cover" 
              />
              <div>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {(item as any).title}
                </span>
                {(item as any).subtitle && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {(item as any).subtitle}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </td>
      <td className="p-4">{getTypeBadge(section.type)}</td>
      <td className="p-4">
        <Badge variant={section.is_active ? "default" : "secondary"}>
          {section.is_active ? "Active" : "Inactive"}
        </Badge>
      </td>
      <td className="p-4">
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onToggleActive(section.id)}
            title={section.is_active ? "Hide" : "Show"}
          >
            {section.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove Section</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to remove this section from the home page?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => onDeleteSection(section.id)}>
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </td>
    </tr>
  );
}
