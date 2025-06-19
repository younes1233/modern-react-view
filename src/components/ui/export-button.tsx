
import { Button } from "@/components/ui/button";
import { Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportButtonProps {
  onExportExcel?: () => void;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  className?: string;
}

export function ExportButton({ 
  onExportExcel, 
  onExportPDF, 
  onExportCSV,
  variant = "outline",
  size = "sm",
  className = ""
}: ExportButtonProps) {
  const hasMultipleOptions = [onExportExcel, onExportPDF, onExportCSV].filter(Boolean).length > 1;

  if (!hasMultipleOptions) {
    const singleAction = onExportExcel || onExportPDF || onExportCSV;
    const icon = onExportExcel ? FileSpreadsheet : onExportPDF ? FileText : Download;
    const Icon = icon;
    
    return (
      <Button
        variant={variant}
        size={size}
        onClick={singleAction}
        className={`gap-2 ${className}`}
      >
        <Icon className="h-4 w-4" />
        Export
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={`gap-2 ${className}`}>
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onExportExcel && (
          <DropdownMenuItem onClick={onExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export to Excel
          </DropdownMenuItem>
        )}
        {onExportPDF && (
          <DropdownMenuItem onClick={onExportPDF}>
            <FileText className="mr-2 h-4 w-4" />
            Export to PDF
          </DropdownMenuItem>
        )}
        {onExportCSV && (
          <DropdownMenuItem onClick={onExportCSV}>
            <Download className="mr-2 h-4 w-4" />
            Export to CSV
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
