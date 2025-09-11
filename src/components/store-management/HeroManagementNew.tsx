import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Save, Edit2, Eye, Image, Type, Link as LinkIcon, Monitor, Smartphone, Plus, Upload, Trash2, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Layers, GripVertical } from "lucide-react";
import { useAdminHeroes, useCreateHero, useUpdateHero, useDeleteHero, useAddSlide, useReorderHeroes } from "@/hooks/useHeroes";
import { HeroAPI, CreateHeroRequest, UpdateHeroRequest } from "@/services/heroService";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Hero Item Component
function SortableHeroItem({ hero, onEdit, onDelete, onAddSlide }: { 
  hero: HeroAPI; 
  onEdit: () => void; 
  onDelete: () => void;
  onAddSlide: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: hero.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <div>
            <span className="text-sm font-medium">{hero.title}</span>
            <div className="flex gap-1 mt-1">
              <Badge variant={hero.is_active ? "default" : "secondary"} className="text-xs">
                {hero.is_active ? "Active" : "Inactive"}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {hero.type}
              </Badge>
              {hero.type === 'slider' && (
                <Badge variant="outline" className="text-xs">
                  {hero.slides_count || 0} slides
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          {hero.type === 'slider' && (
            <Button size="sm" variant="ghost" onClick={onAddSlide}>
              <Plus className="w-3 h-3" />
            </Button>
          )}
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit2 className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="w-16 h-12 rounded overflow-hidden bg-muted">
          <img 
            src={hero.images.hero.desktop} 
            alt={hero.title} 
            className="w-full h-full object-cover" 
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{hero.subtitle}</p>
          {hero.cta_text && (
            <p className="text-xs text-primary truncate">{hero.cta_text}</p>
          )}
        </div>
      </div>
      
      {/* Show slides if this is a slider with slides */}
      {hero.type === 'slider' && hero.slides && hero.slides.length > 0 && (
        <div className="ml-6 space-y-2 border-l-2 border-muted pl-4">
          <p className="text-xs font-medium text-muted-foreground">Slides:</p>
          {hero.slides.map((slide) => (
            <div key={slide.id} className="flex items-center gap-2 bg-muted/50 rounded p-2">
              <div className="w-8 h-6 rounded overflow-hidden bg-muted">
                <img 
                  src={slide.images.hero.desktop} 
                  alt={slide.title} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{slide.title}</p>
                <p className="text-xs text-muted-foreground truncate">{slide.subtitle}</p>
              </div>
              <Badge variant={slide.is_active ? "default" : "secondary"} className="text-xs">
                {slide.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Hero Form Component
function HeroForm({ 
  hero, 
  onSave, 
  onCancel, 
  isCreating = false,
  allHeroes = [],
  isAddingSlide = false,
  parentSliderId
}: { 
  hero?: HeroAPI; 
  onSave: (data: CreateHeroRequest | UpdateHeroRequest, file?: File) => void;
  onCancel: () => void;
  isCreating?: boolean;
  allHeroes?: HeroAPI[];
  isAddingSlide?: boolean;
  parentSliderId?: number;
}) {
  const [formData, setFormData] = useState({
    title: hero?.title || '',
    subtitle: hero?.subtitle || '',
    cta_text: hero?.cta_text || '',
    cta_link: hero?.cta_link || '',
    type: hero?.type || (isAddingSlide ? 'slide' : 'single') as 'single' | 'slider' | 'slide',
    parent_id: hero?.parent_id || parentSliderId || undefined,
    is_active: hero?.is_active ?? true,
  });
  const [backgroundImage, setBackgroundImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(
    hero?.images?.hero?.desktop || ''
  );
  const [mobilePreviewImage, setMobilePreviewImage] = useState<string>(
    hero?.images?.hero?.mobile || ''
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBackgroundImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
      setMobilePreviewImage(imageUrl); // Use same image for mobile preview
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || (!backgroundImage && isCreating)) {
      return;
    }

    // Validation for slide type requiring parent_id
    if (formData.type === 'slide' && !formData.parent_id) {
      alert('Please select a parent slider when type is slide.');
      return;
    }

    const data = {
      ...formData,
      background_image: backgroundImage!,
    };

    onSave(data, backgroundImage || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter hero title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input
              id="subtitle"
              value={formData.subtitle}
              onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Enter hero subtitle"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cta_text">CTA Text</Label>
              <Input
                id="cta_text"
                value={formData.cta_text}
                onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                placeholder="Shop Now"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cta_link">CTA Link</Label>
              <Input
                id="cta_link"
                value={formData.cta_link}
                onChange={(e) => setFormData(prev => ({ ...prev, cta_link: e.target.value }))}
                placeholder="/collections/all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'single' | 'slider' | 'slide' }))}
                className="w-full p-2 border rounded-md bg-background"
                disabled={isAddingSlide}
              >
                <option value="single">single</option>
                <option value="slider">slider</option>
                <option value="slide">slide</option>
              </select>
            </div>

            {formData.type === 'slide' && (
              <div className="space-y-2">
                <Label htmlFor="parent_id">Parent Slider *</Label>
                <select
                  id="parent_id"
                  value={formData.parent_id || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value ? parseInt(e.target.value) : undefined }))}
                  className="w-full p-2 border rounded-md bg-background"
                  required
                >
                  <option value="">Select Parent Slider</option>
                  {allHeroes
                    .filter(h => h.type === 'slider' && h.id !== hero?.id)
                    .map(h => (
                      <option key={h.id} value={h.id}>
                        {h.title}
                      </option>
                    ))
                  }
                </select>
              </div>
            )}

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                Active
              </Label>
            </div>
          </div>
        </div>

        {/* Image Upload & Preview */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="background_image">Background Image {isCreating && '*'}</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                id="background_image"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="background_image" className="cursor-pointer">
                {previewImage ? (
                  <div className="space-y-2">
                    <img 
                      src={previewImage} 
                      alt="Preview" 
                      className="w-full h-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-muted-foreground">Click to change image</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload background image
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {previewImage && (
            <div className="space-y-4">
              <Label>Preview</Label>
              
              {/* Desktop Preview */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Desktop</Label>
                <div className="relative rounded-lg overflow-hidden h-40">
                  <img 
                    src={previewImage} 
                    alt="Desktop Hero Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent">
                    <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                      <div>
                        <h3 className="text-white font-bold text-lg mb-2">
                          {formData.title || 'Hero Title'}
                        </h3>
                        <p className="text-white/90 text-sm mb-3">
                          {formData.subtitle || 'Hero subtitle'}
                        </p>
                        {formData.cta_text && (
                          <Button size="sm" className="bg-primary">
                            {formData.cta_text}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Preview */}
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Mobile</Label>
                <div className="relative rounded-lg overflow-hidden h-32 max-w-48 mx-auto">
                  <img 
                    src={mobilePreviewImage || previewImage} 
                    alt="Mobile Hero Preview" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent">
                    <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                      <div>
                        <h3 className="text-white font-bold text-sm mb-1">
                          {formData.title || 'Hero Title'}
                        </h3>
                        <p className="text-white/90 text-xs mb-2">
                          {formData.subtitle || 'Hero subtitle'}
                        </p>
                        {formData.cta_text && (
                          <Button size="sm" className="bg-primary text-xs px-2 py-1">
                            {formData.cta_text}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!formData.title || (!backgroundImage && isCreating)}
        >
          <Save className="w-4 h-4 mr-2" />
          {isCreating ? 'Create Hero' : 'Update Hero'}
        </Button>
      </div>
    </form>
  );
}

export function HeroManagement() {
  const [editingHero, setEditingHero] = useState<HeroAPI | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [addingSlideToHero, setAddingSlideToHero] = useState<number | null>(null);

  const { data: heroes, isLoading } = useAdminHeroes();
  const createHero = useCreateHero();
  const updateHero = useUpdateHero();
  const deleteHero = useDeleteHero();
  const addSlide = useAddSlide();
  const reorderHeroes = useReorderHeroes();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateHero = (data: CreateHeroRequest) => {
    createHero.mutate(data, {
      onSuccess: () => {
        setIsCreating(false);
      }
    });
  };

  const handleUpdateHero = (data: UpdateHeroRequest) => {
    if (editingHero) {
      updateHero.mutate({ id: editingHero.id, data }, {
        onSuccess: () => {
          setEditingHero(null);
        }
      });
    }
  };

  const handleDeleteHero = (heroId: number) => {
    deleteHero.mutate(heroId);
  };

  const handleAddSlide = (data: CreateHeroRequest) => {
    if (addingSlideToHero) {
      addSlide.mutate({ heroId: addingSlideToHero, data }, {
        onSuccess: () => {
          setAddingSlideToHero(null);
        }
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && heroes) {
      const oldIndex = heroes.findIndex(hero => hero.id === active.id);
      const newIndex = heroes.findIndex(hero => hero.id === over.id);
      
      const reorderedHeroes = arrayMove(heroes, oldIndex, newIndex);
      const order = reorderedHeroes.map(hero => hero.id);
      
      reorderHeroes.mutate(order);
    }
  };

  if (isLoading) {
    return <div>Loading heroes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hero Management</h2>
          <p className="text-muted-foreground">Manage your store's hero sections and sliders</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Hero
        </Button>
      </div>

      <Separator />

      {/* Create/Edit Form */}
      {(isCreating || editingHero || addingSlideToHero) && (
        <Card>
          <CardHeader>
            <CardTitle>
              {isCreating && "Create New Hero"}
              {editingHero && "Edit Hero"}
              {addingSlideToHero && "Add Slide"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HeroForm
              hero={editingHero || undefined}
              onSave={isCreating ? handleCreateHero : addingSlideToHero ? handleAddSlide : handleUpdateHero}
              onCancel={() => {
                setIsCreating(false);
                setEditingHero(null);
                setAddingSlideToHero(null);
              }}
              isCreating={isCreating || !!addingSlideToHero}
              allHeroes={heroes || []}
              isAddingSlide={!!addingSlideToHero}
              parentSliderId={addingSlideToHero || undefined}
            />
          </CardContent>
        </Card>
      )}

      {/* Heroes List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Heroes ({heroes?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {heroes && heroes.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={heroes.map(h => h.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {heroes.map((hero) => (
                    <SortableHeroItem
                      key={hero.id}
                      hero={hero}
                      onEdit={() => setEditingHero(hero)}
                      onDelete={() => handleDeleteHero(hero.id)}
                      onAddSlide={() => setAddingSlideToHero(hero.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No heroes created yet</p>
              <p className="text-sm">Create your first hero section to get started</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}