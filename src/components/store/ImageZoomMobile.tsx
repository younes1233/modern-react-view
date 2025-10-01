import {
  useState,
  useRef,
  useCallback,
  useEffect,
} from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Thumbs } from 'swiper/modules'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/thumbs'

interface ImageZoomMobileProps {
  images: Array<{ url: string; alt: string }>
  selectedIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageChange: (index: number) => void
}

export function ImageZoomMobile({
  images,
  selectedIndex,
  open,
  onOpenChange,
  onImageChange,
}: ImageZoomMobileProps) {
  const [zoom, setZoom] = useState(1)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [rotation, setRotation] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [touchStart, setTouchStart] = useState<{
    x: number
    y: number
    time: number
  } | null>(null)
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(null)
  const [lastTap, setLastTap] = useState<{
    time: number
    x: number
    y: number
  } | null>(null)
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null)
  const swiperRef = useRef<SwiperType | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 5))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.5, 0.5))
  }, [])

  const handleRotate = useCallback(() => {
    setRotation((prev) => prev + 90)
  }, [])

  const resetTransform = useCallback(() => {
    setZoom(1)
    setPosition({ x: 0, y: 0 })
    setRotation(0)
  }, [])

  const handleDoubleTapZoom = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current || !imageRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()

      if (zoom === 1) {
        const newZoom = 2
        const tapX = clientX - containerRect.left
        const tapY = clientY - containerRect.top
        const centerX = containerRect.width / 2
        const centerY = containerRect.height / 2
        const newX = (centerX - tapX) * (newZoom - 1)
        const newY = (centerY - tapY) * (newZoom - 1)

        setZoom(newZoom)
        setPosition({ x: newX, y: newY })
      } else {
        resetTransform()
      }
    },
    [zoom, resetTransform]
  )

  const getTouchDistance = useCallback((touches: TouchList) => {
    if (touches.length < 2) return 0
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touches = e.touches

      if (touches.length === 1) {
        const touch = touches[0]
        setTouchStart({
          x: touch.clientX,
          y: touch.clientY,
          time: Date.now(),
        })

        if (zoom > 1) {
          setIsDragging(true)
          setDragStart({
            x: touch.clientX - position.x,
            y: touch.clientY - position.y,
          })
        }
      } else if (touches.length === 2) {
        const distance = getTouchDistance(touches)
        setLastPinchDistance(distance)
        setTouchStart(null)
      }
    },
    [zoom, position, getTouchDistance]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault()
      const touches = e.touches

      if (touches.length === 1 && isDragging && zoom > 1) {
        const touch = touches[0]
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        })
      } else if (touches.length === 2 && lastPinchDistance) {
        const distance = getTouchDistance(touches)
        const scale = distance / lastPinchDistance
        setZoom((prev) => Math.max(0.5, Math.min(5, prev * scale)))
        setLastPinchDistance(distance)
      }
    },
    [isDragging, zoom, dragStart, lastPinchDistance, getTouchDistance]
  )

  const handlePrevious = useCallback(() => {
    resetTransform()
    swiperRef.current?.slidePrev()
  }, [resetTransform])

  const handleNext = useCallback(() => {
    resetTransform()
    swiperRef.current?.slideNext()
  }, [resetTransform])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const touches = e.changedTouches

      if (touches.length === 1 && touchStart) {
        const touch = touches[0]
        const deltaX = touch.clientX - touchStart.x
        const deltaY = touch.clientY - touchStart.y
        const deltaTime = Date.now() - touchStart.time
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const now = Date.now()

        // Check for double tap zoom
        if (deltaTime < 300 && distance < 10) {
          if (
            lastTap &&
            now - lastTap.time < 500 &&
            Math.abs(touch.clientX - lastTap.x) < 50 &&
            Math.abs(touch.clientY - lastTap.y) < 50
          ) {
            handleDoubleTapZoom(touch.clientX, touch.clientY)
            setLastTap(null)
            setIsDragging(false)
            setTouchStart(null)
            setLastPinchDistance(null)
            return
          } else {
            setLastTap({
              time: now,
              x: touch.clientX,
              y: touch.clientY,
            })
          }
        }
      }

      setIsDragging(false)
      setTouchStart(null)
      setLastPinchDistance(null)
    },
    [
      touchStart,
      lastTap,
      handleDoubleTapZoom,
    ]
  )

  useEffect(() => {
    if (open) {
      resetTransform()
      // Update swiper to correct slide when reopening
      if (swiperRef.current) {
        // Use setTimeout to ensure swiper is fully initialized
        setTimeout(() => {
          if (swiperRef.current && swiperRef.current.activeIndex !== selectedIndex) {
            swiperRef.current.slideTo(selectedIndex, 0)
          }
        }, 0)
      }
    }
  }, [open, resetTransform, selectedIndex])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none max-h-none w-screen h-screen p-0 bg-white border-0 overflow-hidden"
        aria-label="Image viewer"
        aria-describedby="image-viewer-description"
        role="dialog"
        aria-modal="true"
        style={{ height: '100vh' }}
      >
        <div id="image-viewer-description" className="sr-only">
          Image viewer with zoom and navigation controls
        </div>
        {/* Layer 1: White background container - always 100vh */}
        <div className="absolute inset-0 bg-white" />

        {/* Layer 2: Image centered in screen with Swiper */}
        <div className="absolute inset-0 z-10">
          <Swiper
            modules={[Navigation, Thumbs]}
            initialSlide={selectedIndex}
            onSwiper={(swiper) => {
              swiperRef.current = swiper
            }}
            thumbs={{ swiper: thumbsSwiper }}
            onSlideChange={(swiper) => {
              onImageChange(swiper.activeIndex)
            }}
            style={{ width: '100%', height: '100%' }}
            allowTouchMove={zoom === 1}
            spaceBetween={0}
            slidesPerView={1}
          >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div
                  ref={index === selectedIndex ? containerRef : null}
                  className="w-full h-full flex items-center justify-center"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    touchAction: zoom > 1 ? 'none' : 'auto',
                  }}
                >
                  <img
                    ref={index === selectedIndex ? imageRef : null}
                    src={image.url}
                    alt={image.alt || 'Image'}
                    style={{
                      transform: index === selectedIndex
                        ? `scale(${zoom}) translate(${
                            position.x / zoom
                          }px, ${position.y / zoom}px) rotate(${rotation}deg)`
                        : 'none',
                      width: zoom === 1 ? '100vw' : 'auto',
                      height: zoom === 1 ? 'auto' : '100vh',
                      maxHeight: '100vh',
                      maxWidth: '100vw',
                      objectFit: 'contain',
                    }}
                    draggable={false}
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Layer 3: UI controls with flex layout */}
        <div className="absolute inset-0 flex flex-col justify-evenly pointer-events-none z-20">
          {/* Header - Counter and Close (no background) */}
          <div className="flex items-center justify-between px-4 pointer-events-auto">
            <div className="bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-sm">
              <span className="text-gray-700 text-sm font-medium">
                {selectedIndex + 1} / {images.length}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200 h-10 w-10 p-0 rounded-full shadow-sm transition-all duration-200"
              aria-label="Close image viewer"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Empty spacer for flex positioning */}
          <div style={{ height: '50vh' }} />

          {/* Footer - Controls and Thumbnails */}
          <div className="flex flex-col items-center gap-3 pointer-events-auto">
            {/* Controls with Arrows */}
            <div className="flex items-center gap-1.5">
              {images.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 bg-white border border-gray-200 h-11 w-11 p-0 rounded-full shadow-sm transition-all duration-200"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}

              <div className="flex items-center space-x-1.5 bg-white rounded-full px-3 py-2 border border-gray-200 shadow-sm">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 disabled:text-gray-300 h-7 w-7 p-0 rounded-full"
                  aria-label="Zoom out"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-gray-700 text-sm font-medium min-w-[55px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 5}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 disabled:text-gray-300 h-7 w-7 p-0 rounded-full"
                  aria-label="Zoom in"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-5 bg-gray-200" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 h-7 w-7 p-0 rounded-full"
                  aria-label="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetTransform}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 h-7 px-2.5 rounded-full text-xs"
                  aria-label="Reset"
                >
                  Reset
                </Button>
              </div>

              {images.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 bg-white border border-gray-200 h-11 w-11 p-0 rounded-full shadow-sm transition-all duration-200"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              )}
            </div>

            {/* Thumbnails with Swiper */}
            {images.length > 1 && (
              <div className="bg-white rounded-2xl p-2.5 border border-gray-200 shadow-sm max-w-sm">
                <Swiper
                  modules={[Thumbs]}
                  onSwiper={setThumbsSwiper}
                  watchSlidesProgress
                  spaceBetween={8}
                  slidesPerView="auto"
                  slideToClickedSlide={true}
                  className="thumbnail-swiper"
                >
                  {images.map((image, index) => (
                    <SwiperSlide key={index} style={{ width: '40px' }}>
                      <button
                        onClick={() => {
                          resetTransform()
                          swiperRef.current?.slideToLoop(index)
                        }}
                        className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                          index === selectedIndex
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
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            )}
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