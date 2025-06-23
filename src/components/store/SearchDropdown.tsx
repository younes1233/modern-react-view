
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/contexts/SearchContext';
import * as Portal from '@radix-ui/react-portal';

interface SearchDropdownProps {
  isVisible: boolean;
  inputRef: HTMLInputElement | null;
  onProductClick: (productId: number) => void;
}

export function SearchDropdown({ isVisible, inputRef, onProductClick }: SearchDropdownProps) {
  const { searchQuery, searchResults } = useSearch();
  const navigate = useNavigate();

  const getSearchDropdownPosition = (inputRef: HTMLInputElement | null) => {
    if (!inputRef) return { top: 0, left: 0, width: 0 };
    
    const rect = inputRef.getBoundingClientRect();
    return {
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width
    };
  };

  if (!isVisible || searchQuery.length === 0 || !inputRef) {
    return null;
  }

  return (
    <Portal.Root>
      <div 
        className="fixed bg-white border border-gray-200 rounded-2xl shadow-2xl max-h-96 overflow-y-auto z-[9999]"
        style={{
          top: getSearchDropdownPosition(inputRef).top,
          left: getSearchDropdownPosition(inputRef).left,
          width: getSearchDropdownPosition(inputRef).width,
        }}
      >
        {searchResults.length > 0 ? (
          <div className="p-2">
            <div className="text-xs text-gray-500 px-4 py-3 border-b border-gray-100">
              {searchResults.length} results found
            </div>
            {searchResults.slice(0, 6).map((product) => (
              <button
                key={product.id}
                onClick={() => onProductClick(product.id)}
                className="w-full flex items-center space-x-4 p-4 hover:bg-blue-50 rounded-xl transition-all duration-300 text-left"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-12 h-12 object-cover rounded-xl shadow-md"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {product.name}
                  </h4>
                  <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                  <p className="text-sm font-semibold text-blue-600">
                    ${product.price.toFixed(2)}
                  </p>
                </div>
              </button>
            ))}
            {searchResults.length > 6 && (
              <button
                onClick={() => navigate('/store/categories')}
                className="w-full p-4 text-center text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-300 font-medium"
              >
                View all {searchResults.length} results
              </button>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-3 text-gray-300" />
            <p>No products found for "{searchQuery}"</p>
          </div>
        )}
      </div>
    </Portal.Root>
  );
}
