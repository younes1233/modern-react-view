import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToggleFeaturedButton } from '@/components/ui/toggle-featured-button';
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
} from '@/components/ui/alert-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Package,
  DollarSign,
  Star,
  GripVertical,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react';
import { Category } from '@/services/categoryService';

interface DraggableCategoryRowProps {
  category: Category;
  onToggleExpand: (categoryId: number) => void;
  onToggleFeatured: (categoryId: number, currentFeatured: boolean) => void;
  onAddSubcategory: (category: Category) => void;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: number) => void;
  getCategoryPath: (category: Category) => string;
  loading: boolean;
}

export function DraggableCategoryRow({
  category,
  onToggleExpand,
  onToggleFeatured,
  onAddSubcategory,
  onEditCategory,
  onDeleteCategory,
  getCategoryPath,
  loading
}: DraggableCategoryRowProps) {
  const hasChildren = category.children && category.children.length > 0;
  const indentLevel = (category.level || 0) * 24;
  const displayImage = category.images?.urls?.original || category.image;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div>
      <div
        ref={setNodeRef}
        style={style}
        className={`flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
          isDragging ? 'bg-gray-100 dark:bg-gray-700 shadow-lg' : ''
        }`}
      >
        <div className="flex items-center gap-3 flex-1" style={{ paddingLeft: `${indentLevel}px` }}>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1"
            title="Drag to reorder"
          >
            <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </div>

          {hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 w-6 h-6"
              onClick={() => onToggleExpand(category.id!)}
            >
              {category.isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          ) : (
            <div className="w-6" />
          )}

          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
            {displayImage ? (
              <img src={displayImage} alt={category.name} className="w-8 h-8 rounded object-cover" />
            ) : (
              <Package className="w-6 h-6 text-blue-600" />
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">{category.name}</h3>
              {category.level === 0 && <Star className="w-4 h-4 text-yellow-500" />}
              <Badge className={category.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                {category.is_active ? 'active' : 'inactive'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">{category.description || ''}</p>
            {category.level && category.level > 0 && (
              <p className="text-xs text-gray-500">
                {getCategoryPath(category)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{(category.products || 0)}</span>
            </div>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 text-green-600">
              <DollarSign className="w-4 h-4" />
              <span className="font-bold">${(category.revenue || 0).toLocaleString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ToggleFeaturedButton
              isFeatured={category.featured}
              onToggle={() => onToggleFeatured(category.id!, category.featured)}
              disabled={loading}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddSubcategory(category)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditCategory(category)}
              className="text-gray-600 hover:text-gray-700"
            >
              <Edit className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{category.name}"? This action cannot be undone and will also delete all subcategories.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteCategory(category.id!)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditCategory(category)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAddSubcategory(category)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Subcategory
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => onDeleteCategory(category.id!)}
                  className="text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {hasChildren && category.isExpanded && category.children?.map(child => (
        <DraggableCategoryRow
          key={child.id}
          category={child}
          onToggleExpand={onToggleExpand}
          onToggleFeatured={onToggleFeatured}
          onAddSubcategory={onAddSubcategory}
          onEditCategory={onEditCategory}
          onDeleteCategory={onDeleteCategory}
          getCategoryPath={getCategoryPath}
          loading={loading}
        />
      ))}
    </div>
  );
}
