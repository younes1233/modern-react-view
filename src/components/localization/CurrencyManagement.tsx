
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CurrencyModal } from "./CurrencyModal";
import { useCurrencies } from "@/hooks/useCurrencies";
import { Currency } from "@/services/currencyService";

export const CurrencyManagement = () => {
  const { currencies, loading, error, createCurrency, updateCurrency, deleteCurrency } = useCurrencies();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);

  const handleAddCurrency = () => {
    setEditingCurrency(null);
    setIsModalOpen(true);
  };

  const handleEditCurrency = (currency: Currency) => {
    setEditingCurrency(currency);
    setIsModalOpen(true);
  };

  const handleDeleteCurrency = async (id: number) => {
    if (confirm('Are you sure you want to delete this currency?')) {
      await deleteCurrency(id);
    }
  };

  const handleSaveCurrency = async (currencyData: {
    code: string;
    name: string;
    symbol: string;
    is_active: boolean;
  }) => {
    try {
      if (editingCurrency) {
        await updateCurrency(editingCurrency.id, {
          name: currencyData.name,
          symbol: currencyData.symbol,
          is_active: currencyData.is_active,
        });
      } else {
        await createCurrency(currencyData);
      }
      setIsModalOpen(false);
      setEditingCurrency(null);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Global Currencies</CardTitle>
              <CardDescription>Loading currencies...</CardDescription>
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Global Currencies</CardTitle>
          <CardDescription className="text-red-600">{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Global Currencies</CardTitle>
              <CardDescription>
                Manage available currencies. Exchange rates are set per country in the Countries tab.
              </CardDescription>
            </div>
            <Button onClick={handleAddCurrency}>
              <Plus className="w-4 h-4 mr-2" />
              Add Currency
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Symbol</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currencies.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell>
                    <Badge variant="outline">{currency.code}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{currency.name}</TableCell>
                  <TableCell className="text-lg font-bold">{currency.symbol}</TableCell>
                  <TableCell>
                    <Badge variant={currency.is_active ? "default" : "secondary"}>
                      {currency.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditCurrency(currency)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCurrency(currency.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CurrencyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCurrency}
        currency={editingCurrency}
      />
    </div>
  );
};
