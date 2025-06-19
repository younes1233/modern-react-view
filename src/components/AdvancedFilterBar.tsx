
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { ExportButton } from "@/components/ui/export-button";

interface AdvancedFilterBarProps {
  searchPlaceholder?: string;
  statusOptions?: Array<{ value: string; label: string }>;
  categoryOptions?: Array<{ value: string; label: string }>;
  onSearch?: (term: string) => void;
  onStatusFilter?: (status: string) => void;
  onCategoryFilter?: (category: string) => void;
  onDateRangeFilter?: (startDate: Date | undefined, endDate: Date | undefined) => void;
  onAmountRangeFilter?: (min: number | undefined, max: number | undefined) => void;
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  showStatusFilter?: boolean;
  showCategoryFilter?: boolean;
  showDateFilter?: boolean;
  showAmountFilter?: boolean;
  showExcelExport?: boolean;
  showPDFExport?: boolean;
  exportLabel?: string;
  exportButton?: React.ReactNode;
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
  onExportCSV,
  showStatusFilter = false,
  showCategoryFilter = false,
  showDateFilter = false,
  showAmountFilter = false,
  showExcelExport = false,
  showPDFExport = false,
  exportLabel = "Export",
  exportButton
}: AdvancedFilterBarProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setSearchTerm(term);
    onSearch?.(term);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    onStatusFilter?.(value);
  };

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value);
    onCategoryFilter?.(value);
  };

  return (
    <Card className="shadow-lg border-0">
      <CardContent className="p-4 lg:p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="search"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3 min-w-fit">
            {showStatusFilter && (
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {showCategoryFilter && (
              <Select value={categoryFilter} onValueChange={handleCategoryChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by Category" />
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

            {(showExcelExport || showPDFExport || exportButton) && (
              exportButton || (
                <ExportButton 
                  onExportExcel={onExportExcel}
                  onExportPDF={onExportPDF}
                  onExportCSV={onExportCSV}
                />
              )
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
