
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Level } from "@/services/zoneStructureService";

const formSchema = z.object({
  type: z.string().min(1, "Type is required"),
  depth: z.string().min(1, "Depth is required"),
});

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { type: string; depth: string }) => Promise<void>;
  level?: Level | null;
}

export const LevelModal = ({ isOpen, onClose, onSave, level }: LevelModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: "",
      depth: "",
    },
  });

  useEffect(() => {
    if (level) {
      form.reset({
        type: level.type,
        depth: level.depth,
      });
    } else {
      form.reset({
        type: "",
        depth: "",
      });
    }
  }, [level, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await onSave(values);
      onClose();
    } catch (error) {
      console.error('Error saving level:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {level ? "Edit Level" : "Add Level"}
          </DialogTitle>
          <DialogDescription>
            {level ? "Update the level details below." : "Create a new level for zone structures."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter level type (e.g., Zone, Aisle, Shelf)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="depth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depth</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter depth level (e.g., 1, 2, 3)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : level ? "Update Level" : "Create Level"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
