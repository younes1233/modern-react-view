import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Upload, Download, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface MassUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'products' | 'categories';
  onUploadComplete: (data: any[]) => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  data: any[];
}

export function MassUploadModal({ isOpen, onClose, type, onUploadComplete }: MassUploadModalProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();

  const requiredFieldsProducts = ['name', 'category', 'price', 'stock', 'sku'];
  const requiredFieldsCategories = ['name', 'description'];
  const requiredFields = type === 'products' ? requiredFieldsProducts : requiredFieldsCategories;

  const handleFileSelect = (files: File[]) => {
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setUploadedFile(file);
        validateFile(file);
      } else {
        toast({
          title: "Invalid File Type",
          description: "Please upload an Excel file (.xlsx or .xls)",
          variant: "destructive"
        });
      }
    }
  };

  const validateFile = async (file: File) => {
    setIsProcessing(true);
    setUploadProgress(20);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      setUploadProgress(50);

      const validation = validateData(jsonData);
      setValidationResult(validation);
      setUploadProgress(100);

      if (validation.isValid) {
        toast({
          title: "File Validated Successfully",
          description: `${validation.data.length} ${type} ready for upload`
        });
      }
    } catch (error) {
      toast({
        title: "File Processing Error",
        description: "Unable to process the Excel file. Please check the format.",
        variant: "destructive"
      });
      setValidationResult({
        isValid: false,
        errors: ["Failed to process Excel file"],
        warnings: [],
        data: []
      });
    }

    setIsProcessing(false);
  };

  const validateData = (data: any[]): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const validData: any[] = [];

    if (data.length === 0) {
      errors.push("File is empty or has no data rows");
      return { isValid: false, errors, warnings, data: validData };
    }

    // Check for required columns
    const firstRow = data[0];
    const missingFields = requiredFields.filter(field => 
      !Object.keys(firstRow).some(key => 
        key.toLowerCase().includes(field.toLowerCase())
      )
    );

    if (missingFields.length > 0) {
      errors.push(`Missing required columns: ${missingFields.join(', ')}`);
    }

    // Validate each row
    data.forEach((row, index) => {
      const rowNumber = index + 2; // Excel row number (header is row 1)
      const validatedRow: any = {};

      // Check required fields
      requiredFields.forEach(field => {
        const value = findValueByFieldName(row, field);
        if (!value || value.toString().trim() === '') {
          errors.push(`Row ${rowNumber}: Missing value for ${field}`);
          return;
        }
        validatedRow[field] = value.toString().trim();
      });

      // Type-specific validations
      if (type === 'products') {
        const price = parseFloat(validatedRow.price);
        const stock = parseInt(validatedRow.stock);

        if (isNaN(price) || price < 0) {
          errors.push(`Row ${rowNumber}: Invalid price value`);
        }
        if (isNaN(stock) || stock < 0) {
          errors.push(`Row ${rowNumber}: Invalid stock value`);
        }

        validatedRow.price = price;
        validatedRow.stock = stock;
        validatedRow.status = stock > 0 ? 'active' : 'out_of_stock';
        validatedRow.image = findValueByFieldName(row, 'image') || 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=300&fit=crop';
      }

      if (errors.length === 0 || !errors.some(e => e.includes(`Row ${rowNumber}`))) {
        validData.push(validatedRow);
      }
    });

    if (validData.length < data.length) {
      warnings.push(`${data.length - validData.length} rows will be skipped due to validation errors`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      data: validData
    };
  };

  const findValueByFieldName = (row: any, fieldName: string) => {
    const key = Object.keys(row).find(k => 
      k.toLowerCase().includes(fieldName.toLowerCase())
    );
    return key ? row[key] : null;
  };

  const handleUpload = () => {
    if (validationResult && validationResult.isValid) {
      onUploadComplete(validationResult.data);
      toast({
        title: "Upload Successful",
        description: `${validationResult.data.length} ${type} uploaded successfully`
      });
      onClose();
      resetState();
    }
  };

  const resetState = () => {
    setUploadedFile(null);
    setValidationResult(null);
    setIsProcessing(false);
    setUploadProgress(0);
  };

  const downloadTemplate = () => {
    const templateData = type === 'products' 
      ? [{ name: 'Sample Product', category: 'Electronics', price: 99.99, stock: 50, sku: 'SP001', image: 'https://example.com/image.jpg' }]
      : [{ name: 'Sample Category', description: 'Sample description for category' }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, `${type}_template.xlsx`);

    toast({
      title: "Template Downloaded",
      description: `${type} template has been downloaded`
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Mass Upload {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to add multiple {type} at once
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select an Excel file with your {type} data
              </p>
              <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
                <Download className="w-4 h-4" />
                Download Template
              </Button>
            </div>

            <FileUpload
              onFileSelect={handleFileSelect}
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              placeholder="Drop your Excel file here or click to upload"
              maxFiles={1}
            />

            {isProcessing && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            {validationResult && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {validationResult.isValid ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <span className="font-semibold">
                    Validation {validationResult.isValid ? 'Passed' : 'Failed'}
                  </span>
                  <Badge variant={validationResult.isValid ? "default" : "destructive"}>
                    {validationResult.data.length} valid rows
                  </Badge>
                </div>

                {validationResult.errors.length > 0 && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <strong>Errors found:</strong>
                        <ScrollArea className="h-24 mt-2">
                          <ul className="list-disc list-inside text-sm space-y-1 pr-4">
                            {validationResult.errors.map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </ScrollArea>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {validationResult.warnings.length > 0 && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <strong>Warnings:</strong>
                        <ul className="list-disc list-inside text-sm">
                          {validationResult.warnings.map((warning, index) => (
                            <li key={index}>{warning}</li>
                          ))}
                        </ul>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!validationResult?.isValid}
            className="gap-2"
          >
            <Upload className="w-4 h-4" />
            Upload {validationResult?.data.length || 0} {type}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
