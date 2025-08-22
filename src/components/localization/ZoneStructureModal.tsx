
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ZoneStructure, Level } from "@/services/zoneStructureService";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  level_ids: z.array(z.number()).min(1, "At least one level must be selected"),
});

interface ZoneStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; level_ids: number[] }) => Promise<void>;
  zoneStructure?: ZoneStructure | null;
  levels: Level[];
}

export const ZoneStructureModal = ({ 
  isOpen, 
  onClose, 
  onSave, 
  zoneStructure, 
  levels 
}: ZoneStructureModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      level_ids: [],
    },
  });

  useEffect(() => {
    if (zoneStructure) {
      // Convert levels to level_ids by matching type and depth
      const levelIds = zoneStructure.levels.map(zsLevel => {
        const matchingLevel = levels.find(level => 
          level.type === zsLevel.type && level.depth === zsLevel.depth
        );
        return matchingLevel ? matchingLevel.id : null;
      }).filter(id => id !== null) as number[];

      form.reset({
        name: zoneStructure.name,
        level_ids: levelIds,
      });
    } else {
      form.reset({
        name: "",
        level_ids: [],
      });
    }
  }, [zoneStructure, levels, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await onSave(values);
      onClose();
    } catch (error) {
      console.error('Error saving zone structure:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>
            {zoneStructure ? "Edit Zone Structure" : "Add Zone Structure"}
          </DialogTitle>
          <DialogDescription>
            {zoneStructure ? "Update the zone structure details below." : "Create a new zone structure by selecting levels."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter zone structure name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="level_ids"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Levels</FormLabel>
                    <FormDescription>
                      Select the levels that belong to this zone structure.
                    </FormDescription>
                  </div>
                  {levels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No levels available. Create levels first to assign them to zone structures.
                    </p>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {levels.map((level) => (
                        <FormField
                          key={level.id}
                          control={form.control}
                          name="level_ids"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={level.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(level.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, level.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== level.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="text-sm font-normal">
                                  {level.type} (Depth: {level.depth})
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || levels.length === 0}>
                {isSubmitting ? "Saving..." : zoneStructure ? "Update Zone Structure" : "Create Zone Structure"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
