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
import {
  createZoneStructure,
  deleteZoneStructure,
  updateZoneStructure,
} from "@/lib/actions/zone-structure.actions";
import { useToast } from "@/components/ui/use-toast";
import { Level } from "@/types";
import { getAllLevels } from "@/lib/actions/level.actions";
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Zone Structure name must be at least 2 characters.",
  }),
  level_ids: z.array(z.number()).optional(),
});

interface ZoneStructureModalProps {
  zoneStructure?: { id: number; name: string; levels: Level[] } | null;
  onClose: () => void;
  onZoneStructureCreated?: () => void;
  onZoneStructureUpdated?: () => void;
  onZoneStructureDeleted?: () => void;
}

export function ZoneStructureModal({
  zoneStructure,
  onClose,
  onZoneStructureCreated,
  onZoneStructureUpdated,
  onZoneStructureDeleted,
}: ZoneStructureModalProps) {
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevelIds, setSelectedLevelIds] = useState<number[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const fetchedLevels = await getAllLevels();
        setLevels(fetchedLevels);
      } catch (error) {
        console.error("Error fetching levels:", error);
      }
    };

    fetchLevels();
  }, []);

  useEffect(() => {
    if (zoneStructure) {
      setSelectedLevelIds(zoneStructure.levels.map((level) => level.id));
    }
  }, [zoneStructure]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: zoneStructure?.name || "",
      level_ids: zoneStructure?.levels?.map((level) => level.id) || [],
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
      if (!data.name || !data.level_ids) {
        console.error('Name and level_ids are required');
        return;
      }

      const zoneStructureData = {
        name: data.name,
        level_ids: data.level_ids
      };

      if (zoneStructure) {
        await updateZoneStructure(zoneStructure.id, zoneStructureData);
        onZoneStructureUpdated?.();
      } else {
        await createZoneStructure(zoneStructureData);
        onZoneStructureCreated?.();
      }
      onClose();
    } catch (error) {
      console.error('Error saving zone structure:', error);
    }
  };

  const onDelete = async () => {
    if (!zoneStructure) {
      console.error("No zone structure to delete.");
      return;
    }

    try {
      await deleteZoneStructure(zoneStructure.id);
      toast({
        title: "Success",
        description: "Zone Structure deleted successfully.",
      });
      onZoneStructureDeleted?.();
      onClose();
    } catch (error) {
      console.error("Error deleting zone structure:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete zone structure.",
      });
    }
  };

  return (
    <AlertDialog open={true} onOpenChange={onClose}>
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
              {zoneStructure && (
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    onClick={onDelete}
                  >
                    Delete
                  </Button>
                </AlertDialogTrigger>
              )}
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
