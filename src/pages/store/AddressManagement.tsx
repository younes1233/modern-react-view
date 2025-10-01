import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Phone, Pencil, Trash2, Check, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { addressService, Address } from "@/services/addressService";
import AddressForm from "@/components/AddressForm";
import { StoreLayout } from "@/components/store/StoreLayout";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const AddressManagement = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressService.getAddresses();
      setAddresses(data || []);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      setAddresses([]);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load addresses",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await addressService.setDefaultAddress(id);
      toast({
        title: "Success",
        description: "Default address updated",
      });
      fetchAddresses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to set default address",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await addressService.deleteAddress(deleteId);
      toast({
        title: "Success",
        description: "Address deleted successfully",
      });
      setDeleteId(null);
      fetchAddresses();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete address",
      });
    }
  };

  const getAddressTypeBadge = (type: string) => {
    const config: Record<string, { gradient: string; text: string }> = {
      home: { gradient: "from-blue-500 to-indigo-600", text: "Home" },
      office: { gradient: "from-purple-500 to-pink-600", text: "Office" },
      other: { gradient: "from-gray-500 to-slate-600", text: "Other" },
    };

    const { gradient, text } = config[type] || config.other;

    return (
      <Badge className={`bg-gradient-to-r ${gradient} text-white text-xs py-0.5 px-2 shadow-sm`}>
        {text}
      </Badge>
    );
  };

  if (loading) {
    return (
      <StoreLayout>
        <div className="min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-gray-600">Loading addresses...</p>
            </div>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Addresses</h1>
              <p className="text-sm sm:text-base text-gray-600">
                Manage your delivery addresses
              </p>
            </div>
            <Button
              onClick={() => { setSelectedAddress(undefined); setFormOpen(true); }}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Inline Add/Edit Form */}
            {(formOpen || addresses.length === 0) && (
              <Card className="border-0 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-2 pt-4 px-4 sm:px-6 border-b border-cyan-100/50">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2 text-gray-900 font-semibold">
                    <div className="p-1.5 bg-cyan-600 rounded-lg">
                      <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    {selectedAddress ? 'Edit Address' : 'Add New Address'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 py-4 sm:px-6 sm:py-5">
                  <AddressForm
                    open={true}
                    onOpenChange={setFormOpen}
                    address={selectedAddress}
                    onSuccess={() => {
                      fetchAddresses();
                      setFormOpen(false);
                      setSelectedAddress(undefined);
                    }}
                    inline={true}
                  />
                </CardContent>
              </Card>
            )}

            {/* Existing Addresses */}
            {addresses.length === 0 && !formOpen ? (
              <div className="text-center py-16">
                <MapPin className="w-20 sm:w-24 h-20 sm:h-24 text-gray-300 mx-auto mb-6" />
                <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">No addresses yet</h2>
                <p className="text-gray-600 mb-8 max-w-md mx-auto text-sm sm:text-base">
                  Add your first delivery address to get started
                </p>
              </div>
            ) : addresses.length > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-gray-600 text-sm sm:text-base">
                    {addresses.length} {addresses.length === 1 ? 'address' : 'addresses'} saved
                  </p>
                </div>

                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {addresses.map((address) => (
                  <Card key={address.id} className="relative border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden group">
                    {/* Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500"></div>

                    {address.is_default && (
                      <div className="absolute top-3 right-3 z-10">
                        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-xs py-0.5 px-2 shadow-md">
                          <Check className="h-2.5 w-2.5 mr-1" />
                          Default
                        </Badge>
                      </div>
                    )}
                    <CardHeader className="pb-2 pt-4 px-4 sm:px-5">
                      <CardTitle className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
                            <MapPin className="h-4 w-4 text-cyan-600" />
                          </div>
                          {getAddressTypeBadge(address.type)}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="px-4 pb-4 sm:px-5 sm:pb-5">
                      <div className="space-y-2.5">
                        <div className="bg-gray-50 rounded-lg p-2.5">
                          <p className="text-xs text-gray-800 line-clamp-2 leading-relaxed">{address.address}</p>
                        </div>

                        {address.phone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <div className="p-1 bg-gray-100 rounded">
                              <Phone className="h-3 w-3 text-gray-600 flex-shrink-0" />
                            </div>
                            <p className="text-xs font-medium">{address.phone}</p>
                          </div>
                        )}

                        {address.delivery_zone && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <div className="p-1 bg-gray-100 rounded">
                              <Package className="h-3 w-3 text-gray-600 flex-shrink-0" />
                            </div>
                            <p className="text-xs font-medium">
                              {address.delivery_zone.name}
                            </p>
                          </div>
                        )}

                        <div className="flex gap-1.5 pt-3 border-t border-gray-100">
                          {!address.is_default && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleSetDefault(address.id)}
                              className="flex-1 text-xs h-8 text-cyan-600 border-cyan-300 hover:bg-cyan-600 hover:text-white hover:border-cyan-600 transition-all px-2 font-medium"
                            >
                              Set Default
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 text-xs h-8 hover:bg-gray-100 border-gray-300 transition-all px-2"
                            onClick={() => { setSelectedAddress(address); setFormOpen(true); }}
                          >
                            <Pencil className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteId(address.id)}
                            className="text-xs h-8 text-red-600 border-red-300 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all px-2"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
          </div>

          <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Address</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this address? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </StoreLayout>
  );
};

export default AddressManagement;