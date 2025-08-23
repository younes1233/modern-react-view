
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
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import * as z from "zod";
import { Level, ZoneStructure } from "@/services/zoneStructureService";

const levelSchema = z.object({
  type: z.string().min(1, "Type is required").max(255, "Type must be at most 255 characters"),
  depth: z.string().min(1, "Depth is required"),
});

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Zone Structure name must be at least 2 characters.",
  }),
  levels: z.array(levelSchema).min(1, "At least one level is required"),
});

interface ZoneStructureModalProps {
  isOpen: boolean;
  zoneStructure?: ZoneStructure | null;
  onClose: () => void;
  onSave: (data: { name: string; levels: Array<{ type: string; depth: string }> }) => Promise<void>;
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
      name: zoneStructure?.name || "",
      levels: zoneStructure?.levels || [{ type: "", depth: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "levels",
  });

  useEffect(() => {
    if (zoneStructure) {
      form.reset({
        name: zoneStructure.name,
        levels: zoneStructure.levels.length > 0 ? zoneStructure.levels : [{ type: "", depth: "" }],
      });
    } else {
      form.reset({
        name: "",
        levels: [{ type: "", depth: "" }],
      });
    }
  }, [zoneStructure, form]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving zone structure:', error);
    }
  };

  const addLevel = () => {
    append({ type: "", depth: "" });
  };

  const removeLevel = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
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
                <FormLabel>Levels</FormLabel>
                <Button type="button" variant="outline" size="sm" onClick={addLevel}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Level
                </Button>
              </div>
              
              {fields.map((field, index) => (
                <div key={field.id} className="flex gap-2 items-end">
                  <FormField
                    control={form.control}
                    name={`levels.${index}.type`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Country, State, City" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`levels.${index}.depth`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Depth</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 1, 2, 3" {...field} />
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
                    className="mb-1"
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
