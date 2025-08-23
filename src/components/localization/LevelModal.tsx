
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
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

const formSchema = z.object({
  type: z.string().min(1, {
    message: "Level type is required.",
  }).max(255, {
    message: "Level type must be at most 255 characters.",
  }),
});

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  level?: {
    id: number;
    type: string;
    depth: string;
  } | null;
  onSave: (data: { type: string }) => Promise<void>;
}

export function LevelModal({ isOpen, onClose, level, onSave }: LevelModalProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: level?.type || "",
    },
  });

  useEffect(() => {
    if (level) {
      form.reset({
        type: level.type,
      });
    } else {
      form.reset({
        type: "",
      });
    }
  }, [level, form]);

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving level:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{level ? "Edit Level" : "Create New Level"}</AlertDialogTitle>
          <AlertDialogDescription>
            {level
              ? "Update the level details."
              : "Add a new level to the system."}
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
                    <Input placeholder="Enter level type (e.g., Country, State, City)" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <AlertDialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{level ? "Update" : "Create"}</Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
