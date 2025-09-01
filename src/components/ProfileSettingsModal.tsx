import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { FileUpload } from '@/components/ui/file-upload';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { User, Mail, Phone, MapPin, Bell, Shield, Palette } from 'lucide-react';
import { useCountries } from '@/hooks/useCountries';
import { useWarehouses } from '@/hooks/useWarehouses';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/**
 * Props for the ProfileSettingsModal component.  The modal is toggled
 * externally via the isOpen/onClose props and does not manage its own
 * visibility state.
 */
interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileSettingsModal({ isOpen, onClose }: ProfileSettingsModalProps) {
  const { user } = useAuth() || {};
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Access localization from context; destructure setters as well
  const {
    country,
    store,
    warehouse,
    setCountry,
    setStore,
    setWarehouse,
  } = useAuth() || {};

  // Fetch countries and warehouses.  Passing the selectedCountryId string
  // directly is safe because useWarehouses converts it to a number internally.
  const { countries = [], loading: countriesLoading } = useCountries();
  const [selectedCountryId, setSelectedCountryId] = useState(
    country?.id ? String(country.id) : ''
  );
  const { warehouses = [], loading: warehousesLoading } = useWarehouses(
    selectedCountryId || undefined
  );
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(
    warehouse?.id ? String(warehouse.id) : ''
  );
  const [selectedStore, setSelectedStoreLocal] = useState(store || '');

  // When the underlying context values change (e.g. after saving), rehydrate
  // the local selections to match.  This keeps the form in sync when the
  // modal is reopened after a save.
  useEffect(() => {
    setSelectedCountryId(country?.id ? String(country.id) : '');
    setSelectedStoreLocal(store || '');
    setSelectedWarehouseId(warehouse?.id ? String(warehouse.id) : '');
  }, [country, store, warehouse]);

  // Whenever the selected country changes, clear the warehouse selection
  useEffect(() => {
    setSelectedWarehouseId('');
  }, [selectedCountryId]);

  /**
   * Persist the localization selections back into context.  We look up
   * the selected objects from the lists to pass the full objects (not
   * just the IDs) into the context setters.  If no selection has been
   * made for a field, `null` is passed to clear it.
   */
  const handleSaveLocalization = () => {
    const selectedCountryObj = countries.find(
      (c) => String(c.id) === selectedCountryId
    );
    const selectedWarehouseObj = selectedWarehouseId
      ? warehouses.find((w) => String(w.id) === selectedWarehouseId)
      : null;
    setCountry?.(selectedCountryObj || null);
    setStore?.(selectedStore || null);
    setWarehouse?.(selectedWarehouseObj || null);
    toast({
      title: 'Localization updated',
      description: 'Your localization preferences have been saved.',
    });
  };

  // State for profile info fields
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    bio: '',
    avatar: '',
  });
  // Notification preferences
  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailMarketing: false,
    pushNotifications: true,
    smsNotifications: false,
  });
  // App preferences (theme, etc.)
  const [preferences, setPreferences] = useState({
    theme: 'system',
    language: 'en',
    timezone: 'UTC',
  });

  // Fake profile update to demonstrate loading state
  const handleProfileUpdate = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, avatar: imageUrl }));
      toast({
        title: 'Avatar Uploaded',
        description: 'Your profile picture has been updated',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Profile Settings
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="localization">Localization</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            {/* <TabsTrigger value="preferences">Preferences</TabsTrigger> */}
          </TabsList>
          <TabsContent value="localization">
            <Card>
              <CardHeader>
                <CardTitle>Localization</CardTitle>
                <CardDescription>
                  Select your default country, store and warehouse.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={selectedCountryId}
                    onValueChange={(value) => setSelectedCountryId(value)}
                  >
                    <SelectTrigger id="country">
                      <SelectValue placeholder="Select a country" />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="store">Store</Label>
                  <Input
                    id="store"
                    placeholder="Store name or ID"
                    value={selectedStore}
                    onChange={(e) => setSelectedStoreLocal(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="warehouse">Warehouse</Label>
                  <Select
                    value={selectedWarehouseId}
                    onValueChange={(value) => setSelectedWarehouseId(value)}
                  >
                    <SelectTrigger id="warehouse">
                      <SelectValue placeholder="Select a warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={handleSaveLocalization}>Save Localization</Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                    <AvatarFallback>{profile.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <FileUpload
                    onFileSelect={handleAvatarUpload}
                    accept="image/*"
                    placeholder="Upload new avatar"
                    className="w-64"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile((prev) => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile((prev) => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile((prev) => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={profile.address}
                      onChange={(e) => setProfile((prev) => ({ ...prev, address: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profile.bio}
                    onChange={(e) => setProfile((prev) => ({ ...prev, bio: e.target.value }))}
                    placeholder="Tell us about yourself..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Account Security
                </CardTitle>
                <CardDescription>Manage your account security settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button variant="outline" className="w-full">
                  Update Password
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>Choose how you want to be notified</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email - Order Updates</Label>
                    <p className="text-sm text-gray-500">Receive emails about your order status</p>
                  </div>
                  <Switch
                    checked={notifications.emailOrders}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, emailOrders: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email - Marketing</Label>
                    <p className="text-sm text-gray-500">Receive promotional emails and offers</p>
                  </div>
                  <Switch
                    checked={notifications.emailMarketing}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, emailMarketing: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Push Notifications</Label>
                    <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleProfileUpdate} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}