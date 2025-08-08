
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
import { Plus, Edit, Trash2 } from "lucide-react";
import { CurrencyModal } from "./CurrencyModal";

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isBaseCurrency: boolean;
  isActive: boolean;
  countries: string[];
}

// Mock data
const mockCurrencies: Currency[] = [
  { 
    id: 1, 
    code: "USD", 
    name: "US Dollar", 
    symbol: "$", 
    exchangeRate: 1.0, 
    isBaseCurrency: true, 
    isActive: true,
    countries: ["United States"]
  },
  { 
    id: 2, 
    code: "EUR", 
    name: "Euro", 
    symbol: "€", 
    exchangeRate: 0.85, 
    isBaseCurrency: false, 
    isActive: true,
    countries: ["Germany", "France", "Italy"]
  },
  { 
    id: 3, 
    code: "GBP", 
    name: "British Pound", 
    symbol: "£", 
    exchangeRate: 0.73, 
    isBaseCurrency: false, 
    isActive: true,
    countries: ["United Kingdom"]
  },
  { 
    id: 4, 
    code: "CAD", 
    name: "Canadian Dollar", 
    symbol: "C$", 
    exchangeRate: 1.35, 
    isBaseCurrency: false, 
    isActive: false,
    countries: ["Canada"]
  },
];

export const CurrencyManagement = () => {
  const [currencies, setCurrencies] = useState<Currency[]>(mockCurrencies);
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

  const handleDeleteCurrency = (id: number) => {
    setCurrencies(currencies.filter(currency => currency.id !== id));
  };

  const handleSaveCurrency = (currencyData: Omit<Currency, 'id'>) => {
    if (editingCurrency) {
      setCurrencies(currencies.map(currency => 
        currency.id === editingCurrency.id 
          ? { ...currencyData, id: editingCurrency.id }
          : currency
      ));
    } else {
      const newCurrency = { ...currencyData, id: Date.now() };
      setCurrencies([...currencies, newCurrency]);
    }
    setIsModalOpen(false);
    setEditingCurrency(null);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Currencies</CardTitle>
              <CardDescription>Manage currencies and exchange rates</CardDescription>
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
                <TableHead>Exchange Rate</TableHead>
                <TableHead>Countries</TableHead>
                <TableHead>Type</TableHead>
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
                    {currency.isBaseCurrency ? "Base" : currency.exchangeRate.toFixed(4)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {currency.countries.map((country, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {country}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    {currency.isBaseCurrency && (
                      <Badge variant="default">Base Currency</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={currency.isActive ? "default" : "secondary"}>
                      {currency.isActive ? "Active" : "Inactive"}
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
                        disabled={currency.isBaseCurrency}
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
