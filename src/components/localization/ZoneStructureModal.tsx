import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from '@/components/ui/sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { SortableItem } from '@/components/localization/SortableItem';

interface ZoneStructure {
  id: number;
  name: string;
  levels: { id: number; type: string; }[];
  created_at: string;
  updated_at: string;
}

interface Level {
  id: number;
  type: string;
  depth: string;
  zone_structures_count: number;
  created_at: string;
  updated_at: string;
}

interface ZoneStructureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; levels: { id: number }[] }) => Promise<void>;
  zoneStructure?: ZoneStructure | null;
  levels: Level[];
}

export function ZoneStructureModal({ isOpen, onClose, onSave, zoneStructure, levels }: ZoneStructureModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    selectedLevels: [] as number[]
  });
  const [isLoading, setIsLoading] = useState(false);
  // Removed useToast hook;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (zoneStructure) {
      setFormData({
        name: zoneStructure.name,
        selectedLevels: zoneStructure.levels.map(level => level.id)
      });
    } else {
      setFormData({
        name: '',
        selectedLevels: []
      });
    }
  }, [zoneStructure, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Please enter a zone structure name", { duration: 2500 });
      return;
    }

    if (formData.selectedLevels.length === 0) {
      toast.error("Please select at least one level", { duration: 2500 });
      return;
    }

    try {
      setIsLoading(true);
      
      // Ensure all level IDs are valid numbers
      const validLevelIds = formData.selectedLevels.filter(id => typeof id === 'number' && id > 0);
      
      if (validLevelIds.length === 0) {
        throw new Error('No valid levels selected');
      }

      await onSave({
        name: formData.name.trim(),
        levels: validLevelIds.map(id => ({ id }))
      });
      onClose();
    } catch (error) {
      console.error('Error saving zone structure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddLevel = (levelId: string) => {
    const id = parseInt(levelId);
    if (!isNaN(id) && !formData.selectedLevels.includes(id)) {
      setFormData(prev => ({
        ...prev,
        selectedLevels: [...prev.selectedLevels, id]
      }));
    }
  };

  const handleRemoveLevel = (levelId: number) => {
    setFormData(prev => ({
      ...prev,
      selectedLevels: prev.selectedLevels.filter(id => id !== levelId)
    }));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFormData(prev => {
        const oldIndex = prev.selectedLevels.indexOf(active.id);
        const newIndex = prev.selectedLevels.indexOf(over.id);

        return {
          ...prev,
          selectedLevels: arrayMove(prev.selectedLevels, oldIndex, newIndex)
        };
      });
    }
  };

  const availableLevels = levels.filter(level => !formData.selectedLevels.includes(level.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{zoneStructure ? 'Edit Zone Structure' : 'Add New Zone Structure'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Zone Structure Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter zone structure name"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <Label>Available Levels</Label>
            <Select onValueChange={handleAddLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Select a level to add" />
              </SelectTrigger>
              <SelectContent>
                {availableLevels.map(level => (
                  <SelectItem key={level.id} value={String(level.id)}>
                    {level.type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Selected Levels</Label>
            {formData.selectedLevels.length === 0 ? (
              <p className="text-sm text-gray-500">No levels selected.</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={formData.selectedLevels}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {formData.selectedLevels.map((levelId) => {
                      const level = levels.find(l => l.id === levelId);
                      if (!level) return null;

                      return (
                        <SortableItem key={level.id} id={level.id}>
                          <div className="flex items-center justify-between p-3 bg-gray-100 rounded-md">
                            <span>{level.type}</span>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleRemoveLevel(level.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        </SortableItem>
                      );
                    })}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : (zoneStructure ? 'Update Zone Structure' : 'Create Zone Structure')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
