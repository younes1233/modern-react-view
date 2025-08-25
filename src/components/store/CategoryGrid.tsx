
import { Category } from '@/services/categoryService';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useResponsiveImage } from '@/contexts/ResponsiveImageContext';

interface CategoryGridProps {
  categories: Category[];
  loading?: boolean;
  onCategoryClick?: (category: Category) => void;
  isAdminView?: boolean;
}

const CategoryGrid = ({ categories, loading, onCategoryClick, isAdminView = false }: CategoryGridProps) => {
  const { getImageUrl } = useResponsiveImage();

  const getCategoryImage = (category: Category): string => {
    // For admin view, always use original image
    if (isAdminView) {
      if (category.images?.urls?.original) {
        return category.images.urls.original;
      }
      return category.image || `https://picsum.photos/seed/${category.slug}/600/400`;
    }

    // For store view, use responsive image selection
    if (category.images?.urls?.category_image) {
      return getImageUrl(category.images.urls.category_image);
    }
    
    // Fallback to original or placeholder
    if (category.images?.urls?.original) {
      return category.images.urls.original;
    }
    
    return category.image || `https://picsum.photos/seed/${category.slug}/600/400`;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, index) => (
          <Card key={index} className="relative overflow-hidden aspect-[3/4] cursor-pointer group">
            <Skeleton className="w-full h-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No categories available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {categories.map((category) => (
        <Card 
          key={category.id} 
          className="relative overflow-hidden aspect-[3/4] cursor-pointer group hover:shadow-lg transition-shadow duration-300"
          onClick={() => onCategoryClick?.(category)}
        >
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${getCategoryImage(category)})`
            }}
          >
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-300" />
            
            {/* Category content */}
            <div className="absolute inset-0 flex flex-col justify-end p-4">
              <div className="text-white">
                <h3 className="font-semibold text-lg mb-1 drop-shadow-lg">
                  {category.name}
                </h3>
                {category.products && (
                  <p className="text-sm text-white/90 drop-shadow">
                    {category.products} items
                  </p>
                )}
              </div>
            </div>

            {/* Icon overlay */}
            {category.icon && (
              <div className="absolute bottom-4 right-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <img 
                    src={category.icon} 
                    alt={`${category.name} icon`}
                    className="w-6 h-6 object-contain"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CategoryGrid;
