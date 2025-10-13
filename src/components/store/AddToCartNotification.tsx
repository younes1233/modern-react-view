import { useEffect, useState, useRef, useMemo } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { getBestImageUrl } from '@/utils/imageUtils';

interface AddToCartNotificationProps {
  item: {
    name: string;
    image: string | { desktop?: string; tablet?: string; mobile?: string } | null;
    price: number;
    quantity: number;
    currency?: {
      symbol?: string;
      code?: string;
    };
  } | null;
  onClose: () => void;
}

export function AddToCartNotification({ item, onClose }: AddToCartNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (item) {
      // Reset states when new item arrives
      setDragOffset(0);
      setIsDragging(false);
      setIsVisible(false);

      // Trigger animation on next frame
      requestAnimationFrame(() => {
        setIsVisible(true);
      });

      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 75);
      }, 1500);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [item]); // Re-trigger when entire item object changes

  const handleTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsDragging(true);
    // Pause auto-dismiss timer while dragging
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX.current;
    // Only allow right swipe (positive diff)
    if (diff > 0) {
      setDragOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    // If swiped more than 100px, dismiss with swipe animation
    if (dragOffset > 100) {
      // Continue the swipe motion off-screen
      setDragOffset(400);
      setTimeout(() => {
        setIsDragging(false);
        onClose();
      }, 200);
    } else {
      // Reset position
      setIsDragging(false);
      setDragOffset(0);
      // Resume timer
      if (isVisible) {
        timerRef.current = setTimeout(() => {
          setIsVisible(false);
          setTimeout(onClose, 75);
        }, 1500);
      }
    }
  };

  // Get the best image URL with intelligent fallback
  // MUST be before early return to avoid "hooks order" error
  // NOTE: We DON'T add cache-busting timestamp because the image is already
  // loaded in the ProductCard, so we want to reuse that cached image for instant display
  const imageUrl = useMemo(() => {
    if (!item) return '';
    return getBestImageUrl(item.image);
  }, [item?.image]); // Re-compute when image changes

  if (!item) return null;

  const shouldDismissWithSwipe = dragOffset > 100;

  return (
    <div
      className={`fixed bottom-6 right-6 z-[100] ${
        isDragging ? 'transition-none' : 'transition-all'
      } ${
        isVisible && !shouldDismissWithSwipe
          ? 'duration-200'
          : !isVisible && !shouldDismissWithSwipe
          ? 'duration-75'
          : shouldDismissWithSwipe
          ? 'duration-200'
          : ''
      }`}
      style={{
        transform: shouldDismissWithSwipe
          ? `translateX(${dragOffset}px) scale(0.9)`
          : isDragging
          ? `translateX(${dragOffset}px)`
          : isVisible
          ? 'translateY(0) scale(1)'
          : 'translateX(100%) scale(0.95)',
        opacity: shouldDismissWithSwipe
          ? 0
          : isDragging
          ? Math.max(0, 1 - dragOffset / 200)
          : isVisible
          ? 1
          : 0,
        transitionTimingFunction: shouldDismissWithSwipe
          ? 'cubic-bezier(0.4, 0, 1, 1)'
          : isVisible
          ? 'cubic-bezier(0.16, 1, 0.3, 1)'
          : 'cubic-bezier(0.4, 0, 1, 1)'
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="bg-gradient-to-br from-white to-gray-50 backdrop-blur-xl rounded-xl md:rounded-2xl shadow-2xl border border-gray-200/50 p-2 md:p-3 w-[300px] md:w-[340px] max-w-[calc(100vw-2rem)] overflow-hidden relative">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-blue-500/5 animate-pulse" />

        <div className="relative">
          {/* Product info - compact single row */}
          <div className="flex gap-2 md:gap-3 items-center">
            <div className="relative flex-shrink-0">
              <img
                key={imageUrl} // Force re-render when URL changes
                src={imageUrl}
                alt={item.name}
                className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg border border-gray-200/50"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
              {item.quantity > 1 && (
                <div className="absolute -top-1 -right-1 bg-cyan-600 text-white text-[10px] font-bold rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center shadow-lg">
                  {item.quantity}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] md:text-xs font-medium text-gray-900 line-clamp-1">{item.name}</p>
                <p className="text-sm md:text-base font-bold text-cyan-600">
                  {item.currency?.symbol || ''}
                  {item.price.toFixed(2)}
                  {!item.currency?.symbol && item.currency?.code ? ` ${item.currency.code}` : ''}
                </p>
              </div>
              <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-cyan-600 flex-shrink-0" strokeWidth={2.5} />
              <button
                onClick={() => {
                  setIsVisible(false);
                  setTimeout(onClose, 300);
                }}
                className="rounded-full p-1 hover:bg-gray-100 transition-colors flex-shrink-0"
              >
                <X className="w-3 h-3 md:w-3.5 md:h-3.5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-blue-600 rounded-full"
              style={{
                animation: 'shrink 1.5s linear forwards',
                willChange: 'width'
              }}
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}