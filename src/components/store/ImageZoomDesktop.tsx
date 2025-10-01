import { useState, useCallback, useEffect } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import InnerImageZoom from 'react-inner-image-zoom'
import 'react-inner-image-zoom/lib/styles.min.css'

interface ImageZoomDesktopProps {
  images: Array<{ url: string; alt: string }>
  selectedIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageChange: (index: number) => void
}

export function ImageZoomDesktop({
  images,
  selectedIndex,
  open,
  onOpenChange,
  onImageChange,
}: ImageZoomDesktopProps) {
  const [currentIndex, setCurrentIndex] = useState(selectedIndex)

  const handlePrevious = useCallback(() => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1
    setCurrentIndex(newIndex)
    onImageChange(newIndex)
  }, [currentIndex, images.length, onImageChange])

  const handleNext = useCallback(() => {
    const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0
    setCurrentIndex(newIndex)
    onImageChange(newIndex)
  }, [currentIndex, images.length, onImageChange])

  const handleThumbnailClick = useCallback(
    (index: number) => {
      setCurrentIndex(index)
      onImageChange(index)
    },
    [onImageChange]
  )

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return

      switch (e.key) {
        case 'Escape':
          onOpenChange(false)
          break
        case 'ArrowLeft':
          handlePrevious()
          break
        case 'ArrowRight':
          handleNext()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onOpenChange, handlePrevious, handleNext])

  // Sync currentIndex with selectedIndex when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(selectedIndex)
    }
  }, [open, selectedIndex])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none max-h-none w-screen h-screen p-0 bg-white border-0"
        aria-label="Image viewer"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full h-full flex flex-col bg-white">
          {/* Header - Close Button */}
          <div className="flex items-center justify-end px-6 py-6 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200 h-10 w-10 p-0 rounded-full shadow-sm"
              aria-label="Close"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Main Image Container */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-white px-6">
            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="absolute left-6 z-10 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 bg-white border border-gray-200 h-12 w-12 p-0 rounded-full shadow-lg"
                  aria-label="Previous image"
                  title="Previous (Left arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="absolute right-6 z-10 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 bg-white border border-gray-200 h-12 w-12 p-0 rounded-full shadow-lg"
                  aria-label="Next image"
                  title="Next (Right arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Inner Image Zoom */}
            <div className="relative w-full h-full flex items-center justify-center">
              <InnerImageZoom
                src={images[currentIndex]?.url}
                zoomSrc={images[currentIndex]?.url}
                alt={images[currentIndex]?.alt || 'Image'}
                zoomType="hover"
                zoomScale={1.5}
                className="max-w-full max-h-[70vh]"
              />
            </div>
          </div>

          {/* Footer - Thumbnails and Help */}
          <div className="shrink-0 flex flex-col items-center gap-4 py-6 bg-white">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-sm">
                <div className="flex items-center space-x-2 max-w-2xl overflow-x-auto scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleThumbnailClick(index)}
                      className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        index === currentIndex
                          ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                          : 'border-gray-200 hover:border-cyan-400'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-sm">
              <p className="text-gray-500 text-xs">
                Hover to zoom • Arrow keys to navigate • ESC to close
              </p>
            </div>
          </div>
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
  )
}