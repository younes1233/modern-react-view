
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Save, Eye, EyeOff, Image, Type, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getHeroSection, updateHeroSection, HeroSection } from "@/data/storeData";

export function HeroManagement() {
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<HeroSection>>({});
  const { toast } = useToast();

  useEffect(() => {
    const hero = getHeroSection();
    setHeroSection(hero);
    setFormData(hero);
  }, []);

  const handleInputChange = (field: keyof HeroSection, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (formData.title && formData.subtitle && formData.backgroundImage) {
      updateHeroSection(formData);
      setHeroSection({ ...heroSection!, ...formData });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Hero section updated successfully"
      });
    } else {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    setFormData(heroSection || {});
    setIsEditing(false);
  };

  if (!heroSection) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Hero Section</h2>
          <p className="text-gray-600 dark:text-gray-400">Customize your store's hero section</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Type className="w-4 h-4 mr-2" />
            Edit Hero
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-80 rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={formData.backgroundImage || heroSection.backgroundImage}
                alt="Hero Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/40 to-transparent">
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="relative h-full flex items-center justify-center">
                  <div className="text-center px-6 max-w-2xl">
                    <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                      {formData.title || heroSection.title}
                    </h1>
                    <p className="text-lg text-white/90 mb-6 leading-relaxed">
                      {formData.subtitle || heroSection.subtitle}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                      <Button 
                        size="lg"
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300"
                      >
                        {formData.ctaText || heroSection.ctaText}
                      </Button>
                      <Button 
                        variant="outline"
                        size="lg"
                        className="border-2 border-white/30 hover:border-white text-white hover:text-gray-900 hover:bg-white/90 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                      >
                        Browse Categories
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isEditing ? <Type className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {isEditing ? "Edit Hero Section" : "Current Settings"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter hero title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Textarea
                id="subtitle"
                value={formData.subtitle || ''}
                onChange={(e) => handleInputChange('subtitle', e.target.value)}
                disabled={!isEditing}
                placeholder="Enter hero subtitle"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundImage">Background Image URL</Label>
              <Input
                id="backgroundImage"
                value={formData.backgroundImage || ''}
                onChange={(e) => handleInputChange('backgroundImage', e.target.value)}
                disabled={!isEditing}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaText">Call-to-Action Text</Label>
              <Input
                id="ctaText"
                value={formData.ctaText || ''}
                onChange={(e) => handleInputChange('ctaText', e.target.value)}
                disabled={!isEditing}
                placeholder="Shop Now"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaLink">Call-to-Action Link</Label>
              <Input
                id="ctaLink"
                value={formData.ctaLink || ''}
                onChange={(e) => handleInputChange('ctaLink', e.target.value)}
                disabled={!isEditing}
                placeholder="/store/categories"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive ?? heroSection.isActive}
                onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                disabled={!isEditing}
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
