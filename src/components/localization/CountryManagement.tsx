
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
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { CountryModal } from "./CountryModal";
import { CountryCurrencyModal } from "./CountryCurrencyModal";

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

// Mock data with country-specific currencies
const mockCountries: Country[] = [
  { 
    id: 1, 
    name: "United States", 
    code: "US", 
    flag: "🇺🇸", 
    isActive: true,
    currencies: [
      { currencyCode: "USD", currencyName: "US Dollar", currencySymbol: "$", exchangeRate: 1.0, isBaseCurrency: true }
    ]
  },
  { 
    id: 2, 
    name: "United Kingdom", 
    code: "GB", 
    flag: "🇬🇧", 
    isActive: true,
    currencies: [
      { currencyCode: "GBP", currencyName: "British Pound", currencySymbol: "£", exchangeRate: 1.0, isBaseCurrency: true },
      { currencyCode: "USD", currencyName: "US Dollar", currencySymbol: "$", exchangeRate: 1.27, isBaseCurrency: false }
    ]
  },
  { 
    id: 3, 
    name: "Germany", 
    code: "DE", 
    flag: "🇩🇪", 
    isActive: true,
    currencies: [
      { currencyCode: "EUR", currencyName: "Euro", currencySymbol: "€", exchangeRate: 1.0, isBaseCurrency: true },
      { currencyCode: "USD", currencyName: "US Dollar", currencySymbol: "$", exchangeRate: 1.08, isBaseCurrency: false }
    ]
  },
  { 
    id: 4, 
    name: "Canada", 
    code: "CA", 
    flag: "🇨🇦", 
    isActive: false,
    currencies: [
      { currencyCode: "CAD", currencyName: "Canadian Dollar", currencySymbol: "C$", exchangeRate: 1.0, isBaseCurrency: true }
    ]
  },
];

export const CountryManagement = () => {
  const [countries, setCountries] = useState<Country[]>(mockCountries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCurrencyModalOpen, setIsCurrencyModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [managingCurrencyCountry, setManagingCurrencyCountry] = useState<Country | null>(null);

  const handleAddCountry = () => {
    setEditingCountry(null);
    setIsModalOpen(true);
  };

  const handleEditCountry = (country: Country) => {
    setEditingCountry(country);
    setIsModalOpen(true);
  };

  const handleDeleteCountry = (id: number) => {
    setCountries(countries.filter(country => country.id !== id));
  };

  const handleManageCurrencies = (country: Country) => {
    setManagingCurrencyCountry(country);
    setIsCurrencyModalOpen(true);
  };

  const handleSaveCountry = (countryData: Omit<Country, 'id'>) => {
    if (editingCountry) {
      setCountries(countries.map(country => 
        country.id === editingCountry.id 
          ? { ...countryData, id: editingCountry.id }
          : country
      ));
    } else {
      const newCountry = { ...countryData, id: Date.now() };
      setCountries([...countries, newCountry]);
    }
    setIsModalOpen(false);
    setEditingCountry(null);
  };

  const handleSaveCountryCurrencies = (currencies: CountryCurrency[]) => {
    if (managingCurrencyCountry) {
      setCountries(countries.map(country => 
        country.id === managingCurrencyCountry.id 
          ? { ...country, currencies }
          : country
      ));
    }
    setIsCurrencyModalOpen(false);
    setManagingCurrencyCountry(null);
  };

  const getBaseCurrency = (currencies: CountryCurrency[]) => {
    return currencies.find(c => c.isBaseCurrency);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Countries</CardTitle>
              <CardDescription>Manage countries and their specific currencies with exchange rates</CardDescription>
            </div>
            <Button onClick={handleAddCountry}>
              <Plus className="w-4 h-4 mr-2" />
              Add Country
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Flag</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Base Currency</TableHead>
                <TableHead>Total Currencies</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => {
                const baseCurrency = getBaseCurrency(country.currencies);
                return (
                  <TableRow key={country.id}>
                    <TableCell>
                      <span className="text-2xl">{country.flag}</span>
                    </TableCell>
                    <TableCell className="font-medium">{country.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{country.code}</Badge>
                    </TableCell>
                    <TableCell>
                      {baseCurrency ? (
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{baseCurrency.currencyCode}</Badge>
                          <span className="text-lg font-bold">{baseCurrency.currencySymbol}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No base currency</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{country.currencies.length}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={country.isActive ? "default" : "secondary"}>
                        {country.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleManageCurrencies(country)}
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCountry(country)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCountry(country.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CountryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCountry}
        country={editingCountry}
      />

      <CountryCurrencyModal
        isOpen={isCurrencyModalOpen}
        onClose={() => setIsCurrencyModalOpen(false)}
        onSave={handleSaveCountryCurrencies}
        country={managingCurrencyCountry}
      />
    </div>
  );
};
