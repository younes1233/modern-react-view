
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
import { Save, Eye, EyeOff, Image, Type, Link as LinkIcon, Monitor, Smartphone, Plus, Upload, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getHeroSection, updateHeroSection, HeroSection } from "@/data/storeData";

export function HeroManagement() {
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [formData, setFormData] = useState<Partial<HeroSection>>({
    title: '',
    subtitle: '',
    backgroundImage: '',
    ctaText: 'Shop Now',
    ctaLink: '/store/categories',
    isActive: true
  });
  const { toast } = useToast();

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

  const handleInputChange = (field: keyof HeroSection, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
      isActive: true
    });
  };

  const handleSave = () => {
    if (formData.title && formData.subtitle && formData.backgroundImage) {
      if (isCreating) {
        const newHero = {
          ...formData,
          id: Date.now(), // Simple ID generation for demo
        } as HeroSection;
        updateHeroSection(newHero);
        setHeroSection(newHero);
        setIsCreating(false);
        toast({
          title: "Success",
          description: "Hero section created successfully"
        });
      } else {
        updateHeroSection(formData);
        setHeroSection({ ...heroSection!, ...formData });
        toast({
          title: "Success",
          description: "Hero section updated successfully"
        });
      }
      setIsEditing(false);
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
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
        isActive: true
      });
    } else {
      setFormData(heroSection || {});
    }
    setIsEditing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you'd upload to your server/CDN
      const imageUrl = URL.createObjectURL(file);
      handleInputChange('backgroundImage', imageUrl);
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
          <p className="text-muted-foreground">Create and customize your store's hero section</p>
        </div>
        <div className="flex gap-2">
          {!heroSection && !isCreating && (
            <Button onClick={handleCreateNew} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Create Hero Section
            </Button>
          )}
          {heroSection && !isEditing && (
            <Button onClick={() => setIsEditing(true)} variant="outline">
              <Type className="w-4 h-4 mr-2" />
              Edit Hero
            </Button>
          )}
        </div>
      </div>

      {heroSection && (
        <div className="flex items-center gap-2">
          <Badge variant={heroSection.isActive ? "default" : "secondary"}>
            {heroSection.isActive ? "Active" : "Inactive"}
          </Badge>
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
                    Live Preview
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
                    {(formData.backgroundImage || (heroSection && heroSection.backgroundImage)) ? (
                      <img
                        src={formData.backgroundImage || (heroSection ? heroSection.backgroundImage : '')}
                        alt="Hero Background"
                        className="w-full h-full object-cover"
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
                          <h1 className={`font-bold text-white mb-4 leading-tight ${
                            previewDevice === 'desktop' ? 'text-4xl lg:text-5xl' : 'text-2xl'
                          }`}>
                            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                              {formData.title || (heroSection ? heroSection.title : 'Your Hero Title')}
                            </span>
                          </h1>
                          <p className={`text-white/90 mb-6 leading-relaxed ${
                            previewDevice === 'desktop' ? 'text-lg' : 'text-sm'
                          }`}>
                            {formData.subtitle || (heroSection ? heroSection.subtitle : 'Your hero subtitle goes here')}
                          </p>
                          <div className={`flex gap-4 justify-center ${
                            previewDevice === 'desktop' ? 'flex-row' : 'flex-col'
                          }`}>
                            <Button 
                              size={previewDevice === 'desktop' ? 'lg' : 'default'}
                              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-semibold shadow-2xl"
                            >
                              {formData.ctaText || (heroSection ? heroSection.ctaText : 'Shop Now')}
                            </Button>
                            <Button 
                              variant="outline"
                              size={previewDevice === 'desktop' ? 'lg' : 'default'}
                              className="border-2 border-white/30 hover:border-white text-white hover:text-gray-900 hover:bg-white/90 backdrop-blur-sm rounded-xl font-semibold"
                            >
                              Browse Categories
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
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
                  {isCreating ? "Create Hero Section" : isEditing ? "Edit Hero Section" : "Hero Settings"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs defaultValue="content" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="content">Content</TabsTrigger>
                    <TabsTrigger value="design">Design</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4 mt-4">
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
                  </TabsContent>

                  <TabsContent value="design" className="space-y-4 mt-4">
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
                  </TabsContent>
                </Tabs>

                {isEditing && (
                  <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button onClick={handleSave} className="w-full">
                      <Save className="w-4 h-4 mr-2" />
                      {isCreating ? "Create Hero Section" : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={handleCancel} className="w-full">
                      Cancel
                    </Button>
                    {heroSection && !isCreating && (
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          // Handle delete functionality
                          toast({
                            title: "Delete Hero Section",
                            description: "This feature will be implemented with the backend API"
                          });
                        }}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Hero Section
                      </Button>
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
