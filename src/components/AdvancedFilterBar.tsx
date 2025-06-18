
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose } from "@/components/ui/drawer";
import { Search, Filter, X, Calendar as CalendarIcon, Download, FileSpreadsheet, FileText } from "lucide-react";
import { format } from "date-fns";

interface FilterOption {
  value: string;
  label: string;
}

interface AdvancedFilterBarProps {
  searchPlaceholder?: string;
  statusOptions?: FilterOption[];
  categoryOptions?: FilterOption[];
  onSearch?: (term: string) => void;
  onStatusFilter?: (status: string) => void;
  onCategoryFilter?: (category: string) => void;
  onDateRangeFilter?: (startDate: Date | undefined, endDate: Date | undefined) => void;
  onAmountRangeFilter?: (min: number | undefined, max: number | undefined) => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  showStatusFilter?: boolean;
  showCategoryFilter?: boolean;
  showDateFilter?: boolean;
  showAmountFilter?: boolean;
  showExcelExport?: boolean;
  showPDFExport?: boolean;
  exportLabel?: string;
}

export function AdvancedFilterBar({
  searchPlaceholder = "Search...",
  statusOptions = [],
  categoryOptions = [],
  onSearch,
  onStatusFilter,
  onCategoryFilter,
  onDateRangeFilter,
  onAmountRangeFilter,
  onExportExcel,
  onExportPDF,
  showStatusFilter = false,
  showCategoryFilter = false,
  showDateFilter = false,
  showAmountFilter = false,
  showExcelExport = false,
  showPDFExport = false,
  exportLabel = "Export",
}: AdvancedFilterBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [minAmount, setMinAmount] = useState<string>("");
  const [maxAmount, setMaxAmount] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleStatusFilter = (status: string) => {
    setSelectedStatus(status);
    onStatusFilter?.(status === "all" ? "" : status);
    updateActiveFilters("status", status, status !== "all" ? statusOptions.find(s => s.value === status)?.label || status : null);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    onCategoryFilter?.(category === "all" ? "" : category);
    updateActiveFilters("category", category, category !== "all" ? categoryOptions.find(c => c.value === category)?.label || category : null);
  };

  const updateActiveFilters = (type: string, value: string, label: string | null) => {
    const newFilters = activeFilters.filter(f => !f.startsWith(`${type}:`));
    if (label) {
      newFilters.push(`${type}:${label}`);
    }
    setActiveFilters(newFilters);
  };

  const applyFilters = () => {
    if (showDateFilter) {
      onDateRangeFilter?.(startDate, endDate);
    }
    if (showAmountFilter) {
      onAmountRangeFilter?.(
        minAmount ? parseFloat(minAmount) : undefined,
        maxAmount ? parseFloat(maxAmount) : undefined
      );
    }
    setIsFilterOpen(false);
  };

  const clearAllFilters = () => {
    setActiveFilters([]);
    setSelectedStatus('all');
    setSelectedCategory('all');
    setStartDate(undefined);
    setEndDate(undefined);
    setMinAmount('');
    setMaxAmount('');
    setSearchTerm('');
    onSearch?.('');
    onStatusFilter?.('');
    onCategoryFilter?.('');
    onDateRangeFilter?.(undefined, undefined);
    onAmountRangeFilter?.(undefined, undefined);
  };

  const removeFilter = (filter: string) => {
    setActiveFilters(activeFilters.filter(f => f !== filter));
    const [type] = filter.split(':');
    if (type === 'status') {
      setSelectedStatus('all');
      onStatusFilter?.('');
    } else if (type === 'category') {
      setSelectedCategory('all');
      onCategoryFilter?.('');
    }
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:bg-white dark:focus:bg-gray-800 transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {showStatusFilter && (
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all">All Status</SelectItem>
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
              <SelectTrigger className="w-36 bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Drawer open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DrawerTrigger asChild>
              <Button variant="outline" className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DrawerTrigger>
            <DrawerContent className="bg-white dark:bg-gray-800">
              <DrawerHeader>
                <DrawerTitle className="text-gray-900 dark:text-gray-100">Filters</DrawerTitle>
              </DrawerHeader>
              <div className="p-6 space-y-6">
                {showDateFilter && (
                  <div>
                    <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Order Date</h3>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm text-gray-600 dark:text-gray-400">From</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {startDate ? format(startDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-gray-600 dark:text-gray-400">To</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {endDate ? format(endDate, "PPP") : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-800">
                            <Calendar
                              mode="single"
                              selected={endDate}
                              onSelect={setEndDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                )}

                {showAmountFilter && (
                  <div>
                    <h3 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Order Amount</h3>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Min</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                          className="bg-gray-50 dark:bg-gray-700"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-sm text-gray-600 dark:text-gray-400">Max</label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(e.target.value)}
                          className="bg-gray-50 dark:bg-gray-700"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button onClick={applyFilters} className="flex-1">
                    Apply Filters
                  </Button>
                  <DrawerClose asChild>
                    <Button variant="outline" className="flex-1">
                      Cancel
                    </Button>
                  </DrawerClose>
                </div>
              </div>
            </DrawerContent>
          </Drawer>

          {(showExcelExport || showPDFExport) && (
            <div className="flex gap-1">
              {showExcelExport && (
                <Button onClick={onExportExcel} variant="outline" className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100">
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {exportLabel}
                </Button>
              )}
              {showPDFExport && (
                <Button onClick={onExportPDF} variant="outline" className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100">
                  <FileText className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge 
              key={filter} 
              variant="secondary" 
              className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800"
            >
              {filter.split(':')[1]}
              <button
                onClick={() => removeFilter(filter)}
                className="ml-1 hover:text-blue-900 dark:hover:text-blue-100"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
