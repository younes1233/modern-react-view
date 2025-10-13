
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/ui/file-upload";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, XCircle, Upload, Download, AlertTriangle } from "lucide-react";
import { toast } from '@/components/ui/sonner';
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
  // Removed useToast hook;

  const requiredFieldsProducts = ['name', 'sku', 'base_price', 'category_id'];
  const requiredFieldsCategories = ['name', 'description'];
  const requiredFields = type === 'products' ? requiredFieldsProducts : requiredFieldsCategories;

  const handleFileSelect = (files: File[]) => {
    console.log('Files selected:', files);
    if (files.length > 0) {
      const file = files[0];
      console.log('File type:', file.type, 'File name:', file.name);
      
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.type === 'application/vnd.ms-excel' ||
          file.name.endsWith('.xlsx') || 
          file.name.endsWith('.xls')) {
        setUploadedFile(file);
        validateFile(file);
      } else {
        toast.error("Please upload an Excel file (.xlsx or .xls)", { duration: 2500 });
      }
    }
  };

  const validateFile = async (file: File) => {
    console.log('Starting file validation for:', file.name);
    setIsProcessing(true);
    setUploadProgress(20);
    setValidationResult(null);

    try {
      const data = await file.arrayBuffer();
      setUploadProgress(40);
      
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Parsed data:', jsonData);
      setUploadProgress(70);

      const validation = validateData(jsonData);
      console.log('Validation result:', validation);
      setValidationResult(validation);
      setUploadProgress(100);

      if (validation.isValid) {
        toast.success(`${validation.data.length} ${type} ready for upload`, { duration: 2000 });
      } else {
        toast.error(`Found ${validation.errors.length} errors that need to be fixed`, { duration: 2500 });
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast.error("Unable to process the Excel file. Please check the format.", { duration: 2500 });
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
        const basePrice = parseFloat(validatedRow.base_price);
        const categoryId = parseInt(validatedRow.category_id);

        if (isNaN(basePrice) || basePrice < 0) {
          errors.push(`Row ${rowNumber}: Invalid base price value`);
        }
        if (isNaN(categoryId) || categoryId <= 0) {
          errors.push(`Row ${rowNumber}: Invalid category ID`);
        }

        validatedRow.base_price = basePrice;
        validatedRow.category_id = categoryId;
        validatedRow.slug = findValueByFieldName(row, 'slug') || validatedRow.name.toLowerCase().replace(/\s+/g, '-');
        validatedRow.status = findValueByFieldName(row, 'status') || 'draft';
        validatedRow.short_description = findValueByFieldName(row, 'short_description') || '';
        validatedRow.long_description = findValueByFieldName(row, 'long_description') || '';
        validatedRow.store_id = findValueByFieldName(row, 'store_id') || '';
        validatedRow.has_variants = findValueByFieldName(row, 'has_variants') || 'false';
        validatedRow.is_featured = findValueByFieldName(row, 'is_featured') || 'false';
        validatedRow.is_on_sale = findValueByFieldName(row, 'is_on_sale') || 'false';
        validatedRow.is_new_arrival = findValueByFieldName(row, 'is_new_arrival') || 'false';
        validatedRow.is_seller_product = findValueByFieldName(row, 'is_seller_product') || 'false';
        validatedRow.cover_image = findValueByFieldName(row, 'cover_image') || '';
        validatedRow.available_countries = findValueByFieldName(row, 'available_countries') || '1';
        validatedRow.cost = findValueByFieldName(row, 'cost') || '';
        validatedRow.vat_percentage = findValueByFieldName(row, 'vat_percentage') || '20';
        validatedRow.specifications = findValueByFieldName(row, 'specifications') || '';
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
    console.log('Starting upload process');
    if (validationResult && validationResult.isValid) {
      console.log('Uploading data:', validationResult.data);
      onUploadComplete(validationResult.data);
      toast.success(`${validationResult.data.length} ${type} uploaded successfully`, { duration: 2000 });
      onClose();
      resetState();
    } else {
      toast.error("Please fix validation errors before uploading", { duration: 2500 });
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
      ? [
          { 
            name: 'Sample Product 1', 
            sku: 'PROD001', 
            slug: 'sample-product-1',
            base_price: 29.99,
            category_id: 1,
            store_id: '',
            status: 'active',
            short_description: 'Brief product description',
            long_description: 'Detailed product description',
            has_variants: 'false',
            is_featured: 'false',
            is_on_sale: 'false',
            is_new_arrival: 'true',
            is_seller_product: 'false',
            cover_image: 'https://example.com/image1.jpg',
            available_countries: '1,2,3',
            cost: 20.99,
            vat_percentage: 20,
            specifications: 'Color:Red;Size:Large;Material:Cotton'
          },
          { 
            name: 'Sample Product 2', 
            sku: 'PROD002', 
            slug: 'sample-product-2',
            base_price: 49.99,
            category_id: 2,
            store_id: '',
            status: 'draft',
            short_description: 'Another brief description',
            long_description: 'Another detailed description',
            has_variants: 'true',
            is_featured: 'true',
            is_on_sale: 'true',
            is_new_arrival: 'false',
            is_seller_product: 'false',
            cover_image: 'https://example.com/image2.jpg',
            available_countries: '1',
            cost: 34.99,
            vat_percentage: 15,
            specifications: 'Color:Blue;Weight:2kg'
          }
        ]
      : [{ name: 'Sample Category', description: 'Sample description for category' }];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, type);
    XLSX.writeFile(wb, `${type}_template.xlsx`);

    toast.success(`${type} template has been downloaded`, { duration: 2000 });
  };

  // Reset state when modal closes
  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Mass Upload {type.charAt(0).toUpperCase() + type.slice(1)}
          </DialogTitle>
          <DialogDescription>
            Upload an Excel file to add multiple {type} at once
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-6">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
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

          {uploadedFile && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{uploadedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          )}

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
            <div className="space-y-4 flex-1 overflow-hidden">
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
                    <div className="space-y-2">
                      <strong>Errors found:</strong>
                      <ScrollArea className="h-32 w-full rounded border p-2">
                        <div className="space-y-1 text-sm pr-4">
                          {validationResult.errors.map((error, index) => (
                            <div key={index} className="py-1 border-b border-border/20 last:border-b-0">
                              • {error}
                            </div>
                          ))}
                        </div>
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

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpload} 
            disabled={!validationResult?.isValid || isProcessing}
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
