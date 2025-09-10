
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Save, Eye, EyeOff, Image, Type, Link as LinkIcon, Monitor, Smartphone, Plus, Upload, Trash2, ChevronLeft, ChevronRight, Play, Pause, RotateCcw, Layers, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getHeroSection, updateHeroSection, HeroSection, HeroSlide } from "@/data/storeData";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Sortable Slide Item Component
function SortableSlideItem({ slide, onEdit, onDelete }: { slide: HeroSlide; onEdit: () => void; onDelete: () => void }) {
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
    <div ref={setNodeRef} style={style} className="bg-card border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button {...attributes} {...listeners} className="cursor-grab hover:cursor-grabbing">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </button>
          <span className="text-sm font-medium">Slide {slide.order}</span>
        </div>
        <div className="flex gap-1">
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Type className="w-3 h-3" />
          </Button>
          <Button size="sm" variant="ghost" onClick={onDelete}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      <div className="flex gap-3">
        <div className="w-16 h-12 rounded overflow-hidden bg-muted">
          <img src={slide.backgroundImage} alt={slide.title} className="w-full h-full object-cover" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{slide.title}</p>
          <p className="text-xs text-muted-foreground truncate">{slide.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export function HeroManagement() {
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isSliderPlaying, setIsSliderPlaying] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const [formData, setFormData] = useState<Partial<HeroSection>>({
    title: '',
    subtitle: '',
    backgroundImage: '',
    ctaText: 'Shop Now',
    ctaLink: '/store/categories',
    isActive: true,
    isSlider: false,
    slides: []
  });
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const hero = getHeroSection();
    if (hero) {
      // Update with modern image if using old placeholder
      if (hero.backgroundImage && hero.backgroundImage.includes('placeholder')) {
        hero.backgroundImage = "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3";
        updateHeroSection(hero);
      }
      setHeroSection(hero);
      setFormData(hero);
    }
  }, []);

  // Auto-play slider effect
  useEffect(() => {
    if (isSliderPlaying && formData.isSlider && formData.slides && formData.slides.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlideIndex((prev) => (prev + 1) % formData.slides!.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isSliderPlaying, formData.isSlider, formData.slides]);

  const handleInputChange = (field: keyof HeroSection, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSlideInputChange = (field: keyof HeroSlide, value: string) => {
    if (editingSlide) {
      setEditingSlide(prev => prev ? ({ ...prev, [field]: value }) : null);
    }
  };

  const getCurrentSlideData = () => {
    if (formData.isSlider && formData.slides && formData.slides.length > 0) {
      return formData.slides[currentSlideIndex];
    }
    return formData;
  };

  const handleCreateNew = () => {
    setIsCreating(true);
    setIsEditing(true);
    setFormData({
      title: '',
      subtitle: '',
      backgroundImage: '',
      ctaText: 'Shop Now',
      ctaLink: '/store/categories',
      isActive: true,
      isSlider: false,
      slides: []
    });
  };

  const handleConvertToSlider = () => {
    const currentData = formData;
    const firstSlide: HeroSlide = {
      id: Date.now(),
      title: currentData.title || '',
      subtitle: currentData.subtitle || '',
      backgroundImage: currentData.backgroundImage || '',
      ctaText: currentData.ctaText || 'Shop Now',
      ctaLink: currentData.ctaLink || '/store/categories',
      order: 1
    };
    
    setFormData(prev => ({
      ...prev,
      isSlider: true,
      slides: [firstSlide]
    }));
    
    toast({
      title: "Converted to Slider",
      description: "Your hero section is now a slider. Add more slides to create a carousel."
    });
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: Date.now(),
      title: '',
      subtitle: '',
      backgroundImage: '',
      ctaText: 'Shop Now',
      ctaLink: '/store/categories',
      order: (formData.slides?.length || 0) + 1
    };
    
    setFormData(prev => ({
      ...prev,
      slides: [...(prev.slides || []), newSlide]
    }));
    
    setEditingSlide(newSlide);
  };

  const handleEditSlide = (slide: HeroSlide) => {
    setEditingSlide(slide);
  };

  const handleSaveSlide = () => {
    if (editingSlide && formData.slides) {
      const updatedSlides = formData.slides.map(slide => 
        slide.id === editingSlide.id ? editingSlide : slide
      );
      setFormData(prev => ({ ...prev, slides: updatedSlides }));
      setEditingSlide(null);
      toast({
        title: "Slide Updated",
        description: "Your slide has been updated successfully."
      });
    }
  };

  const handleDeleteSlide = (slideId: number) => {
    if (formData.slides) {
      const updatedSlides = formData.slides.filter(slide => slide.id !== slideId);
      setFormData(prev => ({ ...prev, slides: updatedSlides }));
      
      if (updatedSlides.length === 0) {
        setFormData(prev => ({ ...prev, isSlider: false }));
      }
      
      if (currentSlideIndex >= updatedSlides.length) {
        setCurrentSlideIndex(Math.max(0, updatedSlides.length - 1));
      }
      
      toast({
        title: "Slide Deleted",
        description: "The slide has been removed from your carousel."
      });
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id && formData.slides) {
      const oldIndex = formData.slides.findIndex(slide => slide.id === active.id);
      const newIndex = formData.slides.findIndex(slide => slide.id === over.id);
      
      const reorderedSlides = arrayMove(formData.slides, oldIndex, newIndex).map((slide, index) => ({
        ...slide,
        order: index + 1
      }));
      
      setFormData(prev => ({ ...prev, slides: reorderedSlides }));
    }
  };

  const handleSave = () => {
    const requiredFields = formData.isSlider 
      ? formData.slides && formData.slides.length > 0 && formData.slides.every(slide => slide.title && slide.subtitle && slide.backgroundImage)
      : formData.title && formData.subtitle && formData.backgroundImage;

    if (requiredFields) {
      if (isCreating) {
        const newHero = {
          ...formData,
          id: Date.now(),
        } as HeroSection;
        updateHeroSection(newHero);
        setHeroSection(newHero);
        setIsCreating(false);
        toast({
          title: "Success",
          description: `Hero ${formData.isSlider ? 'slider' : 'section'} created successfully`
        });
      } else {
        updateHeroSection(formData);
        setHeroSection({ ...heroSection!, ...formData });
        toast({
          title: "Success",
          description: `Hero ${formData.isSlider ? 'slider' : 'section'} updated successfully`
        });
      }
      setIsEditing(false);
      setEditingSlide(null);
    } else {
      toast({
        title: "Error",
        description: formData.isSlider ? "Please complete all slides with title, subtitle, and background image" : "Please fill in all required fields",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    if (isCreating) {
      setIsCreating(false);
      setFormData(heroSection || {
        title: '',
        subtitle: '',
        backgroundImage: '',
        ctaText: 'Shop Now',
        ctaLink: '/store/categories',
        isActive: true,
        isSlider: false,
        slides: []
      });
    } else {
      setFormData(heroSection || {});
    }
    setIsEditing(false);
    setEditingSlide(null);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      
      if (editingSlide) {
        handleSlideInputChange('backgroundImage', imageUrl);
      } else {
        handleInputChange('backgroundImage', imageUrl);
      }
      
      toast({
        title: "Image uploaded",
        description: "Background image has been updated"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Hero Section Management</h2>
          <p className="text-muted-foreground">Create and customize your store's hero section or slider</p>
        </div>
        <div className="flex gap-2">
          {!heroSection && !isCreating && (
            <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Hero Section
            </Button>
          )}
          {heroSection && !isEditing && (
            <>
              {!heroSection.isSlider && (
                <Button onClick={handleConvertToSlider} variant="outline">
                  <Layers className="w-4 h-4 mr-2" />
                  Convert to Slider
                </Button>
              )}
              <Button onClick={() => setIsEditing(true)} variant="outline">
                <Type className="w-4 h-4 mr-2" />
                Edit Hero
              </Button>
            </>
          )}
        </div>
      </div>

      {heroSection && (
        <div className="flex items-center gap-2">
          <Badge variant={heroSection.isActive ? "default" : "secondary"}>
            {heroSection.isActive ? "Active" : "Inactive"}
          </Badge>
          {heroSection.isSlider && (
            <Badge variant="outline">
              <Layers className="w-3 h-3 mr-1" />
              Slider ({heroSection.slides?.length || 0} slides)
            </Badge>
          )}
          <span className="text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </span>
        </div>
      )}

      <Separator />

      {(heroSection || isCreating) && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Preview Section */}
          <div className="xl:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Live Preview {formData.isSlider && `(${currentSlideIndex + 1}/${formData.slides?.length || 0})`}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={previewDevice === 'desktop' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewDevice('desktop')}
                    >
                      <Monitor className="w-4 h-4 mr-1" />
                      Desktop
                    </Button>
                    <Button
                      variant={previewDevice === 'mobile' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setPreviewDevice('mobile')}
                    >
                      <Smartphone className="w-4 h-4 mr-1" />
                      Mobile
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`mx-auto bg-gray-100 dark:bg-gray-800 rounded-lg p-4 transition-all duration-300 ${
                  previewDevice === 'desktop' ? 'w-full' : 'w-80'
                }`}>
                  <div className={`relative rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
                    previewDevice === 'desktop' ? 'h-96' : 'h-80'
                  }`}>
                    {(() => {
                      const currentData = getCurrentSlideData();
                      const hasImage = currentData.backgroundImage || (heroSection && heroSection.backgroundImage);
                      
                      return (
                        <>
                          {hasImage ? (
                            <img
                              src={currentData.backgroundImage || (heroSection ? heroSection.backgroundImage : '')}
                              alt="Hero Background"
                              className="w-full h-full object-cover transition-all duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center">
                              <div className="text-center text-gray-500 dark:text-gray-400">
                                <Image className="w-12 h-12 mx-auto mb-2" />
                                <p>No image selected</p>
                              </div>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/60 to-pink-900/40">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            <div className="relative h-full flex items-center justify-center">
                              <div className="text-center px-6 max-w-2xl">
                                <h1 className={`font-bold text-white mb-4 leading-tight transition-all duration-500 ${
                                  previewDevice === 'desktop' ? 'text-4xl lg:text-5xl' : 'text-2xl'
                                }`}>
                                  <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                                    {currentData.title || (heroSection ? heroSection.title : 'Your Hero Title')}
                                  </span>
                                </h1>
                                <p className={`text-white/90 mb-6 leading-relaxed transition-all duration-500 ${
                                  previewDevice === 'desktop' ? 'text-lg' : 'text-sm'
                                }`}>
                                  {currentData.subtitle || (heroSection ? heroSection.subtitle : 'Your hero subtitle goes here')}
                                </p>
                                <div className={`flex gap-4 justify-center ${
                                  previewDevice === 'desktop' ? 'flex-row' : 'flex-col'
                                }`}>
                                  <Button 
                                    size={previewDevice === 'desktop' ? 'lg' : 'default'}
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-2xl transition-all duration-300"
                                  >
                                    {currentData.ctaText || (heroSection ? heroSection.ctaText : 'Shop Now')}
                                  </Button>
                                  <Button 
                                    variant="outline"
                                    size={previewDevice === 'desktop' ? 'lg' : 'default'}
                                    className="border-2 border-white/30 hover:border-white text-white hover:text-gray-900 hover:bg-white/90 backdrop-blur-sm rounded-xl font-semibold transition-all duration-300"
                                  >
                                    Browse Categories
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </>
                      );
                    })()}
                    
                    {/* Slider Controls */}
                    {formData.isSlider && formData.slides && formData.slides.length > 1 && (
                      <>
                        <button
                          onClick={() => setCurrentSlideIndex(prev => prev === 0 ? formData.slides!.length - 1 : prev - 1)}
                          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                        >
                          <ChevronLeft className="w-5 h-5 text-white" />
                        </button>
                        <button
                          onClick={() => setCurrentSlideIndex(prev => (prev + 1) % formData.slides!.length)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                        >
                          <ChevronRight className="w-5 h-5 text-white" />
                        </button>
                        
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                          <button
                            onClick={() => setIsSliderPlaying(!isSliderPlaying)}
                            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
                          >
                            {isSliderPlaying ? 
                              <Pause className="w-4 h-4 text-white" /> : 
                              <Play className="w-4 h-4 text-white" />
                            }
                          </button>
                          <div className="flex gap-1">
                            {formData.slides.map((_, index) => (
                              <button
                                key={index}
                                onClick={() => setCurrentSlideIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${
                                  index === currentSlideIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Form Section */}
          <div className="xl:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isEditing ? <Type className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {editingSlide ? `Edit Slide ${editingSlide.order}` : 
                   isCreating ? "Create Hero Section" : 
                   isEditing ? `Edit Hero ${formData.isSlider ? 'Slider' : 'Section'}` : 
                   "Hero Settings"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue={editingSlide ? "slide" : "content"} className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                    <TabsTrigger value="slider">Slider</TabsTrigger>
                  </TabsList>

                  {/* Slide Editing Tab */}
                  {editingSlide && (
                    <TabsContent value="slide" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="slide-title" className="text-sm font-medium">Slide Title *</Label>
                        <Input
                          id="slide-title"
                          value={editingSlide.title}
                          onChange={(e) => handleSlideInputChange('title', e.target.value)}
                          placeholder="Transform Your Home Today"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slide-subtitle" className="text-sm font-medium">Slide Subtitle *</Label>
                        <Textarea
                          id="slide-subtitle"
                          value={editingSlide.subtitle}
                          onChange={(e) => handleSlideInputChange('subtitle', e.target.value)}
                          placeholder="Discover our curated collection..."
                          rows={3}
                          className="w-full resize-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slide-cta" className="text-sm font-medium">Slide Button Text</Label>
                        <Input
                          id="slide-cta"
                          value={editingSlide.ctaText}
                          onChange={(e) => handleSlideInputChange('ctaText', e.target.value)}
                          placeholder="Shop Now"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="slide-link" className="text-sm font-medium">Slide Button Link</Label>
                        <Input
                          id="slide-link"
                          value={editingSlide.ctaLink}
                          onChange={(e) => handleSlideInputChange('ctaLink', e.target.value)}
                          placeholder="/store/categories"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Slide Background Image *</Label>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => document.getElementById('slide-image-upload')?.click()}
                          >
                            <Upload className="w-4 h-4 mr-2" />
                            Upload Image
                          </Button>
                          <input
                            id="slide-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        <Input
                          value={editingSlide.backgroundImage}
                          onChange={(e) => handleSlideInputChange('backgroundImage', e.target.value)}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full"
                        />
                        {editingSlide.backgroundImage && (
                          <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                            <img
                              src={editingSlide.backgroundImage}
                              alt="Slide preview"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-4 border-t">
                        <Button onClick={handleSaveSlide} className="flex-1">
                          <Save className="w-4 h-4 mr-2" />
                          Save Slide
                        </Button>
                        <Button variant="outline" onClick={() => setEditingSlide(null)}>
                          Cancel
                        </Button>
                      </div>
                    </TabsContent>
                  )}

                  <TabsContent value="content" className="space-y-4 mt-4">
                    {!formData.isSlider ? (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                          <Input
                            id="title"
                            value={formData.title || ''}
                            onChange={(e) => handleInputChange('title', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Transform Your Home Today"
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="subtitle" className="text-sm font-medium">Subtitle *</Label>
                          <Textarea
                            id="subtitle"
                            value={formData.subtitle || ''}
                            onChange={(e) => handleInputChange('subtitle', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Discover our curated collection of premium furniture and home decor"
                            rows={3}
                            className="w-full resize-none"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ctaText" className="text-sm font-medium">Primary Button Text</Label>
                          <Input
                            id="ctaText"
                            value={formData.ctaText || ''}
                            onChange={(e) => handleInputChange('ctaText', e.target.value)}
                            disabled={!isEditing}
                            placeholder="Shop Now"
                            className="w-full"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="ctaLink" className="text-sm font-medium">Button Link</Label>
                          <Input
                            id="ctaLink"
                            value={formData.ctaLink || ''}
                            onChange={(e) => handleInputChange('ctaLink', e.target.value)}
                            disabled={!isEditing}
                            placeholder="/store/categories"
                            className="w-full"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Slider Mode</h3>
                        <p className="text-muted-foreground mb-4">Use the Slider tab to manage individual slides</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="design" className="space-y-4 mt-4">
                    {!formData.isSlider && (
                      <>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Background Image *</Label>
                          {isEditing && (
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => document.getElementById('image-upload')?.click()}
                              >
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Image
                              </Button>
                              <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                              />
                            </div>
                          )}
                          <Input
                            value={formData.backgroundImage || ''}
                            onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://images.unsplash.com/..."
                            className="w-full"
                          />
                          {formData.backgroundImage && (
                            <div className="relative w-full h-32 rounded-lg overflow-hidden border">
                              <img
                                src={formData.backgroundImage}
                                alt="Background preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="isActive"
                          checked={formData.isActive ?? true}
                          onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                          disabled={!isEditing}
                        />
                        <Label htmlFor="isActive" className="text-sm font-medium">Publish Hero Section</Label>
                      </div>
                      <Badge variant={formData.isActive ? "default" : "secondary"} className="text-xs">
                        {formData.isActive ? "Live" : "Draft"}
                      </Badge>
                    </div>

                    {!formData.isSlider && isEditing && (
                      <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2 mb-2">
                          <Layers className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-900 dark:text-blue-100">Upgrade to Slider</span>
                        </div>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                          Convert your hero section to a dynamic slider with multiple slides to showcase different products or promotions.
                        </p>
                        <Button
                          onClick={handleConvertToSlider}
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          <Layers className="w-3 h-3 mr-1" />
                          Convert to Slider
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Slider Management Tab */}
                  <TabsContent value="slider" className="space-y-4 mt-4">
                    {formData.isSlider ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium">Manage Slides</h4>
                          <Button onClick={handleAddSlide} size="sm">
                            <Plus className="w-3 h-3 mr-1" />
                            Add Slide
                          </Button>
                        </div>

                        {formData.slides && formData.slides.length > 0 ? (
                          <DndContext 
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                          >
                            <SortableContext 
                              items={formData.slides.map(slide => slide.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="space-y-2">
                                {formData.slides.map((slide) => (
                                  <SortableSlideItem
                                    key={slide.id}
                                    slide={slide}
                                    onEdit={() => handleEditSlide(slide)}
                                    onDelete={() => handleDeleteSlide(slide.id)}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        ) : (
                          <div className="text-center py-8 border-2 border-dashed border-muted rounded-lg">
                            <Layers className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">No slides added yet</p>
                            <Button onClick={handleAddSlide} size="sm" className="mt-2">
                              <Plus className="w-3 h-3 mr-1" />
                              Add Your First Slide
                            </Button>
                          </div>
                        )}

                        <div className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center gap-2 mb-1">
                            <RotateCcw className="w-4 h-4 text-amber-600" />
                            <span className="text-sm font-medium text-amber-900 dark:text-amber-100">Convert Back</span>
                          </div>
                          <p className="text-xs text-amber-700 dark:text-amber-300 mb-2">
                            Convert back to a single hero section
                          </p>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="w-full border-amber-300 text-amber-700 hover:bg-amber-100">
                                <RotateCcw className="w-3 h-3 mr-1" />
                                Convert to Single Hero
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Convert to Single Hero Section?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will remove all slides and convert back to a single hero section. This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => {
                                  setFormData(prev => ({ ...prev, isSlider: false, slides: [] }));
                                  toast({
                                    title: "Converted to Single Hero",
                                    description: "Your slider has been converted back to a single hero section."
                                  });
                                }}>
                                  Convert
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Layers className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">Single Hero Mode</h3>
                        <p className="text-muted-foreground mb-4">Convert to slider mode to manage multiple slides</p>
                        <Button onClick={handleConvertToSlider}>
                          <Layers className="w-4 h-4 mr-2" />
                          Convert to Slider
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {(isEditing && !editingSlide) && (
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button onClick={handleSave} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {isCreating ? `Create Hero ${formData.isSlider ? 'Slider' : 'Section'}` : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="w-full">
                      Cancel
                    </Button>
                    {heroSection && !isCreating && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="w-full mt-2"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Hero {formData.isSlider ? 'Slider' : 'Section'}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Hero {formData.isSlider ? 'Slider' : 'Section'}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will permanently delete your hero {formData.isSlider ? 'slider and all its slides' : 'section'}.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => {
                                toast({
                                  title: "Delete Feature",
                                  description: "This feature will be implemented with the backend API"
                                });
                              }}
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {!heroSection && !isCreating && (
        <Card className="border-dashed border-2 border-muted-foreground/25">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4 mb-4">
              <Type className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Hero Section</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md">
              Create a stunning hero section to showcase your brand and capture your visitors' attention from the moment they land on your store.
            </p>
            <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Hero Section
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
