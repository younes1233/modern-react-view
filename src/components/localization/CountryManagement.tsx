
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
import { CountryModal } from "./CountryModal";

interface Country {
  id: number;
  name: string;
  code: string;
  currency: string;
  flag: string;
  isActive: boolean;
}

// Mock data
const mockCountries: Country[] = [
  { id: 1, name: "United States", code: "US", currency: "USD", flag: "🇺🇸", isActive: true },
  { id: 2, name: "United Kingdom", code: "GB", currency: "GBP", flag: "🇬🇧", isActive: true },
  { id: 3, name: "Germany", code: "DE", currency: "EUR", flag: "🇩🇪", isActive: true },
  { id: 4, name: "Canada", code: "CA", currency: "CAD", flag: "🇨🇦", isActive: false },
];

export const CountryManagement = () => {
  const [countries, setCountries] = useState<Country[]>(mockCountries);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Countries</CardTitle>
              <CardDescription>Manage countries and their associated currencies</CardDescription>
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
                <TableHead>Currency</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {countries.map((country) => (
                <TableRow key={country.id}>
                  <TableCell>
                    <span className="text-2xl">{country.flag}</span>
                  </TableCell>
                  <TableCell className="font-medium">{country.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{country.code}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{country.currency}</Badge>
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
    </div>
  );
};
