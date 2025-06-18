
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
      if (startDate || endDate) {
        const dateLabel = startDate && endDate 
          ? `${format(startDate, "MMM dd")} - ${format(endDate, "MMM dd")}`
          : startDate 
          ? `From ${format(startDate, "MMM dd")}`
          : endDate 
          ? `Until ${format(endDate, "MMM dd")}`
          : "";
        updateActiveFilters("date", "custom", dateLabel);
      }
    }
    if (showAmountFilter) {
      onAmountRangeFilter?.(
        minAmount ? parseFloat(minAmount) : undefined,
        maxAmount ? parseFloat(maxAmount) : undefined
      );
      if (minAmount || maxAmount) {
        const amountLabel = minAmount && maxAmount 
          ? `$${minAmount} - $${maxAmount}`
          : minAmount 
          ? `Min $${minAmount}`
          : maxAmount 
          ? `Max $${maxAmount}`
          : "";
        updateActiveFilters("amount", "custom", amountLabel);
      }
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
    } else if (type === 'date') {
      setStartDate(undefined);
      setEndDate(undefined);
      onDateRangeFilter?.(undefined, undefined);
    } else if (type === 'amount') {
      setMinAmount('');
      setMaxAmount('');
      onAmountRangeFilter?.(undefined, undefined);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
          />
        </div>
        
        <div className="flex flex-wrap gap-2 items-center">
          {showStatusFilter && (
            <Select value={selectedStatus} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-32 bg-gray-50 border-gray-200">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
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
              <SelectTrigger className="w-36 bg-gray-50 border-gray-200">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent className="bg-white border-gray-200">
                <SelectItem value="all">All Categories</SelectItem>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="bg-gray-50 border-gray-200 hover:bg-gray-100">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <DialogTitle className="text-lg font-semibold text-gray-900">Filters</DialogTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    Clear all
                  </Button>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {showStatusFilter && (
                  <div>
                    <h3 className="font-medium mb-3 text-gray-900">Status</h3>
                    <Select value={selectedStatus} onValueChange={handleStatusFilter}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">All Status</SelectItem>
                        {statusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {showAmountFilter && (
                  <div>
                    <h3 className="font-medium mb-3 text-gray-900">Order Amount</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-600 mb-1 block">Min</label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={minAmount}
                          onChange={(e) => setMinAmount(e.target.value)}
                          className="bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 mb-1 block">Max</label>
                        <Input
                          type="number"
                          placeholder="1000"
                          value={maxAmount}
                          onChange={(e) => setMaxAmount(e.target.value)}
                          className="bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {showDateFilter && (
                  <div>
                    <h3 className="font-medium mb-3 text-gray-900">Order Date</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-sm text-gray-600 mb-1 block">Min</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left bg-gray-50">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {startDate ? format(startDate, "MMM dd, yyyy") : "Start date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white" align="start">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600 mb-1 block">Max</label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left bg-gray-50">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              {endDate ? format(endDate, "MMM dd, yyyy") : "End date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-white" align="start">
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

                <div className="flex gap-3 pt-4">
                  <Button 
                    onClick={applyFilters} 
                    className="flex-1 bg-black text-white hover:bg-gray-800"
                  >
                    Apply Filters
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsFilterOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {(showExcelExport || showPDFExport) && (
            <div className="flex gap-1">
              {showExcelExport && (
                <Button onClick={onExportExcel} variant="outline" className="bg-purple-50 text-purple-600 border-purple-200 hover:bg-purple-100">
                  <Download className="w-4 h-4 mr-2" />
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
        <div className="flex flex-wrap gap-2 items-center px-4">
          <span className="text-sm text-gray-600">Active filters:</span>
          {activeFilters.map((filter) => (
            <Badge 
              key={filter} 
              variant="secondary" 
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
              onClick={() => removeFilter(filter)}
            >
              {filter.split(':')[1]}
              <X className="w-3 h-3 ml-1" />
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
