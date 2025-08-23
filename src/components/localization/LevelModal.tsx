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
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createLevel, updateLevel } from "@/lib/api/level.api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  type: z.string().min(2, {
    message: "Level type must be at least 2 characters.",
  }),
  depth: z.string().min(1, {
    message: "Level depth must be at least 1 character.",
  }),
})

interface LevelModalProps {
  open: boolean;
  onClose: () => void;
  level?: {
    id: number;
    type: string;
    depth: string;
  };
  onLevelCreated?: () => void;
  onLevelUpdated?: () => void;
}

export function LevelModal({ open, onClose, level, onLevelCreated, onLevelUpdated }: LevelModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: level?.type || "",
      depth: level?.depth || "",
    },
  })

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

  const handleSubmit = async (data: { type?: string; depth?: string }) => {
    try {
      // Ensure required fields are present
      if (!data.type || !data.depth) {
        console.error('Type and depth are required');
        return;
      }

      const levelData = {
        type: data.type,
        depth: data.depth
      };

      if (level) {
        await updateLevel(level.id, levelData);
        onLevelUpdated?.();
      } else {
        await createLevel(levelData);
        onLevelCreated?.();
      }
      onClose();
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{level ? "Edit Level" : "Create New Level"}</AlertDialogTitle>
          <AlertDialogDescription>
            {level
              ? "Update the level details."
              : "Add a new level to the zone structure."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Level Type</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter level type" {...field} />
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
                  <FormLabel>Level Depth</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter level depth" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button type="submit">{level ? "Update" : "Create"}</Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
