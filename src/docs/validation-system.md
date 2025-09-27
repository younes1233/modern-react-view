# Centralized Validation System

This validation system maintains 100% of the AdminProductModal functionality while making it reusable across all forms in the app.

## Features

✅ **Red errors below fields** (same styling)
✅ **Smooth scroll to first error** (same behavior)
✅ **Real-time error clearing** when user types
✅ **Backend validation integration** (Laravel format)
✅ **Modal-specific scrolling** within dialog containers
✅ **Custom error positioning** and styling

## Core Components

### 1. `useFormValidation` Hook

```typescript
import { useFormValidation } from '@/hooks/useFormValidation';

const {
  validationErrors,        // Current validation errors state
  setErrors,              // Set errors (from backend)
  clearErrors,            // Clear all errors
  clearFieldError,        // Clear specific field error
  addFieldError,          // Add error to specific field
  hasErrors,              // Check if form has errors
  validateRequiredFields, // Validate required fields
  handleBackendErrors,    // Handle Laravel validation errors
  showToastError          // Show toast for non-field errors
} = useFormValidation({
  enableScrollToError: true,  // Enable auto-scroll to errors
  scrollDelay: 200           // Delay before scrolling
});
```

### 2. `FormErrorDisplay` Component

```tsx
import { FormErrorDisplay, useFieldError } from '@/components/ui/form-error-display';

// Method 1: Direct component usage
<FormErrorDisplay
  fieldName="email"
  errors={validationErrors.email}
/>

// Method 2: Hook usage (recommended)
const renderFieldError = useFieldError(validationErrors);

return (
  <div>
    <Input {...props} />
    {renderFieldError('email')} {/* Same as AdminProductModal */}
  </div>
);
```

### 3. Validation Utilities

```typescript
import {
  validateProductBasics,
  validateRequiredFields,
  createFieldUpdater
} from '@/utils/validation';

// Create field updater with automatic error clearing
const updateField = createFieldUpdater(setFormData, clearFieldError);

// Use in form
<Input
  value={formData.email}
  onChange={(e) => updateField('email', e.target.value)}
/>
```

## Usage Examples

### Basic Form

```tsx
import { useFormValidation } from '@/hooks/useFormValidation';
import { useFieldError } from '@/components/ui/form-error-display';
import { createFieldUpdater } from '@/utils/validation';

function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });

  const {
    validationErrors,
    clearErrors,
    clearFieldError,
    handleBackendErrors,
    validateRequiredFields
  } = useFormValidation();

  const renderFieldError = useFieldError(validationErrors);
  const updateField = createFieldUpdater(setFormData, clearFieldError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    // Basic validation
    const errors = validateRequiredFields(formData, [
      { field: 'name', message: 'Name is required' },
      { field: 'email', message: 'Email is required' }
    ]);

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      return;
    }

    try {
      await submitForm(formData);
    } catch (error) {
      handleBackendErrors(error); // Automatically handles Laravel errors
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Label>Name *</Label>
        <Input
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
        />
        {renderFieldError('name')}
      </div>

      <div>
        <Label>Email *</Label>
        <Input
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
        />
        {renderFieldError('email')}
      </div>

      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Complex Form (Like AdminProductModal)

```tsx
function ComplexForm() {
  const {
    validationErrors,
    setErrors,
    clearErrors,
    clearFieldError,
    handleBackendErrors,
    showToastError
  } = useFormValidation();

  const renderFieldError = useFieldError(validationErrors);
  const updateField = createFieldUpdater(setFormData, clearFieldError);

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();

    // 1. Basic field validation
    const basicErrors = validateRequiredFields(formData, [
      { field: 'name' },
      { field: 'price' }
    ]);

    if (Object.keys(basicErrors).length > 0) {
      setErrors(basicErrors);
      return; // Auto-scrolls to first error
    }

    // 2. Complex business logic validation
    if (someComplexCondition) {
      showToastError("Error", "Complex validation failed");
      return;
    }

    // 3. Submit and handle errors
    try {
      await submitForm(formData);
      clearErrors();
      onClose();
    } catch (error) {
      handleBackendErrors(error); // Auto-scrolls to first error
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { clearErrors(); onClose(); }}>
      {/* Form content with renderFieldError('fieldName') after each input */}
    </Dialog>
  );
}
```

### Custom Validation Functions

Create validation functions for your specific forms:

```typescript
// utils/userValidation.ts
export function validateUserForm(formData: UserFormData): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!formData.email) {
    errors.email = ["Email is required"];
  } else if (!isValidEmail(formData.email)) {
    errors.email = ["Please enter a valid email"];
  }

  if (!formData.password) {
    errors.password = ["Password is required"];
  } else if (formData.password.length < 8) {
    errors.password = ["Password must be at least 8 characters"];
  }

  return errors;
}

// Use in component
const userErrors = validateUserForm(formData);
if (Object.keys(userErrors).length > 0) {
  setErrors(userErrors);
  return;
}
```

## Migration Guide

### From AdminProductModal Pattern

**Before:**
```tsx
const [validationErrors, setValidationErrors] = useState({});

const renderFieldError = (fieldName: string) => {
  const errors = validationErrors[fieldName];
  if (!errors || errors.length === 0) return null;
  return (
    <div className="validation-error text-red-600 text-sm mt-1" data-field={fieldName}>
      {errors.map((error, index) => (
        <div key={index}>{error}</div>
      ))}
    </div>
  );
};

const updateField = (field, value) => {
  setFormData(prev => ({ ...prev, [field]: value }));
  if (validationErrors[field]) {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }
};
```

**After:**
```tsx
const { validationErrors, clearFieldError } = useFormValidation();
const renderFieldError = useFieldError(validationErrors);
const updateField = createFieldUpdater(setFormData, clearFieldError);
```

### Backend Error Handling

**Before:**
```tsx
catch (error) {
  if (error.response && error.response.details) {
    setValidationErrors(error.response.details);
  }
}
```

**After:**
```tsx
catch (error) {
  handleBackendErrors(error); // Automatically handles the same logic
}
```

## Best Practices

1. **Always clear errors on modal close:**
   ```tsx
   const handleClose = () => {
     clearErrors();
     onClose();
   };
   ```

2. **Use `updateField` for automatic error clearing:**
   ```tsx
   const updateField = createFieldUpdater(setFormData, clearFieldError);
   ```

3. **Combine basic and complex validation:**
   ```tsx
   // Basic validation with auto-scroll
   const errors = validateBasicFields(formData);
   if (Object.keys(errors).length > 0) {
     setErrors(errors);
     return;
   }

   // Complex validation with toast
   const complexValidation = validateComplexLogic(formData);
   if (!complexValidation.isValid) {
     showToastError("Error", complexValidation.message);
     return;
   }
   ```

4. **Create form-specific validation utilities:**
   ```typescript
   // utils/categoryValidation.ts
   export function validateCategoryForm(data) { /* ... */ }

   // utils/bannerValidation.ts
   export function validateBannerForm(data) { /* ... */ }
   ```

## TypeScript Support

All components and hooks are fully typed:

```typescript
interface MyFormData {
  name: string;
  email: string;
}

const updateField = createFieldUpdater<MyFormData>(setFormData, clearFieldError);
// TypeScript will ensure field names and types are correct
updateField('name', 'John'); // ✅ Valid
updateField('invalid', 'test'); // ❌ TypeScript error
```

This system maintains 100% compatibility with your existing AdminProductModal while making validation reusable across all forms!