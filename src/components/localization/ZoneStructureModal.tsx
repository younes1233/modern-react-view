
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash, GripVertical } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Level, ZoneStructure } from "@/services/zoneStructureService";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Zone Structure name must be at least 2 characters.",
  }),
  selectedLevels: z.array(z.object({
    id: z.number(),
  })).min(1, "At least one level is required"),
});

interface ZoneStructureModalProps {
  isOpen: boolean;
  zoneStructure?: ZoneStructure | null;
  onClose: () => void;
  onSave: (data: { name: string; levels: Array<{ id: number }> }) => Promise<void>;
  levels: Level[];
}

export function ZoneStructureModal({
  isOpen,
  zoneStructure,
  onClose,
  onSave,
  levels,
}: ZoneStructureModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      selectedLevels: [{ id: 0 }],
    },
  });

  const { fields, append, remove, move } = useFieldArray({
    control: form.control,
    name: "selectedLevels",
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (zoneStructure) {
      // Convert zone structure levels back to selected level IDs
      const selectedLevelIds = zoneStructure.levels.map(level => {
        const foundLevel = levels.find(l => l.type === level.type);
        return { id: foundLevel?.id || 0 };
      });
      
      form.reset({
        name: zoneStructure.name,
        selectedLevels: selectedLevelIds.length > 0 ? selectedLevelIds : [{ id: 0 }],
      });
    } else {
      form.reset({
        name: "",
        selectedLevels: [{ id: 0 }],
      });
    }
  }, [zoneStructure, form, levels]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await onSave({
        name: data.name,
        levels: data.selectedLevels,
      });
      onClose();
    } catch (error) {
      console.error('Error saving zone structure:', error);
    }
  };

  const addLevel = () => {
    append({ id: 0 });
  };

  const removeLevel = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      move(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const getAvailableLevels = (currentIndex: number) => {
    const selectedIds = form.watch("selectedLevels").map(l => l.id);
    const currentId = form.watch(`selectedLevels.${currentIndex}.id`);
    
    return levels.filter(level => 
      !selectedIds.includes(level.id) || level.id === currentId
    );
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>
            {zoneStructure ? "Edit Zone Structure" : "Create New Zone Structure"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {zoneStructure
              ? "Update the zone structure details."
              : "Enter the details for the new zone structure."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Zone Structure Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel>Levels (in order)</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addLevel}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Level
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div 
                  key={field.id} 
                  className={`flex gap-2 items-center p-2 border rounded ${
                    dragOverIndex === index ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  }`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                  <div className="text-sm text-gray-500 w-8">
                    {index + 1}.
                  </div>
                  <FormField
                    control={form.control}
                    name={`selectedLevels.${index}.id`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Select
                            value={field.value?.toString() || ""}
                            onValueChange={(value) => field.onChange(parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select a level" />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableLevels(index).map((level) => (
                                <SelectItem key={level.id} value={level.id.toString()}>
                                  {level.type} (Depth: {level.depth})
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeLevel(index)}
                    disabled={fields.length === 1}
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <AlertDialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {zoneStructure ? "Update" : "Create"}
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
