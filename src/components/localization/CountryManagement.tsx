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
import { Plus, Edit, Trash2, DollarSign } from "lucide-react";
import { CountryModal } from "./CountryModal";
import { CountryCurrencyModal } from "./CountryCurrencyModal";
import { useCountries } from "@/hooks/useCountries";
import { Country } from "@/services/countryService";

export const CountryManagement = () => {
  const { countries, loading, error, createCountry, updateCountry, deleteCountry } = useCountries();
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

  const handleDeleteCountry = async (id: number) => {
    if (confirm('Are you sure you want to delete this country?')) {
      await deleteCountry(id);
    }
  };

  const handleManageCurrencies = (country: Country) => {
    setManagingCurrencyCountry(country);
    setIsCurrencyModalOpen(true);
  };

  const handleSaveCountry = async (countryData: {
    name: string;
    iso_code: string;
    default_vat_percentage: string;
    base_currency_id?: number;
    currencies?: number[] | string[];
  }) => {
    try {
      if (editingCountry) {
        await updateCountry(editingCountry.id, countryData);
      } else {
        await createCountry(countryData);
      }
      setIsModalOpen(false);
      setEditingCountry(null);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  // Convert API country format to legacy format for CountryCurrencyModal
  const convertToLegacyCountry = (country: Country) => ({
    id: country.id,
    name: country.name,
    code: country.iso_code,
    flag: getFlagEmoji(country.iso_code),
    isActive: true,
    currencies: country.currencies.map(currency => ({
      currencyCode: currency.code,
      currencyName: currency.name,
      currencySymbol: currency.symbol,
      exchangeRate: currency.id === country.base_currency.id ? 1.0 : 1.0,
      isBaseCurrency: currency.id === country.base_currency.id,
    })),
  });

  const handleSaveCountryCurrencies = (currencies: any[]) => {
    // This would need API implementation for updating country currencies
    console.log('Saving country currencies:', currencies);
    setIsCurrencyModalOpen(false);
    setManagingCurrencyCountry(null);
  };

  const getFlagEmoji = (isoCode: string) => {
    const flagMap: Record<string, string> = {
      'US': '🇺🇸',
      'GB': '🇬🇧',
      'DE': '🇩🇪',
      'CA': '🇨🇦',
      'FR': '🇫🇷',
      'AU': '🇦🇺',
      'JP': '🇯🇵',
      'CN': '🇨🇳',
      'IN': '🇮🇳',
    };
    return flagMap[isoCode] || '🌍';
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Countries</CardTitle>
              <CardDescription>Loading countries...</CardDescription>
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
          <CardTitle>Countries</CardTitle>
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
                <TableHead>VAT %</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => (
                <TableRow key={country.id}>
                  <TableCell>
                    <span className="text-2xl">{getFlagEmoji(country.iso_code)}</span>
                  </TableCell>
                  <TableCell className="font-medium">{country.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{country.iso_code}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{country.base_currency.code}</Badge>
                      <span className="text-lg font-bold">{country.base_currency.symbol}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{country.currencies.length}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{country.default_vat_percentage}%</Badge>
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
              ))}
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
        country={managingCurrencyCountry ? convertToLegacyCountry(managingCurrencyCountry) : null}
      />
    </div>
  );
};
