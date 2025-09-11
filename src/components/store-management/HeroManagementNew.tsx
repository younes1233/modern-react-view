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
import { useAdminHeroes, useCreateSingleHero, useCreateSlider, useAddSlide, useUpdateHero, useUpdateSlide, useDeleteHero, useDeleteSlide, useReorderHeroes, useReorderSlides } from "@/hooks/useHeroes";
import { HeroAPI, CreateSingleHeroRequest, CreateSliderRequest, UpdateHeroRequest, CreateSlideRequest, UpdateSlideRequest } from "@/services/heroService";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Slide Item Component
function SortableSlideItem({ slide, onEdit, onDelete }: { 
  slide: any; 
  onEdit: () => void; 
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 bg-muted/50 rounded p-2">
      <button {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
        <GripVertical className="w-3 h-3 text-muted-foreground" />
      </button>
      <div className="w-8 h-6 rounded overflow-hidden bg-muted">
        <img 
          src={slide.image_url} 
          alt={slide.title} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{slide.title}</p>
        <p className="text-xs text-muted-foreground truncate">{slide.subtitle}</p>
      </div>
      <div className="flex items-center gap-1">
        <Button size="sm" variant="ghost" onClick={onEdit} className="h-6 w-6 p-0">
          <Edit2 className="w-3 h-3" />
        </Button>
        <Button size="sm" variant="ghost" onClick={onDelete} className="h-6 w-6 p-0">
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

// Sortable Hero Item Component
function SortableHeroItem({ hero, onEdit, onDelete, onAddSlide, onEditSlide, onDeleteSlide, onReorderSlides }: { 
  hero: HeroAPI; 
  onEdit: () => void; 
  onDelete: () => void;
  onAddSlide: () => void;
  onEditSlide: (slide: any) => void;
  onDeleteSlide: (slideId: number) => void;
  onReorderSlides: (sliderId: number, order: number[]) => void;
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
                  {hero.slides?.length || 0} slides
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
      
      {hero.image_url && (
        <div className="flex gap-3">
          <div className="w-16 h-12 rounded overflow-hidden bg-muted">
            <img 
              src={hero.image_url} 
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
      )}
      
      {/* Show slides if this is a slider with slides */}
      {hero.type === 'slider' && hero.slides && hero.slides.length > 0 && (
        <div className="ml-6 space-y-2 border-l-2 border-muted pl-4">
          <p className="text-xs font-medium text-muted-foreground">Slides ({hero.slides.length}):</p>
          <DndContext
            sensors={useSensors(
              useSensor(PointerSensor),
              useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
              })
            )}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              const { active, over } = event;
              if (active.id !== over?.id) {
                const oldIndex = hero.slides!.findIndex((slide) => slide.id === active.id);
                const newIndex = hero.slides!.findIndex((slide) => slide.id === over!.id);
                const newSlideOrder = arrayMove(hero.slides!, oldIndex, newIndex);
                const slideIds = newSlideOrder.map(slide => slide.id);
                onReorderSlides(hero.id, slideIds);
              }
            }}
          >
            <SortableContext items={hero.slides.map(slide => slide.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-1">
                {hero.slides.map((slide) => (
                  <SortableSlideItem
                    key={slide.id}
                    slide={slide}
                    onEdit={() => onEditSlide(slide)}
                    onDelete={() => onDeleteSlide(slide.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
  mode = 'single'
}: { 
  hero?: HeroAPI | any; 
  onSave: (data: any) => void;
  onCancel: () => void;
  isCreating?: boolean;
  mode?: 'single' | 'slider' | 'slide';
}) {
  const [formData, setFormData] = useState({
    title: hero?.title || '',
    subtitle: hero?.subtitle || '',
    cta_text: hero?.cta_text || '',
    cta_link: hero?.cta_link || '',
    is_active: hero?.is_active ?? true,
  });
  const [image, setImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string>(
    hero?.image_url || ''
  );

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImage(file);
      const imageUrl = URL.createObjectURL(file);
      setPreviewImage(imageUrl);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || (!image && isCreating && mode !== 'slider')) {
      return;
    }

    const data = {
      ...formData,
      ...(image && { image }),
      ...(mode === 'single' && { type: 'single' as const }),
      ...(mode === 'slider' && { type: 'slider' as const }),
    };

    onSave(data);
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

          {mode !== 'slider' && (
            <>
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
            </>
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

        {/* Image Upload & Preview */}
        {mode !== 'slider' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Image {isCreating && '*'}</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <label htmlFor="image" className="cursor-pointer">
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
                        Click to upload image
                      </p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {previewImage && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4" />
                  <Label>Device Preview</Label>
                </div>
                
                {/* Desktop Preview */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-3 h-3 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground">Desktop (1920x480)</Label>
                  </div>
                  <div className="relative rounded-lg overflow-hidden h-24 border">
                    <img 
                      src={previewImage} 
                      alt="Desktop Hero Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent">
                      <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                        <div>
                          <h3 className="text-white font-bold text-base mb-1">
                            {formData.title || 'Hero Title'}
                          </h3>
                          <p className="text-white/90 text-xs mb-2">
                            {formData.subtitle || 'Hero subtitle'}
                          </p>
                          {formData.cta_text && (
                            <Button size="sm" className="bg-primary text-xs px-2 py-1 h-6">
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
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-3 h-3 text-muted-foreground" />
                    <Label className="text-xs text-muted-foreground">Mobile (768x400)</Label>
                  </div>
                  <div className="relative rounded-lg overflow-hidden h-16 w-32 border mx-auto">
                    <img 
                      src={previewImage} 
                      alt="Mobile Hero Preview" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent">
                      <div className="absolute inset-0 flex items-center justify-center text-center p-2">
                        <div>
                          <h3 className="text-white font-bold text-xs mb-1">
                            {formData.title || 'Hero Title'}
                          </h3>
                          <p className="text-white/90 text-xs mb-1 truncate">
                            {formData.subtitle || 'Hero subtitle'}
                          </p>
                          {formData.cta_text && (
                            <Button size="sm" className="bg-primary text-xs px-1 py-0.5 h-4">
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
        )}
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={!formData.title || (!image && isCreating && mode !== 'slider')}
        >
          <Save className="w-4 h-4 mr-2" />
          {isCreating ? `Create ${mode}` : `Update ${mode}`}
        </Button>
      </div>
    </form>
  );
}

export function HeroManagement() {
  const [editingHero, setEditingHero] = useState<HeroAPI | null>(null);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [editingSliderId, setEditingSliderId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createMode, setCreateMode] = useState<'single' | 'slider'>('single');
  const [addingSlideToHero, setAddingSlideToHero] = useState<number | null>(null);

  const { data: heroes, isLoading } = useAdminHeroes();
  const createSingleHero = useCreateSingleHero();
  const createSlider = useCreateSlider();
  const addSlide = useAddSlide();
  const updateHero = useUpdateHero();
  const updateSlide = useUpdateSlide();
  const deleteHero = useDeleteHero();
  const deleteSlide = useDeleteSlide();
  const reorderHeroes = useReorderHeroes();
  const reorderSlides = useReorderSlides();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleCreateHero = (data: any) => {
    if (createMode === 'single') {
      createSingleHero.mutate(data as CreateSingleHeroRequest, {
        onSuccess: () => {
          setIsCreating(false);
        }
      });
    } else {
      createSlider.mutate(data as CreateSliderRequest, {
        onSuccess: () => {
          setIsCreating(false);
        }
      });
    }
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

  const handleEditSlide = (slide: any) => {
    const parentSlider = heroes?.find(h => h.slides?.some((s: any) => s.id === slide.id));
    if (parentSlider) {
      setEditingSlide(slide);
      setEditingSliderId(parentSlider.id);
    }
  };

  const handleUpdateSlide = (data: UpdateSlideRequest) => {
    if (editingSlide && editingSliderId) {
      updateSlide.mutate({ 
        sliderId: editingSliderId, 
        slideId: editingSlide.id, 
        data 
      }, {
        onSuccess: () => {
          setEditingSlide(null);
          setEditingSliderId(null);
        }
      });
    }
  };

  const handleDeleteSlide = (slideId: number) => {
    const parentSlider = heroes?.find(h => h.slides?.some((s: any) => s.id === slideId));
    if (parentSlider) {
      deleteSlide.mutate({ sliderId: parentSlider.id, slideId });
    }
  };

  const handleAddSlide = (data: CreateSlideRequest) => {
    if (addingSlideToHero) {
      addSlide.mutate({ 
        sliderId: addingSlideToHero, 
        data 
      }, {
        onSuccess: () => {
          setAddingSlideToHero(null);
        }
      });
    }
  };

  const handleReorderSlides = (sliderId: number, order: number[]) => {
    reorderSlides.mutate({ sliderId, order });
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id && heroes) {
      const oldIndex = heroes.findIndex((hero) => hero.id === active.id);
      const newIndex = heroes.findIndex((hero) => hero.id === over.id);

      const newOrder = arrayMove(heroes, oldIndex, newIndex);
      const orderIds = newOrder.map(hero => hero.id);
      
      reorderHeroes.mutate(orderIds);
    }
  };

  if (isLoading) return <div>Loading...</div>;

  // Show create form
  if (isCreating) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Create New {createMode === 'single' ? 'Hero' : 'Slider'}</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroForm
            onSave={handleCreateHero}
            onCancel={() => setIsCreating(false)}
            isCreating={true}
            mode={createMode}
          />
        </CardContent>
      </Card>
    );
  }

  // Show edit hero form
  if (editingHero) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit {editingHero.type === 'single' ? 'Hero' : 'Slider'}</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroForm
            hero={editingHero}
            onSave={handleUpdateHero}
            onCancel={() => setEditingHero(null)}
            mode={editingHero.type}
          />
        </CardContent>
      </Card>
    );
  }

  // Show edit slide form
  if (editingSlide) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Edit Slide</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroForm
            hero={editingSlide}
            onSave={handleUpdateSlide}
            onCancel={() => {
              setEditingSlide(null);
              setEditingSliderId(null);
            }}
            mode="slide"
          />
        </CardContent>
      </Card>
    );
  }

  // Show add slide form
  if (addingSlideToHero) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Add Slide to Slider</CardTitle>
        </CardHeader>
        <CardContent>
          <HeroForm
            onSave={handleAddSlide}
            onCancel={() => setAddingSlideToHero(null)}
            isCreating={true}
            mode="slide"
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hero Management</h2>
          <p className="text-muted-foreground">
            Manage hero sections and sliders for your store
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => {
              setCreateMode('single');
              setIsCreating(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Hero
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setCreateMode('slider');
              setIsCreating(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Slider
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5" />
            Heroes & Sliders
            {heroes && heroes.length > 0 && (
              <Badge variant="secondary">{heroes.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!heroes || heroes.length === 0 ? (
            <div className="text-center py-8">
              <Image className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No heroes found</h3>
              <p className="text-muted-foreground mb-4">
                Create your first hero section to get started
              </p>
              <Button onClick={() => {
                setCreateMode('single');
                setIsCreating(true);
              }}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Hero
              </Button>
            </div>
          ) : (
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={heroes.map(h => h.id)} 
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-4">
                  {heroes.map((hero) => (
                    <SortableHeroItem
                      key={hero.id}
                      hero={hero}
                      onEdit={() => setEditingHero(hero)}
                      onDelete={() => handleDeleteHero(hero.id)}
                      onAddSlide={() => setAddingSlideToHero(hero.id)}
                      onEditSlide={handleEditSlide}
                      onDeleteSlide={handleDeleteSlide}
                      onReorderSlides={handleReorderSlides}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>
    </div>
  );
}