import React, { Component, ErrorInfo, ReactNode, useState, useRef, useCallback, useEffect } from 'react'
import { useIsMobile } from '@/hooks/use-mobile'
import { ImageZoomMobile } from './ImageZoomMobile'
import { ImageZoomDesktop } from './ImageZoomDesktop'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCw, X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

class ImageZoomErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ImageZoom Error Boundary caught an error:', error, errorInfo)
    this.props.onError?.(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent className="max-w-md bg-white border border-gray-200">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">❌</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Something went wrong
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                The image viewer encountered an unexpected error. Please try
                refreshing the page.
              </p>
              <Button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Refresh Page
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )
    }

    return this.props.children
  }
}

interface ImageZoomProps {
  images: Array<{ url: string; alt: string }>
  selectedIndex: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onImageChange: (index: number) => void
}

function ImageZoomComponent({
  images,
  selectedIndex,
  open,
  onOpenChange,
  onImageChange,
}: ImageZoomProps) {
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
  const [lastPinchDistance, setLastPinchDistance] = useState<number | null>(
    null
  )
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)
  const [lastTap, setLastTap] = useState<{
    time: number
    x: number
    y: number
  } | null>(null)
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set())
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(
    null
  )
  const [isSliding, setIsSliding] = useState(false)
  const [nextImageIndex, setNextImageIndex] = useState<number | null>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

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
      const imageRect = imageRef.current.getBoundingClientRect()

      if (zoom === 1) {
        // Zoom in to 2x, centered on tap point
        const newZoom = 2

        // Calculate position to center the tap point
        const tapX = clientX - containerRect.left
        const tapY = clientY - containerRect.top

        // Calculate the center of the container
        const centerX = containerRect.width / 2
        const centerY = containerRect.height / 2

        // Calculate new position to center the tap point
        const newX = (centerX - tapX) * (newZoom - 1)
        const newY = (centerY - tapY) * (newZoom - 1)

        setZoom(newZoom)
        setPosition({ x: newX, y: newY })
      } else {
        // Zoom out to 1x
        resetTransform()
      }
    },
    [zoom, resetTransform]
  )

  // Touch gesture utilities
  const getTouchDistance = useCallback((touches: Touch[]) => {
    if (touches.length < 2) return 0
    const touch1 = touches[0]
    const touch2 = touches[1]
    return Math.sqrt(
      Math.pow(touch2.clientX - touch1.clientX, 2) +
        Math.pow(touch2.clientY - touch1.clientY, 2)
    )
  }, [])

  const getTouchCenter = useCallback((touches: TouchList) => {
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY }
    }
    const touch1 = touches[0]
    const touch2 = touches[1]
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
    }
  }, [])

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (zoom > 1) {
        setIsDragging(true)
        setDragStart({
          x: e.clientX - position.x,
          y: e.clientY - position.y,
        })
      }
    },
    [zoom, position]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging && zoom > 1) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        })
      }
    },
    [isDragging, zoom, dragStart]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isMobile) return // Only handle on desktop
      handleDoubleTapZoom(e.clientX, e.clientY)
    },
    [isMobile, handleDoubleTapZoom]
  )

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.2 : 0.2
    setZoom((prev) => Math.max(0.5, Math.min(5, prev + delta)))
  }, [])

  // Touch handlers for mobile gestures
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return // Only handle touch on mobile
      e.preventDefault()
      const touches = e.touches

      if (touches.length === 1) {
        // Single touch - start potential swipe or drag
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
        // Two finger touch - start pinch zoom
        const distance = getTouchDistance(Array.from(touches) as Touch[])
        setLastPinchDistance(distance)
        setTouchStart(null)
      }
    },
    [zoom, position, getTouchDistance, isMobile]
  )

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return // Only handle touch on mobile
      e.preventDefault()
      const touches = Array.from(e.touches)

      if (touches.length === 1 && isDragging && zoom > 1) {
        // Single finger drag when zoomed
        const touch = touches[0]
        setPosition({
          x: touch.clientX - dragStart.x,
          y: touch.clientY - dragStart.y,
        })
      } else if (touches.length === 2 && lastPinchDistance) {
        // Two finger pinch zoom
        const distance = getTouchDistance(Array.from(touches) as Touch[])
        const scale = distance / lastPinchDistance
        setZoom((prev) => Math.max(0.5, Math.min(5, prev * scale)))
        setLastPinchDistance(distance)
      }
    },
    [isDragging, zoom, dragStart, lastPinchDistance, getTouchDistance, isMobile]
  )

  const handleImageChange = useCallback(
    (newIndex: number, direction?: 'left' | 'right') => {
      if (isSliding || newIndex === selectedIndex) return // Prevent multiple animations

      // Reset transform for clean animation
      resetTransform()

      // Set up for slide animation
      setNextImageIndex(newIndex)
      setSlideDirection(direction || null)
      setIsSliding(true)

      // Complete the slide after animation
      setTimeout(() => {
        onImageChange(newIndex)
        setIsSliding(false)
        setSlideDirection(null)
        setNextImageIndex(null)

        // Handle loading state for the new image
        const newImageUrl = images[newIndex]?.url
        if (!preloadedImages.has(newImageUrl)) {
          setImageLoading(true)
        }
        setImageError(false)
      }, 300)
    },
    [
      onImageChange,
      resetTransform,
      images,
      preloadedImages,
      isSliding,
      selectedIndex,
    ]
  )

  const handlePrevious = useCallback(() => {
    const newIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1
    handleImageChange(newIndex, 'right')
  }, [selectedIndex, images.length, handleImageChange])

  const handleNext = useCallback(() => {
    const newIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0
    handleImageChange(newIndex, 'left')
  }, [selectedIndex, images.length, handleImageChange])

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isMobile) return // Only handle touch on mobile

      const touches = e.changedTouches

      if (touches.length === 1 && touchStart) {
        const touch = touches[0]
        const deltaX = touch.clientX - touchStart.x
        const deltaY = touch.clientY - touchStart.y
        const deltaTime = Date.now() - touchStart.time
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const now = Date.now()

        // Check for double tap
        if (deltaTime < 300 && distance < 10) {
          if (
            lastTap &&
            now - lastTap.time < 500 &&
            Math.abs(touch.clientX - lastTap.x) < 50 &&
            Math.abs(touch.clientY - lastTap.y) < 50
          ) {
            // Double tap detected
            handleDoubleTapZoom(touch.clientX, touch.clientY)
            setLastTap(null) // Reset to prevent triple tap
            setIsDragging(false)
            setTouchStart(null)
            setLastPinchDistance(null)
            return
          } else {
            // Single tap - store for potential double tap
            setLastTap({
              time: now,
              x: touch.clientX,
              y: touch.clientY,
            })
            // Removed auto-close on single tap to prevent accidental exits
          }
        }

        // Only allow swipe navigation if image is not zoomed and we're not dragging
        if (deltaTime < 300 && distance > 50 && zoom === 1) {
          if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal swipe
            if (deltaX > 0 && images.length > 1) {
              handlePrevious() // Swipe right = previous
            } else if (deltaX < 0 && images.length > 1) {
              handleNext() // Swipe left = next
            }
          }
        }
      }

      setIsDragging(false)
      setTouchStart(null)
      setLastPinchDistance(null)
    },
    [
      touchStart,
      images.length,
      zoom,
      handlePrevious,
      handleNext,
      onOpenChange,
      isMobile,
      lastTap,
      handleDoubleTapZoom,
    ]
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
        case '+':
        case '=':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case '0':
          resetTransform()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    open,
    onOpenChange,
    handlePrevious,
    handleNext,
    handleZoomIn,
    handleZoomOut,
    resetTransform,
  ])

  // Handle image loading
  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageLoading(false)
    setImageError(true)
  }, [])

  // Preload adjacent images
  const preloadImage = useCallback(
    (url: string) => {
      if (preloadedImages.has(url)) return

      const img = new Image()
      img.onload = () => {
        setPreloadedImages((prev) => new Set(prev).add(url))
      }
      img.onerror = () => {
        console.warn(`Failed to preload image: ${url}`)
      }
      img.src = url
    },
    [preloadedImages]
  )

  const preloadAdjacentImages = useCallback(() => {
    if (images.length <= 1) return

    // Preload previous image
    const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : images.length - 1
    const prevImage = images[prevIndex]
    if (prevImage && !preloadedImages.has(prevImage.url)) {
      preloadImage(prevImage.url)
    }

    // Preload next image
    const nextIndex = selectedIndex < images.length - 1 ? selectedIndex + 1 : 0
    const nextImage = images[nextIndex]
    if (nextImage && !preloadedImages.has(nextImage.url)) {
      preloadImage(nextImage.url)
    }
  }, [images, selectedIndex, preloadedImages, preloadImage])

  // Preload adjacent images when selected image changes
  useEffect(() => {
    if (open) {
      // Small delay to prioritize current image loading
      const timer = setTimeout(preloadAdjacentImages, 100)
      return () => clearTimeout(timer)
    }
  }, [open, selectedIndex, preloadAdjacentImages])

  // Reset when dialog opens/closes
  useEffect(() => {
    if (open) {
      resetTransform()
      setImageLoading(true)
      setImageError(false)
    } else {
      // Clear preloaded images when dialog closes to free memory
      setPreloadedImages(new Set())
    }
  }, [open, resetTransform])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-none max-h-none w-screen h-screen p-0 bg-gray-50 border-0 overflow-hidden"
        aria-label="Image viewer"
        role="dialog"
        aria-modal="true"
      >
        <div className="w-full h-full flex flex-col bg-white overflow-hidden">
          {/* Header - Top controls */}
          <div className="flex items-center justify-between px-4 py-5 md:px-6 md:py-6 shrink-0">
            {/* Counter (left on mobile, hidden on desktop) */}
            {isMobile && (
              <div className="bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-lg">
                <span className="text-gray-700 text-sm font-medium">
                  {selectedIndex + 1} / {images.length}
                </span>
              </div>
            )}

            {/* Desktop zoom controls (top-left) */}
            {!isMobile && images.length > 1 && (
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 disabled:text-gray-300 disabled:hover:bg-transparent h-8 w-8 p-0 rounded-full transition-all duration-200"
                  aria-label="Zoom out"
                  title="Zoom out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-gray-700 text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 5}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 disabled:text-gray-300 disabled:hover:bg-transparent h-8 w-8 p-0 rounded-full transition-all duration-200"
                  aria-label="Zoom in"
                  title="Zoom in (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-200" aria-hidden="true" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 h-8 w-8 p-0 rounded-full transition-all duration-200"
                  aria-label="Rotate image"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetTransform}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 h-8 px-3 rounded-full text-xs transition-all duration-200"
                  aria-label="Reset zoom and rotation"
                  title="Reset (0)"
                >
                  Reset
                </Button>
              </div>
            )}

            {!isMobile && images.length === 1 && (
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 border border-gray-200 shadow-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 disabled:text-gray-300 disabled:hover:bg-transparent h-8 w-8 p-0 rounded-full transition-all duration-200"
                  aria-label="Zoom out"
                  title="Zoom out (-)"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <span className="text-gray-700 text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  disabled={zoom >= 5}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 disabled:text-gray-300 disabled:hover:bg-transparent h-8 w-8 p-0 rounded-full transition-all duration-200"
                  aria-label="Zoom in"
                  title="Zoom in (+)"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <div className="w-px h-6 bg-gray-200" aria-hidden="true" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 h-8 w-8 p-0 rounded-full transition-all duration-200"
                  aria-label="Rotate image"
                  title="Rotate 90°"
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetTransform}
                  className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 h-8 px-3 rounded-full text-xs transition-all duration-200"
                  aria-label="Reset zoom and rotation"
                  title="Reset (0)"
                >
                  Reset
                </Button>
              </div>
            )}

            {/* Spacer for mobile when no left content */}
            {isMobile && <div />}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white border border-gray-200 h-10 w-10 p-0 rounded-full shadow-sm transition-all duration-200"
              aria-label="Close image viewer"
              title="Close (Esc)"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Main Image Container - Centered vertically with flex */}
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-white">
            {/* Desktop Navigation Arrows */}
            {!isMobile && images.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="absolute left-6 z-10 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 bg-white border border-gray-200 h-12 w-12 p-0 rounded-full shadow-lg transition-all duration-200"
                  aria-label="Previous image"
                  title="Previous image (Left arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="absolute right-6 z-10 text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 bg-white border border-gray-200 h-12 w-12 p-0 rounded-full shadow-lg transition-all duration-200"
                  aria-label="Next image"
                  title="Next image (Right arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </Button>
              </>
            )}

            {/* Image Container with gestures */}
            <div
              ref={containerRef}
              className="relative select-none w-full h-full overflow-hidden"
              onWheel={handleWheel}
              role="img"
              aria-label={`Image ${selectedIndex + 1} of ${images.length}: ${
                images[selectedIndex]?.alt || 'Image'
              }`}
              style={{
                cursor:
                  zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
                touchAction: isMobile ? 'none' : 'auto',
              }}
            >
              {/* Sliding container */}
              <div
                className="flex h-full items-center transition-transform duration-300 ease-out"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onDoubleClick={handleDoubleClick}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                style={{
                  transform:
                    isSliding && slideDirection
                      ? `translateX(${
                          slideDirection === 'left' ? '-100%' : '100%'
                        })`
                      : 'translateX(0%)',
                  width: '200%',
                }}
              >
                {/* Current Image */}
                <div className="w-1/2 flex items-center justify-center relative">
                  {/* Loading Skeleton */}
                  {!isSliding &&
                    imageLoading &&
                    !preloadedImages.has(images[selectedIndex]?.url) && (
                      <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
                        <div className="text-gray-400 text-center">
                          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-2"></div>
                          <span className="text-sm">Loading image...</span>
                        </div>
                      </div>
                    )}

                  {/* Error State */}
                  {!isSliding && imageError && (
                    <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <div className="text-gray-500 text-center">
                        <div className="text-4xl mb-2">⚠️</div>
                        <span className="text-sm">Failed to load image</span>
                        <button
                          onClick={() => {
                            setImageLoading(true)
                            setImageError(false)
                          }}
                          className="block mt-2 text-xs text-cyan-600 hover:text-cyan-800 underline"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Current Image */}
                  <img
                    ref={imageRef}
                    src={images[selectedIndex]?.url}
                    alt={`${images[selectedIndex]?.alt || 'Image'} - Image ${
                      selectedIndex + 1
                    } of ${images.length}. Current zoom: ${Math.round(
                      zoom * 100
                    )}%. Double-click to zoom.`}
                    className={`max-w-none transition-opacity duration-200 ${
                      imageError && !isSliding ? 'hidden' : 'block'
                    }`}
                    style={{
                      transform: `scale(${zoom}) translate(${
                        position.x / zoom
                      }px, ${position.y / zoom}px) rotate(${rotation}deg)`,
                      maxHeight: '80vh',
                      maxWidth: '90vw',
                      opacity: !isSliding && imageLoading ? 0.3 : 1,
                    }}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                    draggable={false}
                    role="img"
                    tabIndex={0}
                  />
                </div>

                {/* Next Image (during slide animation) */}
                {isSliding && nextImageIndex !== null && (
                  <div className="w-1/2 flex items-center justify-center">
                    <img
                      src={images[nextImageIndex]?.url}
                      alt={`${images[nextImageIndex]?.alt || 'Image'} - Image ${
                        nextImageIndex + 1
                      } of ${images.length}`}
                      className="max-w-none"
                      style={{
                        maxHeight: '80vh',
                        maxWidth: '90vw',
                      }}
                      draggable={false}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer - Thumbnails and Mobile Controls */}
          <div className="shrink-0 flex flex-col items-center gap-4 py-4 md:py-6 bg-white">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="bg-white rounded-2xl p-3 border border-gray-200 shadow-lg">
                <div
                  className="flex items-center space-x-2 max-w-sm overflow-x-auto scrollbar-hide"
                  role="tablist"
                  aria-label="Image thumbnails"
                >
                  {images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => handleImageChange(index)}
                      className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        index === selectedIndex
                          ? 'border-cyan-500 ring-2 ring-cyan-500/30'
                          : 'border-gray-200 hover:border-cyan-400'
                      }`}
                      role="tab"
                      aria-selected={index === selectedIndex}
                      aria-label={`View image ${index + 1}: ${
                        image.alt || 'Image'
                      }`}
                      tabIndex={index === selectedIndex ? 0 : -1}
                    >
                      <img
                        src={image.url}
                        alt=""
                        className="w-full h-full object-cover"
                        aria-hidden="true"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Mobile Controls with Arrows */}
            {isMobile && (
              <div className="flex items-center gap-1.5">
                {images.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 bg-white border border-gray-200 h-11 w-11 p-0 rounded-full shadow-lg transition-all duration-200"
                    aria-label="Previous image"
                    title="Previous image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                )}

                <div className="flex items-center space-x-1.5 bg-white rounded-full px-3 py-2 border border-gray-200 shadow-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomOut}
                    disabled={zoom <= 0.5}
                    className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 disabled:text-gray-300 disabled:hover:bg-transparent h-7 w-7 p-0 rounded-full transition-all duration-200"
                    aria-label="Zoom out"
                    title="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span
                    className="text-gray-700 text-sm font-medium min-w-[55px] text-center"
                    aria-label={`Current zoom level: ${Math.round(
                      zoom * 100
                    )} percent`}
                  >
                    {Math.round(zoom * 100)}%
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleZoomIn}
                    disabled={zoom >= 5}
                    className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 disabled:text-gray-300 disabled:hover:bg-transparent h-7 w-7 p-0 rounded-full transition-all duration-200"
                    aria-label="Zoom in"
                    title="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <div className="w-px h-5 bg-gray-200" aria-hidden="true" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRotate}
                    className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 h-7 w-7 p-0 rounded-full transition-all duration-200"
                    aria-label="Rotate image"
                    title="Rotate 90°"
                  >
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetTransform}
                    className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 h-7 px-2.5 rounded-full text-xs transition-all duration-200"
                    aria-label="Reset zoom and rotation"
                    title="Reset"
                  >
                    Reset
                  </Button>
                </div>

                {images.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    className="text-gray-600 hover:text-cyan-600 hover:bg-cyan-50 bg-white border border-gray-200 h-11 w-11 p-0 rounded-full shadow-lg transition-all duration-200"
                    aria-label="Next image"
                    title="Next image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                )}
              </div>
            )}

            {/* Desktop Help Text */}
            {!isMobile && (
              <div
                className="bg-white rounded-xl px-3 py-2 border border-gray-200 shadow-sm"
                aria-label="Keyboard shortcuts help"
              >
                <p className="text-gray-500 text-xs">
                  Scroll to zoom • Arrow keys to navigate • ESC to close
                </p>
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

export function ImageZoom(props: ImageZoomProps) {
  const isMobile = useIsMobile()

  return (
    <ImageZoomErrorBoundary>
      {isMobile ? (
        <ImageZoomMobile {...props} />
      ) : (
        <ImageZoomDesktop {...props} />
      )}
    </ImageZoomErrorBoundary>
  )
}
