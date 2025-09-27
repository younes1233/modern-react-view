import React from 'react';

interface FormErrorDisplayProps {
  /**
   * Field name for debugging and data attributes
   */
  fieldName: string;

  /**
   * Array of error messages to display
   */
  errors?: string[];

  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * FormErrorDisplay component that replicates the exact error rendering
 * from AdminProductModal's renderFieldError function
 *
 * Features:
 * - Red text styling (text-red-600)
 * - Small text size (text-sm)
 * - Top margin (mt-1)
 * - Unique class for error scrolling (.validation-error)
 * - Data attribute for field identification
 */
export function FormErrorDisplay({ fieldName, errors, className = '' }: FormErrorDisplayProps) {
  // Return null if no errors (same as original logic)
  if (!errors || errors.length === 0) return null;

  return (
    <div
      className={`validation-error text-red-600 text-sm mt-1 ${className}`}
      data-field={fieldName}
    >
      {errors.map((error, index) => (
        <div key={index}>{error}</div>
      ))}
    </div>
  );
}

/**
 * Hook to easily get the error display component for a field
 * Usage: const renderError = useFieldError(validationErrors);
 *        return renderError('fieldName');
 */
export function useFieldError(validationErrors: Record<string, string[]>) {
  return (fieldName: string, className?: string) => {
    return (
      <FormErrorDisplay
        fieldName={fieldName}
        errors={validationErrors[fieldName]}
        className={className}
      />
    );
  };
}