# Toast Migration Testing Guide

## ✅ Fixed Issues
1. Removed old `Toaster` import from App.tsx
2. Removed duplicate `<Toaster />` component (keeping only Sonner)
3. All 66 files now use sonner consistently

## Testing Strategy

### 1. **Build Test** ✅
```bash
npm run build
```
**Expected**: Build completes without TypeScript errors
**Status**: Should pass now (old Toaster removed)

---

### 2. **Development Server Test**
```bash
npm run dev
```
**Expected**: App starts without console errors
**Check**: Open browser console for any `useToast is not defined` errors

---

### 3. **Manual Toast Testing Checklist**

Test each toast type across the app:

#### **A. Cart Operations** (CartContext & CartSidebar)
- [ ] Add product to cart → Success toast appears (2s duration)
- [ ] Add out-of-stock product → Error toast (2.5s duration)
- [ ] Exceed quantity limit (10 items) → Error toast with clear message
- [ ] Remove item from cart → Success toast
- [ ] Clear cart → Success toast
- [ ] Move to wishlist → Success toast
- [ ] Checkout with no country → Error toast
- [ ] Checkout success → Success toast

#### **B. Wishlist Operations** (WishlistContext)
- [ ] Add to wishlist → Success toast
- [ ] Remove from wishlist → Success toast
- [ ] Add while logged out → Error toast

#### **C. Authentication** (pages/Login.tsx, pages/RoleLogin.tsx)
- [ ] Login success → Success toast
- [ ] Login failure → Error toast
- [ ] Forgot password → Success/Error toast

#### **D. Admin Operations**
**Products Page:**
- [ ] Create product → Success toast
- [ ] Update product → Success toast
- [ ] Delete product → Success toast
- [ ] Validation errors → Error toasts

**Orders Page:**
- [ ] Update order status → Success toast
- [ ] Cancel order → Success toast

**Categories Page:**
- [ ] Create category → Success toast
- [ ] Update category → Success toast
- [ ] Delete category → Success toast

**Inventory Page:**
- [ ] Update stock → Success toast
- [ ] Bulk upload → Success/Error toast

#### **E. User-Facing Operations**
**Product Detail Page:**
- [ ] Add to cart → Custom AddToCartNotification (preserved, not standard toast)
- [ ] Share product → Success toast

**Checkout Page:**
- [ ] Invalid address → Error toast
- [ ] Payment failure → Error toast
- [ ] Order success → Success toast

**Address Management:**
- [ ] Add address → Success toast
- [ ] Update address → Success toast
- [ ] Delete address → Success toast

**Reviews:**
- [ ] Submit review → Success toast
- [ ] Edit review → Success toast
- [ ] Delete review → Success toast

---

### 4. **Visual Verification**

#### **Toast Appearance:**
- ✅ Clean, minimal design (sonner style)
- ✅ Appears from bottom-right corner
- ✅ Success toasts have checkmark icon
- ✅ Error toasts have X icon
- ✅ Toasts fade out smoothly

#### **Duration Check:**
- ✅ Success toasts: ~2 seconds
- ✅ Error toasts: ~2.5-3 seconds
- ✅ Toasts don't linger too long

---

### 5. **Browser Console Check**

Open Developer Tools → Console and check for:

❌ **Should NOT see:**
- `useToast is not defined`
- `Cannot read properties of undefined`
- Any toast-related errors

✅ **Should see:**
- Clean console (or only expected logs)
- No red errors related to toast

---

### 6. **Code Verification**

Run these commands to verify migration:

```bash
# No old toast imports should exist
cd src && grep -r "from '@/hooks/use-toast'" --include="*.tsx" --include="*.ts"
# Expected output: (nothing)

# Count sonner imports
cd src && grep -r "from '@/components/ui/sonner'" --include="*.tsx" --include="*.ts" | wc -l
# Expected: 66+

# Verify no useToast() calls remain
cd src && grep -r "const { toast } = useToast()" --include="*.tsx" --include="*.ts"
# Expected output: (nothing)
```

---

### 7. **Automated Testing** (Optional)

Create a simple test file to verify toast integration:

```typescript
// test/toast.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { toast } from '@/components/ui/sonner'

describe('Toast Migration', () => {
  it('toast.success should be defined', () => {
    expect(toast.success).toBeDefined()
  })

  it('toast.error should be defined', () => {
    expect(toast.error).toBeDefined()
  })

  it('toast should accept duration option', () => {
    expect(() => {
      toast.success('Test', { duration: 2000 })
    }).not.toThrow()
  })
})
```

---

## Quick Test Workflow

### **5-Minute Smoke Test:**
1. Start dev server: `npm run dev`
2. Open browser console
3. Navigate to product page
4. Add to cart (check for toast)
5. Go to cart, remove item (check for toast)
6. Try admin login (check for toast)
7. Check console for errors

### **15-Minute Full Test:**
Follow sections 3A, 3B, 3C, and 3E above

---

## Common Issues & Solutions

### Issue: "useToast is not defined"
**Solution**: Check if any file still imports from `@/hooks/use-toast`

### Issue: No toasts appearing
**Solution**: Verify `<Sonner />` is in App.tsx (line 258)

### Issue: Toasts appear twice
**Solution**: Ensure only ONE Toaster is rendered (removed old `<Toaster />`)

### Issue: Duration not working
**Solution**: Check toast calls include `{ duration: 2000 }` option

---

## Success Criteria

✅ App builds without errors
✅ No console errors on page load
✅ Toasts appear for all user actions
✅ Toast durations are 2-3 seconds
✅ No "useToast is not defined" errors
✅ All 66 files use sonner consistently

---

## Rollback Plan (if needed)

If issues are found:
1. Revert App.tsx changes
2. Re-enable old toaster import
3. Run: `git diff` to see all changes
4. Selectively revert problematic files

---

## Files Modified Summary

**Total Files Migrated**: 50+

**Key Files**:
- ✅ App.tsx - Removed old Toaster
- ✅ CartContext.tsx - All toasts use sonner
- ✅ CartSidebar.tsx - All toasts use sonner
- ✅ All hooks (useProducts, useBanners, etc.)
- ✅ All admin pages
- ✅ All store pages
- ✅ All auth pages

**Migration Date**: 2025-10-13
**Script Used**: migrate-to-sonner-v2.cjs + manual fixes
