
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Filter, X, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";

interface FilterBarProps {
  searchPlaceholder?: string;
  statusOptions?: { value: string; label: string }[];
  categoryOptions?: { value: string; label: string }[];
  onSearch?: (term: string) => void;
  onStatusFilter?: (status: string) => void;
  onCategoryFilter?: (category: string) => void;
  onDateFilter?: (date: Date | undefined) => void;
  showDateFilter?: boolean;
  showStatusFilter?: boolean;
  showCategoryFilter?: boolean;
}

export function FilterBar({
  searchPlaceholder = "Search...",
  statusOptions = [],
  categoryOptions = [],
  onSearch,
  onStatusFilter,
  onCategoryFilter,
  onDateFilter,
  showDateFilter = false,
  showStatusFilter = false,
  showCategoryFilter = false,
}: FilterBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    onStatusFilter?.(status);
    if (status && !activeFilters.includes(`status:${status}`)) {
      setActiveFilters([...activeFilters, `status:${status}`]);
    }
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    onCategoryFilter?.(category);
    if (category && !activeFilters.includes(`category:${category}`)) {
      setActiveFilters([...activeFilters, `category:${category}`]);
    }
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
    if (filter.startsWith('status:')) {
      setSelectedStatus('');
      onStatusFilter?.('');
    } else if (filter.startsWith('category:')) {
      setSelectedCategory('');
      onCategoryFilter?.('');
    }
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSelectedStatus('');
    setSelectedCategory('');
    setSelectedDate(undefined);
    setSearchTerm('');
    onSearch?.('');
    onStatusFilter?.('');
    onCategoryFilter?.('');
    onDateFilter?.(undefined);
  };

  return (
    <div className="space-y-4 p-4 bg-white rounded-lg border shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {showStatusFilter && (
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32 bg-gray-50 border-gray-200">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showCategoryFilter && (
            <Select value={selectedCategory} onValueChange={handleCategoryFilter}>
              <SelectTrigger className="w-36 bg-gray-50 border-gray-200">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {showDateFilter && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="bg-gray-50 border-gray-200">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    onDateFilter?.(date);
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          )}

          <Button 
            variant="outline" 
            className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge 
              key={filter} 
              variant="secondary" 
              className="bg-blue-100 text-blue-800 hover:bg-blue-200"
            >
              {filter.replace('status:', '').replace('category:', '')}
              <button
                onClick={() => removeFilter(filter)}
                className="ml-1 hover:text-blue-900"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
