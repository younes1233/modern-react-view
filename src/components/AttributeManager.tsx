import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";
import { useAttributes, useCreateAttribute, useDeleteAttribute, useCreateAttributeValue, useDeleteAttributeValue } from "@/hooks/useAttributes";
import { toast } from "sonner";

export const AttributeManager = () => {
  const [newAttribute, setNewAttribute] = useState({ name: "", slug: "", type: "text" });
  const [newValue, setNewValue] = useState({ attribute_id: "", value: "", slug: "", hex_color: "" });

  const { data: attributes = [], isLoading } = useAttributes();
  const createAttribute = useCreateAttribute();
  const deleteAttribute = useDeleteAttribute();
  const createAttributeValue = useCreateAttributeValue();
  const deleteAttributeValue = useDeleteAttributeValue();

  const handleCreateAttribute = async () => {
    if (!newAttribute.name || !newAttribute.slug) {
      toast.error("Name and slug are required");
      return;
    }

    try {
      await createAttribute.mutateAsync(newAttribute);
      setNewAttribute({ name: "", slug: "", type: "text" });
    } catch (error) {
      console.error("Failed to create attribute:", error);
    }
  };

  const handleCreateValue = async () => {
    if (!newValue.attribute_id || !newValue.value) {
      toast.error("Attribute and value are required");
      return;
    }

    try {
      await createAttributeValue.mutateAsync({
        attribute_id: parseInt(newValue.attribute_id),
        value: newValue.value,
        slug: newValue.slug,
        hex_color: newValue.hex_color || undefined,
      });
      setNewValue({ attribute_id: "", value: "", slug: "", hex_color: "" });
    } catch (error) {
      console.error("Failed to create attribute value:", error);
    }
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading attributes...</div>;
  }

  return (
    <Card className="border border-border/50 bg-card/50">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground">Quick Add Attributes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs defaultValue="attributes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-7">
            <TabsTrigger value="attributes" className="text-xs py-1">Attributes</TabsTrigger>
            <TabsTrigger value="values" className="text-xs py-1">Values</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attributes" className="space-y-2 mt-2">
            <div className="flex gap-1">
              <Input
                placeholder="Name"
                value={newAttribute.name}
                onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                className="h-7 text-xs flex-1"
              />
              <Input
                placeholder="Slug"
                value={newAttribute.slug}
                onChange={(e) => setNewAttribute({ ...newAttribute, slug: e.target.value })}
                className="h-7 text-xs flex-1"
              />
              <Select
                value={newAttribute.type}
                onValueChange={(value) => setNewAttribute({ ...newAttribute, type: value })}
              >
                <SelectTrigger className="h-7 text-xs w-16">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
              <Button
                type="button"
                onClick={handleCreateAttribute}
                disabled={createAttribute.isPending}
                size="sm"
                className="h-7 text-xs px-2"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-1 max-h-20 overflow-y-auto">
              {attributes.slice(0, 3).map((attr) => (
                <div key={attr.id} className="flex items-center justify-between p-1 rounded text-xs bg-muted/30">
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="text-xs py-0 px-1 h-4">{attr.type}</Badge>
                    <span className="font-medium">{attr.name}</span>
                    <span className="text-muted-foreground">({attr.values?.length || 0})</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAttribute.mutate(attr.id)}
                    disabled={deleteAttribute.isPending}
                    className="h-4 w-4 p-0 text-destructive"
                  >
                    <Trash2 className="h-2 w-2" />
                  </Button>
                </div>
              ))}
              {attributes.length > 3 && (
                <div className="text-xs text-muted-foreground text-center">+{attributes.length - 3} more</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="values" className="space-y-2 mt-2">
            <div className="space-y-1">
              <Select
                value={newValue.attribute_id}
                onValueChange={(value) => setNewValue({ ...newValue, attribute_id: value })}
              >
                <SelectTrigger className="h-7 text-xs">
                  <SelectValue placeholder="Select attribute" />
                </SelectTrigger>
                <SelectContent>
                  {attributes.map((attr) => (
                    <SelectItem key={attr.id} value={attr.id.toString()}>
                      {attr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="flex gap-1">
                <Input
                  placeholder="Value"
                  value={newValue.value}
                  onChange={(e) => setNewValue({ ...newValue, value: e.target.value })}
                  className="h-7 text-xs flex-1"
                />
                {newValue.attribute_id && attributes.find(a => a.id.toString() === newValue.attribute_id)?.type === 'color' && (
                  <Input
                    placeholder="#hex"
                    value={newValue.hex_color}
                    onChange={(e) => setNewValue({ ...newValue, hex_color: e.target.value })}
                    className="h-7 text-xs w-16"
                  />
                )}
                <Button
                  type="button"
                  onClick={handleCreateValue}
                  disabled={createAttributeValue.isPending}
                  size="sm"
                  className="h-7 text-xs px-2"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="space-y-1 max-h-20 overflow-y-auto">
              {attributes.flatMap(attr => 
                attr.values?.slice(0, 2).map((value) => (
                  <div key={value.id} className="flex items-center justify-between p-1 rounded text-xs bg-muted/30">
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs py-0 px-1 h-4">{attr.name}</Badge>
                      <span>{value.value}</span>
                      {value.hex_color && (
                        <div 
                          className="w-2 h-2 rounded border"
                          style={{ backgroundColor: value.hex_color }}
                        />
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAttributeValue.mutate(value.id)}
                      disabled={deleteAttributeValue.isPending}
                      className="h-4 w-4 p-0 text-destructive"
                    >
                      <Trash2 className="h-2 w-2" />
                    </Button>
                  </div>
                )) || []
              ).slice(0, 4)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};