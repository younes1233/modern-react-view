
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Save, Eye, Grid, List, Star, TrendingUp } from "lucide-react";
import { 
  getDisplaySettings, 
  updateDisplaySettings,
  DisplaySettings 
} from "@/data/storeData";

export function ProductDisplay() {
  const [settings, setSettings] = useState<DisplaySettings>(getDisplaySettings());
  const { toast } = useToast();

  useEffect(() => {
    setSettings(getDisplaySettings());
  }, []);

  const handleSaveSettings = () => {
    updateDisplaySettings(settings);
    toast({
      title: "Success",
      description: "Product display settings saved successfully"
    });
  };

  const updateSetting = <K extends keyof DisplaySettings>(
    key: K,
    value: DisplaySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Product Display Settings</h2>
          <p className="text-gray-600 dark:text-gray-400">Configure how products appear in your store</p>
        </div>
        <Button onClick={handleSaveSettings} className="gap-2">
          <Save className="w-4 h-4" />
          Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layout Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Grid className="w-5 h-5" />
              Layout Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="layout">Default Layout</Label>
              <Select 
                value={settings.layout} 
                onValueChange={(value: 'grid' | 'list') => updateSetting('layout', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grid">Grid View</SelectItem>
                  <SelectItem value="list">List View</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Grid Columns: {settings.gridColumns}</Label>
              <Slider
                value={[settings.gridColumns]}
                onValueChange={(value) => updateSetting('gridColumns', value[0])}
                min={2}
                max={5}
                step={1}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            <div>
              <Label>Products Per Page: {settings.productsPerPage}</Label>
              <Slider
                value={[settings.productsPerPage]}
                onValueChange={(value) => updateSetting('productsPerPage', value[0])}
                min={6}
                max={24}
                step={6}
                className="mt-2"
              />
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>6</span>
                <span>12</span>
                <span>18</span>
                <span>24</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Display Options */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Display Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="showPricing">Show Pricing</Label>
              <Switch
                id="showPricing"
                checked={settings.showPricing}
                onCheckedChange={(checked) => updateSetting('showPricing', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showRatings">Show Ratings</Label>
              <Switch
                id="showRatings"
                checked={settings.showRatings}
                onCheckedChange={(checked) => updateSetting('showRatings', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="showStock">Show Stock Status</Label>
              <Switch
                id="showStock"
                checked={settings.showStock}
                onCheckedChange={(checked) => updateSetting('showStock', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="enableQuickView">Enable Quick View</Label>
              <Switch
                id="enableQuickView"
                checked={settings.enableQuickView}
                onCheckedChange={(checked) => updateSetting('enableQuickView', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Store Sections */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Store Sections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="featuredSection">Featured Products Section</Label>
              <Switch
                id="featuredSection"
                checked={settings.featuredSection}
                onCheckedChange={(checked) => updateSetting('featuredSection', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="newArrivalsSection">New Arrivals Section</Label>
              <Switch
                id="newArrivalsSection"
                checked={settings.newArrivalsSection}
                onCheckedChange={(checked) => updateSetting('newArrivalsSection', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="saleSection">Sale Items Section</Label>
              <Switch
                id="saleSection"
                checked={settings.saleSection}
                onCheckedChange={(checked) => updateSetting('saleSection', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                Store Layout Preview
              </div>
              <div className={`grid gap-2 ${settings.gridColumns === 2 ? 'grid-cols-2' : settings.gridColumns === 3 ? 'grid-cols-3' : settings.gridColumns === 4 ? 'grid-cols-4' : 'grid-cols-5'}`}>
                {Array.from({ length: Math.min(settings.gridColumns * 2, 6) }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-gray-700 rounded border p-2 space-y-1">
                    <div className="bg-gray-200 dark:bg-gray-600 rounded h-12"></div>
                    <div className="text-xs">Product {i + 1}</div>
                    {settings.showPricing && <div className="text-xs text-green-600">$99.99</div>}
                    {settings.showRatings && (
                      <div className="flex items-center gap-1">
                        <Star className="w-2 h-2 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs">4.5</span>
                      </div>
                    )}
                    {settings.showStock && <Badge variant="secondary" className="text-xs">In Stock</Badge>}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
