
import { Button } from '@/components/ui/button';

interface ProductPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ProductPagination({
  currentPage,
  totalPages,
  onPageChange
}: ProductPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-6 sm:mt-8">
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
      >
        Previous
      </Button>
      
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          className={`text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 min-w-[32px] sm:min-w-[36px] ${
            page === currentPage ? "bg-cyan-500 hover:bg-cyan-600" : ""
          }`}
        >
          {page}
        </Button>
      ))}
      
      <Button
        variant="outline"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
      >
        Next
      </Button>
    </div>
  );
}
