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
    <Card className="border-2 border-dashed border-muted">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Quick Attribute Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="attributes" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="attributes" className="text-xs">Attributes</TabsTrigger>
            <TabsTrigger value="values" className="text-xs">Values</TabsTrigger>
          </TabsList>
          
          <TabsContent value="attributes" className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Attribute name"
                    value={newAttribute.name}
                    onChange={(e) => setNewAttribute({ ...newAttribute, name: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Slug"
                    value={newAttribute.slug}
                    onChange={(e) => setNewAttribute({ ...newAttribute, slug: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select
                  value={newAttribute.type}
                  onValueChange={(value) => setNewAttribute({ ...newAttribute, type: value })}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="color">Color</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleCreateAttribute}
                  disabled={createAttribute.isPending}
                  size="sm"
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              </div>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto">
              {attributes.map((attr) => (
                <div key={attr.id} className="flex items-center justify-between p-2 rounded border bg-muted/50">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{attr.type}</Badge>
                    <span className="text-xs font-medium">{attr.name}</span>
                    <span className="text-xs text-muted-foreground">({attr.values?.length || 0} values)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteAttribute.mutate(attr.id)}
                    disabled={deleteAttribute.isPending}
                    className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="values" className="space-y-3">
            <div className="grid grid-cols-1 gap-2">
              <Select
                value={newValue.attribute_id}
                onValueChange={(value) => setNewValue({ ...newValue, attribute_id: value })}
              >
                <SelectTrigger className="h-8 text-xs">
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
              
              <div className="flex gap-2">
                <Input
                  placeholder="Value"
                  value={newValue.value}
                  onChange={(e) => setNewValue({ ...newValue, value: e.target.value })}
                  className="h-8 text-xs"
                />
                <Input
                  placeholder="Slug (optional)"
                  value={newValue.slug}
                  onChange={(e) => setNewValue({ ...newValue, slug: e.target.value })}
                  className="h-8 text-xs"
                />
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="Color (hex)"
                  value={newValue.hex_color}
                  onChange={(e) => setNewValue({ ...newValue, hex_color: e.target.value })}
                  className="h-8 text-xs"
                />
                <Button
                  onClick={handleCreateValue}
                  disabled={createAttributeValue.isPending}
                  size="sm"
                  className="h-8 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Value
                </Button>
              </div>
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto">
              {attributes.map((attr) =>
                attr.values?.map((value) => (
                  <div key={value.id} className="flex items-center justify-between p-2 rounded border bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{attr.name}</Badge>
                      <span className="text-xs">{value.value}</span>
                      {value.hex_color && (
                        <div 
                          className="w-3 h-3 rounded border"
                          style={{ backgroundColor: value.hex_color }}
                        />
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteAttributeValue.mutate(value.id)}
                      disabled={deleteAttributeValue.isPending}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};