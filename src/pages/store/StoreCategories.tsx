
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreLayout } from '@/components/store/StoreLayout';
import CategoryGrid from '@/components/store/CategoryGrid';
import { useStoreCategories } from '@/hooks/useStoreCategories';
import { Category } from '@/services/categoryService';

const StoreCategories = () => {
  const navigate = useNavigate();
  const { categories, loading, error } = useStoreCategories();

  const handleCategoryClick = (category: Category) => {
    // Navigate to products filtered by this category
    navigate(`/products?category=${category.slug}`);
  };

  if (error) {
    return (
      <StoreLayout>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="text-center py-12">
            <p className="text-destructive">Error loading categories: {error}</p>
          </div>
        </div>
      </StoreLayout>
    );
  }

  return (
    <StoreLayout>
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 tracking-tight">
            SHOP BY CATEGORY
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover our wide range of products organized by category
          </p>
        </div>

        {/* Categories Grid with store view (responsive images) */}
        <CategoryGrid 
          categories={categories}
          loading={loading}
          onCategoryClick={handleCategoryClick}
          isAdminView={false}
        />

        {/* Additional info */}
        {!loading && categories.length > 0 && (
          <div className="text-center mt-12">
            <p className="text-muted-foreground">
              Browse through {categories.length} categories to find exactly what you're looking for
            </p>
          </div>
        )}
      </div>
    </StoreLayout>
  );
};

export default StoreCategories;
