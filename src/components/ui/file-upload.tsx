import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (files: File[]) => void;
  maxFiles?: number;
  accept?: string;
  className?: string;
  placeholder?: string;
  maxFileSize?: number; // in MB
}

export function FileUpload({ 
  onFileSelect, 
  maxFiles = 1, 
  accept = "image/*",
  className,
  placeholder = "Drop images here or click to upload",
  maxFileSize = 5 // 5MB default
}: FileUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [error, setError] = useState<string>('');

  const compressImage = (file: File, maxSizeKB: number = 1024): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = document.createElement('img');
      
      img.onload = () => {
        // Calculate new dimensions (max 1920x1080 for stories)
        const maxWidth = 1080;
        const maxHeight = 1920;
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        }, file.type, 0.8); // 80% quality
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError('');
    
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors.some((error: any) => error.code === 'file-too-large')) {
        setError(`File size must be less than ${maxFileSize}MB`);
        return;
      }
    }
    
    try {
      const processedFiles = [];
      
      for (const file of acceptedFiles) {
        if (file.size > maxFileSize * 1024 * 1024) {
          console.log(`Compressing large file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
          const compressedFile = await compressImage(file, maxFileSize * 1024);
          console.log(`Compressed to: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
          processedFiles.push(compressedFile);
        } else {
          processedFiles.push(file);
        }
      }
      
      const newFiles = [...uploadedFiles, ...processedFiles].slice(0, maxFiles);
      setUploadedFiles(newFiles);
      onFileSelect(newFiles);
    } catch (error) {
      console.error('Error processing files:', error);
      setError('Error processing image. Please try again.');
    }
  }, [uploadedFiles, maxFiles, onFileSelect, maxFileSize]);

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onFileSelect(newFiles);
    setError('');
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { [accept]: [] },
    maxFiles,
    multiple: maxFiles > 1,
    maxSize: maxFileSize * 1024 * 1024, // Convert MB to bytes
  });

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
          error && "border-red-300 bg-red-50 dark:bg-red-950"
        )}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isDragActive ? "Drop the files here..." : placeholder}
        </p>
        <p className="text-xs text-gray-500 mt-2">
          {maxFiles > 1 ? `Upload up to ${maxFiles} images` : "Upload 1 image"} (Max {maxFileSize}MB each)
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {uploadedFiles.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {uploadedFiles.map((file, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg border bg-gray-50 dark:bg-gray-800 p-2">
                <Image className="w-full h-full text-gray-400" />
              </div>
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
              <p className="text-xs text-center mt-1 truncate">{file.name}</p>
              <p className="text-xs text-center text-gray-500">
                {(file.size / 1024 / 1024).toFixed(2)}MB
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
