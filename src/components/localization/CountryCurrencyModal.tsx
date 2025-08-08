
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

interface CountryCurrency {
  currencyCode: string;
  currencyName: string;
  currencySymbol: string;
  exchangeRate: number;
  isBaseCurrency: boolean;
}

interface Country {
  id: number;
  name: string;
  code: string;
  flag: string;
  isActive: boolean;
  currencies: CountryCurrency[];
}

interface CountryCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (currencies: CountryCurrency[]) => void;
  country: Country | null;
}

const availableCurrencies = [
  { code: "USD", name: "US Dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "C$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
];

export const CountryCurrencyModal = ({ isOpen, onClose, onSave, country }: CountryCurrencyModalProps) => {
  const [currencies, setCurrencies] = useState<CountryCurrency[]>([]);
  const [editingCurrency, setEditingCurrency] = useState<CountryCurrency | null>(null);
  const [isAddingCurrency, setIsAddingCurrency] = useState(false);
  const [newCurrencyForm, setNewCurrencyForm] = useState({
    currencyCode: "",
    exchangeRate: 1.0,
    isBaseCurrency: false,
  });

  useEffect(() => {
    if (country) {
      setCurrencies([...country.currencies]);
    } else {
      setCurrencies([]);
    }
  }, [country]);

  const handleAddCurrency = () => {
    setNewCurrencyForm({
      currencyCode: "",
      exchangeRate: 1.0,
      isBaseCurrency: currencies.length === 0, // First currency is base by default
    });
    setEditingCurrency(null);
    setIsAddingCurrency(true);
  };

  const handleEditCurrency = (currency: CountryCurrency) => {
    setNewCurrencyForm({
      currencyCode: currency.currencyCode,
      exchangeRate: currency.exchangeRate,
      isBaseCurrency: currency.isBaseCurrency,
    });
    setEditingCurrency(currency);
    setIsAddingCurrency(true);
  };

  const handleDeleteCurrency = (currencyCode: string) => {
    const updatedCurrencies = currencies.filter(c => c.currencyCode !== currencyCode);
    // If we deleted the base currency, make the first remaining currency the base
    if (updatedCurrencies.length > 0 && !updatedCurrencies.some(c => c.isBaseCurrency)) {
      updatedCurrencies[0].isBaseCurrency = true;
      updatedCurrencies[0].exchangeRate = 1.0;
    }
    setCurrencies(updatedCurrencies);
  };

  const handleSaveCurrency = () => {
    const selectedCurrency = availableCurrencies.find(c => c.code === newCurrencyForm.currencyCode);
    if (!selectedCurrency) return;

    const newCurrency: CountryCurrency = {
      currencyCode: selectedCurrency.code,
      currencyName: selectedCurrency.name,
      currencySymbol: selectedCurrency.symbol,
      exchangeRate: newCurrencyForm.isBaseCurrency ? 1.0 : newCurrencyForm.exchangeRate,
      isBaseCurrency: newCurrencyForm.isBaseCurrency,
    };

    let updatedCurrencies;
    if (editingCurrency) {
      updatedCurrencies = currencies.map(c => 
        c.currencyCode === editingCurrency.currencyCode ? newCurrency : c
      );
    } else {
      updatedCurrencies = [...currencies, newCurrency];
    }

    // If this currency is set as base, remove base status from others
    if (newCurrency.isBaseCurrency) {
      updatedCurrencies = updatedCurrencies.map(c => ({
        ...c,
        isBaseCurrency: c.currencyCode === newCurrency.currencyCode,
        exchangeRate: c.currencyCode === newCurrency.currencyCode ? 1.0 : c.exchangeRate,
      }));
    }

    setCurrencies(updatedCurrencies);
    setIsAddingCurrency(false);
    setEditingCurrency(null);
  };

  const handleSave = () => {
    onSave(currencies);
  };

  if (!country) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Manage Currencies for {country.name} {country.flag}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              Configure currencies and their exchange rates specific to this country
            </p>
            <Button onClick={handleAddCurrency}>
              <Plus className="w-4 h-4 mr-2" />
              Add Currency
            </Button>
          </div>

          {currencies.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Exchange Rate</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies.map((currency) => (
                  <TableRow key={currency.currencyCode}>
                    <TableCell>
                      <div>
                        <Badge variant="outline">{currency.currencyCode}</Badge>
                        <div className="text-sm text-muted-foreground">{currency.currencyName}</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-lg font-bold">{currency.currencySymbol}</TableCell>
                    <TableCell>
                      {currency.isBaseCurrency ? (
                        <Badge variant="default">Base (1.0000)</Badge>
                      ) : (
                        currency.exchangeRate.toFixed(4)
                      )}
                    </TableCell>
                    <TableCell>
                      {currency.isBaseCurrency && (
                        <Badge variant="default">Base Currency</Badge>
                      )}
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
                          onClick={() => handleDeleteCurrency(currency.currencyCode)}
                          disabled={currency.isBaseCurrency && currencies.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No currencies added yet. Add a currency to get started.
            </div>
          )}

          {isAddingCurrency && (
            <div className="border rounded-lg p-4 space-y-4">
              <h4 className="font-medium">
                {editingCurrency ? "Edit Currency" : "Add New Currency"}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={newCurrencyForm.currencyCode}
                    onValueChange={(value) => setNewCurrencyForm({ ...newCurrencyForm, currencyCode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCurrencies
                        .filter(ac => !currencies.some(c => c.currencyCode === ac.code) || editingCurrency?.currencyCode === ac.code)
                        .map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name} ({currency.symbol})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Exchange Rate</Label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={newCurrencyForm.exchangeRate}
                    onChange={(e) => setNewCurrencyForm({ 
                      ...newCurrencyForm, 
                      exchangeRate: parseFloat(e.target.value) || 0 
                    })}
                    disabled={newCurrencyForm.isBaseCurrency}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={newCurrencyForm.isBaseCurrency}
                  onCheckedChange={(checked) => setNewCurrencyForm({ 
                    ...newCurrencyForm, 
                    isBaseCurrency: checked,
                    exchangeRate: checked ? 1.0 : newCurrencyForm.exchangeRate
                  })}
                />
                <Label>Set as base currency</Label>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSaveCurrency} disabled={!newCurrencyForm.currencyCode}>
                  {editingCurrency ? "Update" : "Add"} Currency
                </Button>
                <Button variant="outline" onClick={() => setIsAddingCurrency(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
