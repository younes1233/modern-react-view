import { useState, useEffect } from 'react';
import { useToast } from './use-toast';

export interface ValidationErrors {
  [fieldName: string]: string[];
}

export interface UseFormValidationOptions {
  /**
   * Enable smooth scrolling to first error when validation errors change
   * @default true
   */
  enableScrollToError?: boolean;

  /**
   * Delay before scrolling to error (in ms)
   * @default 200
   */
  scrollDelay?: number;
}

/**
 * Custom hook for form validation that maintains the exact functionality
 * of the AdminProductModal validation system:
 * - Red errors below fields
 * - Smooth scrolling to first error
 * - Real-time error clearing when user types
 * - Backend validation integration
 */
export function useFormValidation(options: UseFormValidationOptions = {}) {
  const { enableScrollToError = true, scrollDelay = 200 } = options;
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const { toast } = useToast();

  /**
   * Scroll to the first error field within modal or page
   * Uses the same logic as AdminProductModal
   */
  const scrollToFirstError = () => {
    console.log('Current validation errors:', validationErrors);
    const errorKeys = Object.keys(validationErrors);
    console.log('Error keys:', errorKeys);
    const firstErrorField = errorKeys[0];
    console.log('Scrolling to error field:', firstErrorField);

    if (firstErrorField) {
      setTimeout(() => {
        // Debug: Log all modal-related elements
        const dialog = document.querySelector('[role="dialog"]');
        const overflowContainer = document.querySelector('.overflow-y-auto');
        const maxHeightContainer = document.querySelector('.max-h-\\[80vh\\]');
        const errorElements = document.querySelectorAll('.text-red-600');

        console.log('Dialog:', dialog);
        console.log('Overflow container:', overflowContainer);
        console.log('Max height container:', maxHeightContainer);
        console.log('Error elements:', errorElements);

        // Find the first validation error element using our unique class
        const validationError = document.querySelector('.validation-error') as HTMLElement;
        if (validationError) {
          console.log('Found validation error element:', validationError);

          // Get the modal content container for scrolling
          const modalContent = document.querySelector('[role="dialog"]') as HTMLElement;

          if (modalContent) {
            console.log('Using scroll container:', modalContent);

            // Simply scroll the validation error into view within the modal
            validationError.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });

            console.log('Scrolled to validation error');
          }
        }
      }, scrollDelay);
    }
  };

  // Scroll to first error when validation errors change (same as AdminProductModal)
  useEffect(() => {
    if (enableScrollToError && Object.keys(validationErrors).length > 0) {
      scrollToFirstError();
    }
  }, [validationErrors, enableScrollToError]);

  /**
   * Set validation errors (typically from backend response)
   * @param errors - Validation errors object
   */
  const setErrors = (errors: ValidationErrors) => {
    setValidationErrors(errors);
  };

  /**
   * Clear all validation errors
   */
  const clearErrors = () => {
    setValidationErrors({});
  };

  /**
   * Clear validation error for a specific field
   * Used when user starts typing in a field
   * @param fieldName - Name of the field to clear error for
   */
  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  /**
   * Add validation error for a specific field
   * @param fieldName - Name of the field
   * @param errorMessages - Array of error messages
   */
  const addFieldError = (fieldName: string, errorMessages: string[]) => {
    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: errorMessages
    }));
  };

  /**
   * Check if form has any validation errors
   * @returns true if there are validation errors
   */
  const hasErrors = () => {
    return Object.keys(validationErrors).length > 0;
  };

  /**
   * Get validation errors for a specific field
   * @param fieldName - Name of the field
   * @returns Array of error messages or undefined
   */
  const getFieldErrors = (fieldName: string) => {
    return validationErrors[fieldName];
  };

  /**
   * Validate required fields
   * @param data - Form data object
   * @param requiredFields - Array of required field configurations
   * @returns Validation errors object
   */
  const validateRequiredFields = (
    data: Record<string, any>,
    requiredFields: Array<{ field: string; message?: string }>
  ): ValidationErrors => {
    const errors: ValidationErrors = {};

    requiredFields.forEach(({ field, message }) => {
      const value = data[field];
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        errors[field] = [message || `${field.charAt(0).toUpperCase() + field.slice(1)} is required`];
      }
    });

    return errors;
  };

  /**
   * Handle backend validation errors (Laravel format)
   * @param error - Error object from API response
   */
  const handleBackendErrors = (error: any) => {
    console.log('Error details:', error.details);
    console.log('Error response:', error.response);

    // Extract validation errors from the error response
    // Backend returns errors like: response.details.slug, response.details.name, etc.
    if (error.response && error.response.details) {
      console.log('Setting validation errors:', error.response.details);
      setValidationErrors(error.response.details);
    } else {
      console.log('No validation errors found, clearing state');
      // Clear validation errors if it's not a validation error
      setValidationErrors({});
    }
  };

  /**
   * Show toast error (for non-field specific errors)
   * @param title - Error title
   * @param description - Error description
   */
  const showToastError = (title: string, description: string) => {
    toast.error(description, { duration: 2500 });
  };

  return {
    // State
    validationErrors,

    // Actions
    setErrors,
    clearErrors,
    clearFieldError,
    addFieldError,

    // Utilities
    hasErrors,
    getFieldErrors,
    validateRequiredFields,
    handleBackendErrors,
    showToastError,
    scrollToFirstError
  };
}