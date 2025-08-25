
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface Level {
  id: number;
  type: string;
  depth: string;
  zone_structures_count: number;
  created_at: string;
  updated_at: string;
}

interface LevelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { type: string }) => Promise<void>;
  level?: Level | null;
}

export function LevelModal({ isOpen, onClose, onSave, level }: LevelModalProps) {
  const [formData, setFormData] = useState({
    type: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (level) {
      setFormData({
        type: level.type
      });
    } else {
      setFormData({
        type: ''
      });
    }
  }, [level, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type.trim()) {
      toast({
        title: "Error",
        description: "Please enter a level type",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsLoading(true);
      await onSave({ type: formData.type.trim() });
      onClose();
    } catch (error) {
      console.error('Error saving level:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{level ? 'Edit Level' : 'Add New Level'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="type">Level Type *</Label>
            <Input
              id="type"
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              placeholder="Enter level type (e.g., Country, State, City)"
              required
              disabled={isLoading}
            />
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
              {isLoading ? 'Saving...' : (level ? 'Update Level' : 'Create Level')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
