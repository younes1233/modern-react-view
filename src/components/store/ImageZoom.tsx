
import { useState, useRef, useCallback, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCw, X, ChevronLeft, ChevronRight, Maximize } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface ImageZoomProps {
  images: Array<{ url: string; alt: string }>;
  selectedIndex: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageChange: (index: number) => void;
}

export function ImageZoom({ images, selectedIndex, open, onOpenChange, onImageChange }: ImageZoomProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.5, 0.5));
  }, []);

  const handleRotate = useCallback(() => {
    setRotation(prev => prev + 90);
  }, []);
  
  const resetTransform = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom(prev => Math.max(0.5, Math.min(5, prev + delta)));
  }, []);

  const handleImageChange = useCallback((newIndex: number) => {
    onImageChange(newIndex);
    resetTransform();
  }, [onImageChange, resetTransform]);

  const handlePrevious = useCallback(() => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1;
    handleImageChange(newIndex);
  }, [selectedIndex, images.length, handleImageChange]);

  const handleNext = useCallback(() => {
    const newIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0;
    handleImageChange(newIndex);
  }, [selectedIndex, images.length, handleImageChange]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return;
      
      switch (e.key) {
        case 'Escape':
          onOpenChange(false);
          break;
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
          handleZoomOut();
          break;
        case '0':
          resetTransform();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange, handlePrevious, handleNext, handleZoomIn, handleZoomOut, resetTransform]);

  // Reset when dialog opens/closes
  useEffect(() => {
    if (open) {
      resetTransform();
      setIsFullscreen(false);
    }
  }, [open, resetTransform]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`max-w-none max-h-none p-0 bg-black border-0 ${
          isFullscreen ? 'w-screen h-screen' : 'w-[95vw] h-[95vh]'
        }`}
      >
        <div className="relative w-full h-full flex flex-col overflow-hidden">
          {/* Header - Modern floating design */}
          <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between">
            <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-xl"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white text-sm font-medium min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoom >= 5}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-xl"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-white/20" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRotate}
                className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-xl"
              >
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={resetTransform}
                className="text-white hover:bg-white/20 h-8 px-3 rounded-xl text-xs"
              >
                Reset
              </Button>
              {!isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleFullscreen}
                  className="text-white hover:bg-white/20 h-8 w-8 p-0 rounded-xl"
                >
                  <Maximize className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-black/70 backdrop-blur-md rounded-2xl px-4 py-2 border border-white/10">
                <span className="text-white text-sm">
                  {selectedIndex + 1} / {images.length}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-white hover:bg-white/20 bg-black/70 backdrop-blur-md border border-white/10 h-10 w-10 p-0 rounded-2xl"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={handlePrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 bg-black/50 backdrop-blur-md border border-white/10 h-12 w-12 p-0 rounded-2xl"
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 text-white hover:bg-white/20 bg-black/50 backdrop-blur-md border border-white/10 h-12 w-12 p-0 rounded-2xl"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            </>
          )}

          {/* Main Image Container */}
          <div 
            ref={containerRef}
            className="flex-1 flex items-center justify-center overflow-hidden relative"
            onWheel={handleWheel}
          >
            <div
              className="relative select-none"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              style={{
                cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
              }}
            >
              <img
                ref={imageRef}
                src={images[selectedIndex]?.url}
                alt={images[selectedIndex]?.alt}
                className="max-w-none transition-transform duration-200 ease-out"
                style={{
                  transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px) rotate(${rotation}deg)`,
                  maxHeight: isMobile ? '70vh' : '80vh',
                  maxWidth: isMobile ? '90vw' : '80vw',
                }}
                draggable={false}
              />
            </div>
          </div>

          {/* Modern Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50">
              <div className="bg-black/70 backdrop-blur-md rounded-2xl p-3 border border-white/10">
                <div className="flex items-center space-x-2 max-w-sm overflow-x-auto scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        index === selectedIndex
                          ? 'border-white shadow-lg shadow-white/20'
                          : 'border-white/30 hover:border-white/60'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Help text for desktop */}
          {!isMobile && (
            <div className="absolute bottom-4 right-4 z-40">
              <div className="bg-black/70 backdrop-blur-md rounded-xl px-3 py-2 border border-white/10">
                <p className="text-white/70 text-xs">
                  Scroll to zoom • Arrow keys to navigate • ESC to close
                </p>
              </div>
            </div>
          )}
        </div>

        <style>{`
          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}
