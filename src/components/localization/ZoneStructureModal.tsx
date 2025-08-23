
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useToast } from "@/components/ui/use-toast";
import { Level, ZoneStructure } from "@/services/zoneStructureService";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Zone Structure name must be at least 2 characters.",
  }),
  level_ids: z.array(z.number()).optional(),
});

interface ZoneStructureModalProps {
  isOpen: boolean;
  zoneStructure?: ZoneStructure | null;
  onClose: () => void;
  onSave: (data: { name: string; level_ids: number[] }) => Promise<void>;
  levels: Level[];
}

export function ZoneStructureModal({
  isOpen,
  zoneStructure,
  onClose,
  onSave,
  levels,
}: ZoneStructureModalProps) {
  const [selectedLevelIds, setSelectedLevelIds] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (zoneStructure) {
      setSelectedLevelIds(zoneStructure.levels.map((level) => level.id || 0));
    } else {
      setSelectedLevelIds([]);
    }
  }, [zoneStructure]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: zoneStructure?.name || "",
      level_ids: zoneStructure?.levels?.map((level) => level.id || 0) || [],
    },
  });

  const handleCheckboxChange = (levelId: number) => {
    setSelectedLevelIds((prevSelected) => {
      if (prevSelected.includes(levelId)) {
        return prevSelected.filter((id) => id !== levelId);
      } else {
        return [...prevSelected, levelId];
      }
    });
  };

  const handleSubmit = async (data: { name?: string; level_ids?: number[] }) => {
    try {
      // Ensure required fields are present
      if (!data.name) {
        console.error('Name is required');
        return;
      }

      const zoneStructureData = {
        name: data.name,
        level_ids: selectedLevelIds
      };

      await onSave(zoneStructureData);
    } catch (error) {
      console.error('Error saving zone structure:', error);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
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
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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

            <div>
              <FormLabel>Levels</FormLabel>
              {levels.map((level) => (
                <FormField
                  key={level.id}
                  control={form.control}
                  name="level_ids"
                  render={() => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={selectedLevelIds.includes(level.id)}
                          onCheckedChange={() => handleCheckboxChange(level.id)}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {level.type} (Depth: {level.depth})
                      </FormLabel>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
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
