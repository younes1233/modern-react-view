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
  // Custom zoom/pan state
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
  const [showUI, setShowUI] = useState(true)
  const [showGestureHints, setShowGestureHints] = useState(false)
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())
  const [preloadedImages, setPreloadedImages] = useState<Set<number>>(new Set())
  const [maxZoom, setMaxZoom] = useState(5)
  const [isAnimating, setIsAnimating] = useState(false)
  const [ariaAnnouncement, setAriaAnnouncement] = useState('')
  const swiperRef = useRef<SwiperType | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const uiTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isAtBoundaryRef = useRef(false)

  // Auto-hide UI after 3 seconds of inactivity
  const resetUITimeout = useCallback(() => {
    if (uiTimeoutRef.current) {
      clearTimeout(uiTimeoutRef.current)
    }
    setShowUI(true)
    uiTimeoutRef.current = setTimeout(() => {
      setShowUI(false)
    }, 3000)
  }, [])

  // Haptic feedback helper
  const triggerHaptic = useCallback((style: 'light' | 'medium' | 'heavy' = 'light') => {
    if ('vibrate' in navigator) {
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30,
      }
      navigator.vibrate(patterns[style])
    }
  }, [])

  // Toggle UI visibility on tap
  const toggleUI = useCallback(() => {
    setShowUI((prev) => !prev)
    if (!showUI) {
      resetUITimeout()
    }
  }, [showUI, resetUITimeout])

  // Reset zoom/pan to defaults
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
        const newZoom = 2 // Reduced zoom level for comfortable viewing
        const tapX = clientX - containerRect.left
        const tapY = clientY - containerRect.top
        const centerX = containerRect.width / 2
        const centerY = containerRect.height / 2
        const newX = (centerX - tapX) * (newZoom - 1)
        const newY = (centerY - tapY) * (newZoom - 1)

        setZoom(newZoom)
        setPosition({ x: newX, y: newY })
        setAriaAnnouncement(`Zoomed in to ${Math.round(newZoom * 100)}%`)
      } else {
        resetTransform()
        setAriaAnnouncement('Zoomed out to fit screen')
      }
    },
    [zoom, resetTransform]
  )

  const getTouchDistance = useCallback((touches: Touch[]) => {
    if (touches.length < 2) return 0
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }, [])

  const getTouchCenter = useCallback((touches: Touch[]) => {
    if (touches.length < 2) return { x: 0, y: 0 }
    const touch1 = touches[0]
    const touch2 = touches[1]
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }, [])

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
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
        const touchArray = Array.from(touches) as Touch[]
        const distance = getTouchDistance(touchArray)
        setLastPinchDistance(distance)
        setTouchStart(null)
      }
    },
    [zoom, position, getTouchDistance]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      const touches = e.touches

      if (touches.length === 1 && isDragging && zoom > 1 && containerRef.current && imageRef.current) {
        const touch = touches[0]
        const attemptedX = touch.clientX - dragStart.x
        const attemptedY = touch.clientY - dragStart.y

        // Constraint: Keep image edges within container bounds
        const container = containerRef.current.getBoundingClientRect()
        const image = imageRef.current

        // Get the rendered size of the image (after CSS max-width/max-height but before zoom)
        const imageRect = image.getBoundingClientRect()
        const baseWidth = imageRect.width
        const baseHeight = imageRect.height

        // After zoom, the visual size becomes:
        const zoomedWidth = baseWidth * zoom
        const zoomedHeight = baseHeight * zoom

        // Maximum pan offset to keep edges within bounds
        // This is the standard formula for image viewers
        const maxX = Math.max(0, (zoomedWidth - container.width) / 2)
        const maxY = Math.max(0, (zoomedHeight - container.height) / 2)

        // Apply strict constraints - no overflow allowed
        const newX = Math.max(-maxX, Math.min(maxX, attemptedX))
        const newY = Math.max(-maxY, Math.min(maxY, attemptedY))

        // Trigger haptic only once when first hitting boundary
        const isAtBoundary = attemptedX !== newX || attemptedY !== newY
        if (isAtBoundary && !isAtBoundaryRef.current) {
          triggerHaptic('light')
          isAtBoundaryRef.current = true
        } else if (!isAtBoundary) {
          isAtBoundaryRef.current = false
        }

        setPosition({ x: newX, y: newY })
      } else if (touches.length === 2 && lastPinchDistance && containerRef.current) {
        const touchArray = Array.from(touches) as Touch[]
        const distance = getTouchDistance(touchArray)
        const scale = distance / lastPinchDistance
        const newZoom = Math.max(0.5, Math.min(maxZoom, zoom * scale))

        // Haptic feedback when hitting zoom limits
        if ((zoom >= maxZoom && scale > 1) || (zoom <= 0.5 && scale < 1)) {
          triggerHaptic('light')
        }

        // Get pinch center point
        const pinchCenter = getTouchCenter(touchArray)
        const containerRect = containerRef.current.getBoundingClientRect()

        // Calculate focal point relative to container
        const focalX = pinchCenter.x - containerRect.left - containerRect.width / 2
        const focalY = pinchCenter.y - containerRect.top - containerRect.height / 2

        // Adjust position to zoom towards focal point
        const newX = position.x - focalX * (scale - 1)
        const newY = position.y - focalY * (scale - 1)

        setZoom(newZoom)
        setPosition({ x: newX, y: newY })
        setLastPinchDistance(distance)
      }
    },
    [isDragging, zoom, dragStart, lastPinchDistance, getTouchDistance, getTouchCenter, position]
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
            triggerHaptic('medium')
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
            // Single tap - toggle UI
            if (zoom === 1) {
              toggleUI()
            }
          }
        }

        // Snap back to boundaries when released beyond edges
        if (isDragging && zoom > 1 && containerRef.current && imageRef.current) {
          const container = containerRef.current.getBoundingClientRect()
          const image = imageRef.current.getBoundingClientRect()
          const scaledWidth = image.width * zoom
          const scaledHeight = image.height * zoom
          const maxX = Math.max(0, (scaledWidth - container.width) / 2)
          const maxY = Math.max(0, (scaledHeight - container.height) / 2)

          // Snap back with animation if beyond boundaries
          const constrainedX = Math.max(-maxX, Math.min(maxX, position.x))
          const constrainedY = Math.max(-maxY, Math.min(maxY, position.y))

          if (constrainedX !== position.x || constrainedY !== position.y) {
            // Animate back to boundary
            setPosition({ x: constrainedX, y: constrainedY })
            triggerHaptic('light')
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
      zoom,
      toggleUI,
      isDragging,
      position,
    ]
  )

  // Handle image loading - track each image individually and calculate max zoom
  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index))

    // Calculate smart zoom limit based on image resolution
    if (index === selectedIndex && imageRef.current && containerRef.current) {
      const img = imageRef.current
      const container = containerRef.current
      const containerRect = container.getBoundingClientRect()

      // Calculate how much the image is currently scaled down
      const scaleX = containerRect.width / img.naturalWidth
      const scaleY = containerRect.height / img.naturalHeight
      const currentScale = Math.min(scaleX, scaleY)

      // Allow zooming up to actual size (1:1 pixel ratio) but not beyond
      // Add a small buffer (1.2x) to allow slight over-zoom for comfort
      const calculatedMaxZoom = Math.max(2, Math.min(5, (1 / currentScale) * 1.2))
      setMaxZoom(calculatedMaxZoom)
    }
  }, [selectedIndex])

  const handleImageError = useCallback((index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index))
  }, [])

  // Preload adjacent images for instant switching
  const preloadImage = useCallback((index: number) => {
    if (index < 0 || index >= images.length || preloadedImages.has(index)) return

    const img = new Image()
    img.onload = () => {
      setPreloadedImages((prev) => new Set(prev).add(index))
    }
    img.src = images[index].url
  }, [images, preloadedImages])

  // Preload next and previous images
  useEffect(() => {
    if (!open) return

    // Preload adjacent images
    const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1
    const nextIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0

    // Delay preloading to prioritize current image
    const timer = setTimeout(() => {
      if (images.length > 1) {
        preloadImage(prevIndex)
        preloadImage(nextIndex)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [open, selectedIndex, images.length, preloadImage])

  useEffect(() => {
    if (open) {
      // Start with animation state
      setIsAnimating(true)

      // Trigger entrance animation on next frame
      requestAnimationFrame(() => {
        setIsAnimating(false)
      })

      resetTransform()
      setShowUI(true)
      resetUITimeout()

      // Show gesture hints on first open (can be stored in localStorage for production)
      const hasSeenHints = sessionStorage.getItem('hasSeenZoomHints')
      if (!hasSeenHints) {
        setShowGestureHints(true)
        sessionStorage.setItem('hasSeenZoomHints', 'true')
        setTimeout(() => setShowGestureHints(false), 4000)
      }

      // Update swiper to correct slide when reopening
      if (swiperRef.current) {
        setTimeout(() => {
          if (swiperRef.current && swiperRef.current.activeIndex !== selectedIndex) {
            swiperRef.current.slideTo(selectedIndex, 0)
          }
        }, 0)
      }
    }
    // Don't reset loaded images when closing - keep them cached for better UX

    return () => {
      if (uiTimeoutRef.current) {
        clearTimeout(uiTimeoutRef.current)
      }
    }
  }, [open, resetTransform, selectedIndex, resetUITimeout])

  // Sync thumbnail swiper when selectedIndex changes
  useEffect(() => {
    if (thumbsSwiper && open) {
      thumbsSwiper.slideTo(selectedIndex)
      setAriaAnnouncement(`Image ${selectedIndex + 1} of ${images.length}`)
    }
  }, [selectedIndex, thumbsSwiper, open, images.length])

  // Disable/enable swiper based on zoom level
  useEffect(() => {
    if (swiperRef.current) {
      if (zoom > 1) {
        swiperRef.current.disable()
      } else {
        swiperRef.current.enable()
      }
    }
  }, [zoom])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-w-none max-h-none w-screen h-screen p-0 bg-slate-900 border-0 overflow-hidden transition-transform duration-300 ${
          isAnimating ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        aria-describedby="image-viewer-description"
        style={{ height: '100vh' }}
      >
        <span id="image-viewer-description" className="sr-only">
          Image viewer with gesture controls: pinch to zoom, swipe to navigate, double-tap to zoom in/out, single tap to show/hide controls
        </span>
        {/* Screen reader announcements */}
        <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
          {ariaAnnouncement}
        </div>
        {/* Layer 1: Modern dark background with subtle cyan tint */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950" />

        {/* Layer 2: Image and thumbnails with dynamic positioning */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4" style={{ paddingBottom: images.length > 1 ? 'max(2rem, env(safe-area-inset-bottom))' : '0' }}>
          <div className="flex-shrink flex-grow-0" style={{ maxHeight: images.length > 1 ? 'calc(100vh - 200px)' : '100vh', display: 'flex', alignItems: 'center' }}>
            <Swiper
              modules={[Navigation, Thumbs]}
              initialSlide={selectedIndex}
              onSwiper={(swiper) => {
                swiperRef.current = swiper
              }}
              thumbs={{
                swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null
              }}
              onSlideChange={(swiper) => {
                onImageChange(swiper.activeIndex)
              }}
              style={{ width: '100vw', height: '100%' }}
              allowTouchMove={zoom === 1}
              spaceBetween={0}
              slidesPerView={1}
            >
            {images.map((image, index) => (
              <SwiperSlide key={index}>
                <div
                  ref={index === selectedIndex ? containerRef : null}
                  className="w-full h-full flex items-center justify-center relative"
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  style={{
                    touchAction: zoom > 1 ? 'none' : 'auto',
                  }}
                >
                  {/* Loading skeleton */}
                  {!loadedImages.has(index) && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 border-4 border-gray-700 border-t-white rounded-full animate-spin" />
                    </div>
                  )}

                  <img
                    ref={index === selectedIndex ? imageRef : null}
                    src={image.url}
                    alt={image.alt || 'Image'}
                    onLoad={() => handleImageLoad(index)}
                    onError={() => handleImageError(index)}
                    className={`transition-opacity duration-300 ${
                      !loadedImages.has(index) ? 'opacity-0' : 'opacity-100'
                    }`}
                    style={{
                      transform: index === selectedIndex
                        ? `scale(${zoom}) translate(${
                            position.x / zoom
                          }px, ${position.y / zoom}px) rotate(${rotation}deg)`
                        : 'none',
                      width: 'auto',
                      height: 'auto',
                      maxHeight: 'calc(100vh - 200px)',
                      maxWidth: 'calc(100vw - 16px)',
                      objectFit: 'contain',
                      transition: isDragging ? 'none' : 'transform 0.15s ease-out',
                      padding: '8px',
                    }}
                    draggable={false}
                  />
                </div>
              </SwiperSlide>
              ))}
            </Swiper>
          </div>

          {/* Thumbnails directly below image - dynamically positioned */}
          {images.length > 1 && (
            <div className="pointer-events-auto flex-shrink-0">
              <div className="bg-gray-800/60 backdrop-blur-md rounded-2xl px-3 py-2.5 border border-gray-700/50 shadow-lg">
                <div className="py-1.5 px-0.5">
                  <Swiper
                    onSwiper={setThumbsSwiper}
                    watchSlidesProgress
                    spaceBetween={6}
                    slidesPerView="auto"
                    slideToClickedSlide={true}
                    centeredSlides={true}
                    centeredSlidesBounds={true}
                    initialSlide={selectedIndex}
                    className="thumbnail-swiper"
                    style={{ maxWidth: 'calc(100vw - 32px)', overflow: 'visible' }}
                  >
                    {images.map((image, index) => (
                      <SwiperSlide key={index} style={{ width: '74px' }}>
                        <button
                          onClick={() => {
                            resetTransform()
                            swiperRef.current?.slideTo(index)
                            thumbsSwiper?.slideTo(index)
                            resetUITimeout()
                          }}
                          className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                            index === selectedIndex
                              ? 'border-cyan-500 ring-2 ring-cyan-500/50 scale-105'
                              : 'border-gray-600/50 hover:border-cyan-400/60 opacity-70 hover:opacity-100'
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
              </div>
            </div>
          )}
        </div>

        {/* Layer 3: Header UI controls - auto-hiding with safe area padding */}
        <div className={`absolute top-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none z-20 transition-opacity duration-300 ${
          showUI ? 'opacity-100' : 'opacity-0'
        }`} style={{ paddingTop: 'max(2.5rem, env(safe-area-inset-top))' }}>
          {/* Counter with glassmorphism */}
          <div className="bg-black/40 backdrop-blur-md rounded-full px-4 py-2 border border-white/10 shadow-lg pointer-events-auto mt-3">
            <span className="text-white text-sm font-medium">
              {selectedIndex + 1} / {images.length}
            </span>
          </div>

          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-white hover:text-white hover:bg-white/20 bg-black/40 backdrop-blur-md border border-white/10 h-10 w-10 p-0 rounded-full shadow-lg transition-all duration-200 pointer-events-auto mt-3"
            aria-label="Close image viewer"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Gesture Hints Overlay - Shows on first use */}
        {showGestureHints && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none animate-in fade-in duration-300">
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 max-w-sm mx-4 border border-white/20">
              <h3 className="text-white text-lg font-semibold mb-6 text-center">Gesture Controls</h3>
              <div className="space-y-4 text-white/90">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Pinch to Zoom</p>
                    <p className="text-sm text-white/70">Use two fingers</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Swipe to Navigate</p>
                    <p className="text-sm text-white/70">Left or right</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Double-tap to Zoom</p>
                    <p className="text-sm text-white/70">Tap twice quickly</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Tap to Show/Hide</p>
                    <p className="text-sm text-white/70">Single tap</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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