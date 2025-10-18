import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { StoreLayout } from '@/components/store/StoreLayout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'
import {
  Star,
  Heart,
  ShoppingCart,
  Plus,
  Minus,
  Truck,
  Shield,
  RotateCcw,
  ZoomIn,
  Share,
  ChevronRight,
  Package,
  Info,
  Copy,
  Check,
  ChevronUp,
  ChevronDown,
} from 'lucide-react'
import { AuthModal } from '@/components/auth/AuthModal'
import { StarRating } from '@/components/ui/star-rating'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'
import { useCart } from '@/contexts/CartContext'
import { useWishlist } from '@/contexts/WishlistContext'
import { ImageZoom } from '@/components/store/ImageZoom'
import InnerImageZoom from 'react-inner-image-zoom'
import 'react-inner-image-zoom/lib/styles.min.css'
import { useProductDetail } from '@/hooks/useProductDetail'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { ProductDetailSkeleton } from '@/components/store/ProductDetailSkeleton'
import { ProductAPI } from '@/services/productService'
import { useResponsiveImage } from '@/contexts/ResponsiveImageContext'
import { metaPixelService } from '@/services/metaPixelService'
import { ReviewForm } from '@/components/store/ReviewForm'
import { ReviewCard } from '@/components/store/ReviewCard'
import { UserReviewActions } from '@/components/store/UserReviewActions'
import { useAuth } from '@/contexts/AuthContext'
import { reviewService } from '@/services/reviewService'
import { useQuery } from '@tanstack/react-query'
import { ProductVariants } from '@/components/store/ProductVariants'
import { RelatedProducts } from '@/components/store/RelatedProducts'
import { ProductAttributes } from '@/components/store/ProductAttributes'
import { ProductDiscounts } from '@/components/store/ProductDiscounts'
import { useCountryCurrency } from '@/contexts/CountryCurrencyContext'
import { toast } from 'sonner'
import { imageRegistry } from '@/services/imageRegistry'

const ProductDetail = () => {
  // TOGGLE BETWEEN REVIEW VERSIONS: 'simple' | 'enhanced'
  const REVIEW_VERSION = 'enhanced' // Change to 'enhanced' to switch versions

  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [showImageZoom, setShowImageZoom] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(false)
  const [thumbnailsVisible, setThumbnailsVisible] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const thumbnailTimeoutRef = useRef<NodeJS.Timeout>()
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)
  const { addToCart } = useCart()
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist()
  const { getImageUrl } = useResponsiveImage()
  const { user } = useAuth()
  const { selectedCountry, selectedCurrency } = useCountryCurrency()

  // Review states
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [editingReview, setEditingReview] = useState<any>(null)
  const [refreshReviews, setRefreshReviews] = useState(0)
  const [scrollToReview, setScrollToReview] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [currentPage, setCurrentPage] = useState(1)
  const [skuCopied, setSkuCopied] = useState(false)

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to reviews section when page changes
    const reviewsElement = document.getElementById('reviews-section')
    if (reviewsElement) {
      reviewsElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNextPage = () => {
    if (
      reviewsData?.pagination &&
      currentPage < reviewsData.pagination.last_page
    ) {
      handlePageChange(currentPage + 1)
    }
  }

  // Variant states
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [variantSelections, setVariantSelections] = useState<{
    [key: string]: string
  }>({})
  const [userNavigatedGallery, setUserNavigatedGallery] = useState(false)

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Swiper states for navigation arrows
  const [swiperInstance, setSwiperInstance] = useState<any>(null)
  const [isBeginning, setIsBeginning] = useState(true)
  const [isEnd, setIsEnd] = useState(false)
  const [mobileThumbnailSwiper, setMobileThumbnailSwiper] = useState<any>(null)

  // Fetch product from API with selected country and currency
  console.log('ProductDetail: slug from params:', slug)
  const {
    data: product,
    isLoading,
    error,
  } = useProductDetail(
    slug || '',
    selectedCountry?.id || 1,
    selectedCurrency?.id
  )

  // Fetch reviews separately with optimized caching
  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['product-reviews', product?.id, refreshReviews, currentPage],
    queryFn: () =>
      reviewService.getProductReviews(product!.id.toString(), currentPage),
    enabled: !!product?.id,
    staleTime: 5 * 60 * 1000, // Consider data fresh for 5 minutes
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes (formerly cacheTime)
  })

  // Debug log for review data
  console.log('ProductDetail - reviewsData:', reviewsData)

  // Debug logging
  console.log('ProductDetail: useProductDetail result:', {
    product,
    isLoading,
    error,
  })

  // Scroll to top when component mounts or slug changes
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [slug])

  // Initialize thumbnail visibility after product loads
  useEffect(() => {
    if (product) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        setThumbnailsVisible(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [product])

  // Track Meta Pixel ViewContent event when product loads
  useEffect(() => {
    if (product) {
      const trackProductView = async () => {
        try {
          await metaPixelService.trackViewContent(product)
        } catch (error) {
          console.warn('Meta Pixel ViewContent tracking failed:', error)
        }
      }
      trackProductView()
    }
  }, [product])

  // Handle scroll to review form
  useEffect(() => {
    if (scrollToReview && showReviewForm) {
      // Switch to reviews tab
      setActiveTab('reviews')

      // Wait for tab content to render, then scroll
      const timer = setTimeout(() => {
        const reviewForm = document.querySelector('#review-form')
        if (reviewForm) {
          reviewForm.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          })
        } else {
          // Fallback: scroll to tabs section
          const tabsSection = document.querySelector(
            '[data-orientation="horizontal"]'
          )
          if (tabsSection) {
            tabsSection.scrollIntoView({
              behavior: 'smooth',
              block: 'start',
            })
          }
        }
        setScrollToReview(false)
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [scrollToReview, showReviewForm])

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !product) return

    const touch = e.changedTouches[0]
    const deltaX = touch.clientX - touchStartRef.current.x
    const deltaY = touch.clientY - touchStartRef.current.y

    // Only handle horizontal swipes (ignore vertical scrolling)
    // Reduced threshold from 50 to 30 for easier swiping
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 30) {
      if (deltaX > 0 && selectedImage > 0) {
        // Swipe right - previous image
        setSelectedImage(selectedImage - 1)
        setUserNavigatedGallery(true)
        // Show thumbnails on swipe
        setShowThumbnails(true)
        if (thumbnailTimeoutRef.current) {
          clearTimeout(thumbnailTimeoutRef.current)
        }
        thumbnailTimeoutRef.current = setTimeout(() => {
          setShowThumbnails(false)
        }, 1200)
      } else if (deltaX < 0 && selectedImage < allImages.length - 1) {
        // Swipe left - next image
        setSelectedImage(selectedImage + 1)
        setUserNavigatedGallery(true)
        // Show thumbnails on swipe
        setShowThumbnails(true)
        if (thumbnailTimeoutRef.current) {
          clearTimeout(thumbnailTimeoutRef.current)
        }
        thumbnailTimeoutRef.current = setTimeout(() => {
          setShowThumbnails(false)
        }, 1200)
      }
    }

    touchStartRef.current = null
  }

  const handleImageInteraction = () => {
    // Show thumbnails temporarily on mobile when not on first image
    if (window.innerWidth < 768 && selectedImage > 0) {
      setShowThumbnails(true)
      if (thumbnailTimeoutRef.current) {
        clearTimeout(thumbnailTimeoutRef.current)
      }
      thumbnailTimeoutRef.current = setTimeout(() => {
        setShowThumbnails(false)
      }, 3000)
    }
  }

  const handleImageClick = () => {
    // Only open zoom if it wasn't a swipe
    if (window.innerWidth < 768 && touchStartRef.current === null) {
      setShowImageZoom(true)
    }
  }

  const handleImageChange = (index: number) => {
    setSelectedImage(index)
    setUserNavigatedGallery(true) // Mark that user has manually navigated
    // Show thumbnails when navigating away from first image
    if (index > 0 && window.innerWidth < 768) {
      handleImageInteraction()
    } else if (index === 0) {
      setShowThumbnails(false)
    }
  }

  useEffect(() => {
    return () => {
      if (thumbnailTimeoutRef.current) {
        clearTimeout(thumbnailTimeoutRef.current)
      }
    }
  }, [])

  // Use selected variant pricing if available, otherwise use product pricing (with null checks)
  const currentPrice = selectedVariant?.price || product?.pricing?.price || 0
  const originalPrice =
    selectedVariant?.original_price || product?.pricing?.original_price || 0
  const inStock = selectedVariant
    ? selectedVariant.stock > 0
    : product?.stock === null || (product?.stock ?? 0) > 0
  const currentSku = selectedVariant?.sku || product?.identifiers?.sku || ''

  // Check if the product has variants and if a complete selection is required
  const hasVariants = product?.variants && product.variants.length > 0
  const isVariantSelectionComplete = hasVariants
    ? selectedVariant !== null
    : true
  const canAddToCart = inStock && isVariantSelectionComplete

  // Memoize allImages - only recalculate when product ID changes (images don't change for same product)
  const allImages = useMemo(() => {
    if (!product?.media?.images) return []

    // Start with product images
    const productImages = product.media.images.map((img) => {
      // Add null checks for image URLs
      const mainUrls = img.urls?.main
      const thumbnailUrls = img.urls?.thumbnails

      if (!mainUrls || !thumbnailUrls) {
        return {
          url: img.urls?.original || '/placeholder.svg',
          alt: img.alt_text || product.name || 'Product image',
          zoomUrl: img.urls?.original || '/placeholder.svg',
          thumbnailUrl: img.urls?.original || '/placeholder.svg',
        }
      }

      return {
        url: getImageUrl(mainUrls),
        alt: img.alt_text || product.name || 'Product image',
        zoomUrl: img.urls?.zoom?.desktop || getImageUrl(mainUrls),
        thumbnailUrl: getImageUrl(thumbnailUrls),
      }
    })

    // Add variant images that have their own images (not fallbacks to product images)
    const variantImages = (product.variants || [])
      .filter((variant) => variant.image && variant.image.urls) // Only include variants with actual images
      .map((variant) => {
        const imageObj = variant.image
        const mainUrls = imageObj.urls?.main
        const thumbnailUrls = imageObj.urls?.thumbnails

        if (!mainUrls || !thumbnailUrls) {
          return {
            url: imageObj.urls?.original || '/placeholder.svg',
            alt: `${product.name} - ${variant.sku}`,
            zoomUrl: imageObj.urls?.original || '/placeholder.svg',
            thumbnailUrl: imageObj.urls?.original || '/placeholder.svg',
            variantId: variant.id, // Track which variant this image belongs to
          }
        }

        return {
          url: getImageUrl(mainUrls),
          alt: `${product.name} - ${variant.sku}`,
          zoomUrl: imageObj.urls?.zoom?.desktop || getImageUrl(mainUrls),
          thumbnailUrl: getImageUrl(thumbnailUrls),
          variantId: variant.id, // Track which variant this image belongs to
        }
      })

    // Combine product images and variant images
    return [...productImages, ...variantImages]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id, product?.variants])

  // Memoize current image calculation
  const currentImage = useMemo(() => {
    // If user has manually navigated the gallery, always show gallery images
    if (userNavigatedGallery || !selectedVariant || !selectedVariant.image) {
      return allImages[selectedImage] || allImages[0]
    }

    // Otherwise, show variant image when variant is selected
    if (selectedVariant && selectedVariant.image) {
      // Parse variant image using responsive image logic
      let variantImageUrl = '/placeholder.svg'
      let zoomImageUrl = '/placeholder.svg'
      let thumbnailImageUrl = '/placeholder.svg'

      if (typeof selectedVariant.image === 'string') {
        variantImageUrl = selectedVariant.image
        zoomImageUrl = selectedVariant.image
        thumbnailImageUrl = selectedVariant.image
      } else if (
        selectedVariant.image &&
        typeof selectedVariant.image === 'object'
      ) {
        const imageObj = selectedVariant.image

        if (imageObj.urls) {
          // Use responsive image logic for main image
          const mainUrls = imageObj.urls.main
          if (mainUrls) {
            variantImageUrl = getImageUrl(mainUrls)
          } else {
            // Fallback to catalog if main doesn't exist
            const catalogUrls = imageObj.urls.catalog
            if (catalogUrls) {
              variantImageUrl = getImageUrl(catalogUrls)
            } else {
              variantImageUrl = imageObj.urls.original || '/placeholder.svg'
            }
          }

          // Use zoom image (prefer desktop zoom, then main desktop, then original)
          zoomImageUrl =
            imageObj.urls.zoom?.desktop ||
            imageObj.urls.main?.desktop ||
            imageObj.urls.catalog?.desktop ||
            imageObj.urls.original ||
            variantImageUrl

          // Use thumbnail URLs
          const thumbnailUrls = imageObj.urls.thumbnails
          if (thumbnailUrls) {
            thumbnailImageUrl = getImageUrl(thumbnailUrls)
          } else {
            thumbnailImageUrl = variantImageUrl
          }
        } else {
          variantImageUrl =
            imageObj.desktop ||
            imageObj.tablet ||
            imageObj.mobile ||
            imageObj.url ||
            '/placeholder.svg'
          zoomImageUrl = variantImageUrl
          thumbnailImageUrl = variantImageUrl
        }
      }

      return {
        url: variantImageUrl,
        alt: `${product?.name || 'Product'} - ${selectedVariant.sku}`,
        zoomUrl: zoomImageUrl,
        thumbnailUrl: thumbnailImageUrl,
      }
    }

    return allImages[selectedImage] || allImages[0]
  }, [
    selectedVariant,
    selectedImage,
    allImages,
    product?.name,
    getImageUrl,
    userNavigatedGallery,
  ])

  // Handle variant selection - switch to variant's image in gallery when variant changes
  useEffect(() => {
    if (
      selectedVariant &&
      selectedVariant.image &&
      selectedVariant.image.urls
    ) {
      // Find the index of this variant's image in the gallery
      const variantImageIndex = allImages.findIndex(
        (img) => img.variantId === selectedVariant.id
      )

      if (variantImageIndex !== -1) {
        // Variant image found in gallery, switch to it
        setSelectedImage(variantImageIndex)
        setUserNavigatedGallery(false) // Reset gallery navigation flag

        // Show thumbnails briefly on mobile to indicate image changed
        if (window.innerWidth < 768 && allImages.length > 1) {
          setShowThumbnails(true)
          if (thumbnailTimeoutRef.current) {
            clearTimeout(thumbnailTimeoutRef.current)
          }
          thumbnailTimeoutRef.current = setTimeout(() => {
            setShowThumbnails(false)
          }, 1500)
        }
      } else {
        // Variant image not in gallery (fallback image), show first product image
        setSelectedImage(0)
        setUserNavigatedGallery(false)
      }
    } else if (selectedVariant === null) {
      // When variant is deselected, go back to first image
      setSelectedImage(0)
      setUserNavigatedGallery(false)

      // Show thumbnails briefly on mobile to indicate back to default
      if (window.innerWidth < 768 && allImages.length > 1) {
        setShowThumbnails(true)
        if (thumbnailTimeoutRef.current) {
          clearTimeout(thumbnailTimeoutRef.current)
        }
        thumbnailTimeoutRef.current = setTimeout(() => {
          setShowThumbnails(false)
        }, 1500)
      }
    }
  }, [selectedVariant?.id, allImages]) // Use selectedVariant?.id to trigger only when variant actually changes

  // Register variant image in ImageRegistry when variant is selected
  useEffect(() => {
    if (selectedVariant?.id && currentImage?.url) {
      console.log(
        `[ProductDetail] Registering variant image: variantId=${selectedVariant.id}, url=${currentImage.url}`
      )
      imageRegistry.registerVariant(selectedVariant.id, currentImage.url)

      // Also ensure product image is registered
      if (product?.id) {
        console.log(
          `[ProductDetail] Also registering product image: productId=${product.id}, url=${allImages[0]?.url}`
        )
        if (allImages[0]?.url) {
          imageRegistry.register(product.id, allImages[0].url, product.slug)
        }
      }
    }
  }, [
    selectedVariant?.id,
    currentImage?.url,
    product?.id,
    product?.slug,
    allImages,
  ])

  // Sync mobile thumbnail swiper when selectedImage changes (like zoom modal)
  useEffect(() => {
    if (mobileThumbnailSwiper && showThumbnails) {
      mobileThumbnailSwiper.slideTo(selectedImage)
    }
  }, [selectedImage, mobileThumbnailSwiper, showThumbnails])

  // Preload images for faster transitions
  useEffect(() => {
    if (allImages.length > 0) {
      // Preload next and previous images for smoother transitions
      const preloadImage = (url: string) => {
        const img = new Image()
        img.src = url
      }

      // Preload current + next 2 images
      const imagesToPreload = [
        allImages[selectedImage]?.url,
        allImages[selectedImage + 1]?.url,
        allImages[selectedImage + 2]?.url,
      ].filter(Boolean)

      imagesToPreload.forEach(preloadImage)
    }
  }, [allImages, selectedImage])

  // Memoize handleAddToCart to prevent recreation on every render
  const handleAddToCart = useCallback(() => {
    if (!product) return

    // Pass the selected variant ID if one is selected
    const productVariantId = selectedVariant?.id
      ? selectedVariant.id.toString()
      : undefined

    // Register the current image before adding to cart
    // This ensures the image is in the registry for the notification
    if (currentImage?.url) {
      if (selectedVariant?.id) {
        // Register variant-specific image
        imageRegistry.registerVariant(selectedVariant.id, currentImage.url)
      }

      // ALWAYS also register as product image (fallback for partial selections or when variant not fully selected)
      imageRegistry.register(product.id, currentImage.url, product.slug)
    }

    // Pass the product directly - CartContext only needs id, name, has_variants, and pricing
    addToCart(product, quantity, productVariantId)
  }, [product, selectedVariant, quantity, addToCart, currentImage])

  const handleShare = async () => {
    if (!product) return

    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - ${product.description}`,
      url: window.location.href,
    }

    try {
      if (
        navigator.share &&
        navigator.canShare &&
        navigator.canShare(shareData)
      ) {
        await navigator.share(shareData)
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(window.location.href)
        toast.success('Link copied to clipboard!', {
          description: 'Product link has been copied to your clipboard.',
          duration: 2000,
          dismissible: true,
        })
      }
    } catch (error) {
      if (error.name !== 'AbortError') {
        // Fallback to clipboard if share fails
        try {
          await navigator.clipboard.writeText(window.location.href)
          toast.success('Link copied to clipboard!', {
            description: 'Product link has been copied to your clipboard.',
            duration: 2000,
            dismissible: true,
          })
        } catch (clipboardError) {
          toast.error('Unable to share', {
            description: 'Please copy the URL manually from your browser.',
            dismissible: true,
          })
        }
      }
    }
  }

  const handleCopySku = async () => {
    try {
      await navigator.clipboard.writeText(currentSku)
      setSkuCopied(true)
      toast.success('SKU copied to clipboard!', {
        description: currentSku,
        duration: 2000,
        dismissible: true,
      })

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setSkuCopied(false)
      }, 2000)
    } catch (error) {
      toast.error('Unable to copy SKU', {
        description: 'Please copy the SKU manually.',
        dismissible: true,
      })
    }
  }

  // Memoize handleWishlistToggle
  const handleWishlistToggle = useCallback(() => {
    if (!product) return

    const wishlistProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      originalPrice: originalPrice > currentPrice ? originalPrice : undefined,
      image: allImages[0]?.url || '',
      category: product.category?.name || 'Uncategorized',
      inStock,
      rating: 0, // Rating not available in new format
      reviews: 0, // Reviews count not available in new format
      isFeatured: product.flags.is_featured,
      isNewArrival: product.flags.is_new_arrival,
      isOnSale: product.flags.on_sale,
      sku: product.identifiers.sku,
      description: product.description,
      thumbnails: allImages.map((img, index) => ({
        id: index,
        url: img.thumbnailUrl,
        alt: img.alt,
      })),
      variations: [],
    }

    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(wishlistProduct)
    }
  }, [
    product,
    currentPrice,
    originalPrice,
    allImages,
    inStock,
    isInWishlist,
    removeFromWishlist,
    addToWishlist,
  ])

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  // Memoize breadcrumbs - only recalculate when category path or product name changes
  const breadcrumbs = useMemo(
    () => [
      { label: 'Home', path: '/' },
      ...(product?.category?.path?.map((cat) => ({
        label: cat.name,
        path: `/categories/${cat.slug}`,
      })) || []),
      { label: product?.name || 'Product', path: '', current: true },
    ],
    [product?.category?.path, product?.name]
  )

  // Conditional rendering for loading and error states
  if (isLoading) {
    return <ProductDetailSkeleton />
  }

  if (error || !product) {
    return (
      <StoreLayout>
        <div className="min-h-screen bg-white flex items-center justify-center px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Product not found
            </h1>
            <Button
              onClick={() => navigate('/')}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              Back to Store
            </Button>
          </div>
        </div>
      </StoreLayout>
    )
  }

  return (
    <StoreLayout>
      <div className="min-h-screen bg-white overflow-visible">
        <div className="max-w-7xl mx-auto overflow-visible">
          {/* Enhanced Mobile Breadcrumb Navigation */}
          <div className="md:hidden px-4 py-2 border-b border-gray-100">
            <div className="w-full">
              <div className="flex items-center space-x-1 text-xs text-gray-500 overflow-x-auto">
                <style>{`
                  .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                  }
                  .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                  }
                `}</style>
                {breadcrumbs.map((breadcrumb, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-1 flex-shrink-0"
                  >
                    {index > 0 && (
                      <ChevronRight className="h-3 w-3 text-gray-400 flex-shrink-0" />
                    )}
                    {breadcrumb.current ? (
                      <span className="text-gray-900 font-medium text-xs">
                        {breadcrumb.label}
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          breadcrumb.path && navigate(breadcrumb.path)
                        }
                        className="hover:text-cyan-600 transition-colors text-xs"
                      >
                        {breadcrumb.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop Breadcrumb */}
          <div className="hidden md:block px-4 sm:px-6 md:px-8 py-4">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                {breadcrumbs.map((breadcrumb, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    {index > 0 && <span>/</span>}
                    {breadcrumb.current ? (
                      <span className="text-gray-900 font-medium">
                        {breadcrumb.label}
                      </span>
                    ) : (
                      <button
                        onClick={() =>
                          breadcrumb.path && navigate(breadcrumb.path)
                        }
                        className="hover:text-cyan-600 transition-colors"
                      >
                        {breadcrumb.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:px-4 sm:lg:px-6 lg:lg:px-8 lg:items-start">
            {/* Product Images */}
            <div className="lg:col-span-1 sticky top-20 self-start max-lg:static max-lg:top-auto">
              {/* Desktop/Tablet: Flex container for left thumbnails + main image */}
              <div className="hidden md:flex md:gap-4">
                {/* Desktop: Vertical thumbnail carousel on the left */}
                {allImages.length > 1 &&
                  (() => {
                    // Calculate dynamic height: min 1, max 3 thumbnails visible
                    const visibleSlides = Math.min(3, allImages.length)
                    const thumbnailHeight = 80 // h-20 = 80px
                    const spaceBetween = 8
                    const totalGaps =
                      Math.max(0, visibleSlides - 1) * spaceBetween
                    const containerHeight =
                      visibleSlides * thumbnailHeight + totalGaps

                    return (
                      <div className="relative w-20 mt-20">
                        {/* Up Navigation Arrow - always visible, disabled when at beginning */}
                        <button
                          id="thumbnail-prev"
                          disabled={isBeginning}
                          className={`absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 w-16 h-6 shadow-lg rounded-lg flex items-center justify-center transition-all duration-200 border ${
                            isBeginning
                              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                              : 'bg-white border-gray-100 hover:bg-cyan-50 hover:shadow-xl cursor-pointer'
                          }`}
                          onClick={() =>
                            !isBeginning && swiperInstance?.slidePrev()
                          }
                        >
                          <ChevronUp
                            className={`w-4 h-4 ${
                              isBeginning ? 'text-gray-400' : 'text-cyan-600'
                            }`}
                          />
                        </button>

                        {/* Dynamic Height Swiper Container */}
                        <div
                          style={{
                            height: `${containerHeight}px`,
                            opacity: thumbnailsVisible ? 1 : 0,
                            transition: 'opacity 0.5s ease-in-out',
                          }}
                        >
                          <Swiper
                            direction="vertical"
                            slidesPerView={visibleSlides}
                            spaceBetween={spaceBetween}
                            modules={[Navigation]}
                            className="h-full w-full"
                            onSwiper={(swiper) => {
                              setSwiperInstance(swiper)
                              setIsBeginning(swiper.isBeginning)
                              setIsEnd(swiper.isEnd)
                            }}
                            onSlideChange={(swiper) => {
                              setIsBeginning(swiper.isBeginning)
                              setIsEnd(swiper.isEnd)
                            }}
                          >
                            {allImages.map((image, index) => (
                              <SwiperSlide key={index}>
                                <button
                                  onClick={() => {
                                    setSelectedImage(index)
                                    setUserNavigatedGallery(true)
                                  }}
                                  className={`w-full h-20 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-md flex items-center justify-center ${
                                    index === selectedImage
                                      ? 'ring-2 ring-cyan-500 shadow-lg scale-105'
                                      : 'hover:ring-1 hover:ring-gray-300 hover:scale-102'
                                  }`}
                                >
                                  <img
                                    src={image.thumbnailUrl}
                                    alt={image.alt}
                                    className="max-w-full max-h-full object-contain"
                                  />
                                </button>
                              </SwiperSlide>
                            ))}
                          </Swiper>
                        </div>

                        {/* Down Navigation Arrow - positioned closer to content */}
                        <button
                          id="thumbnail-next"
                          disabled={isEnd}
                          className={`absolute left-1/2 transform -translate-x-1/2 z-10 w-16 h-6 shadow-lg rounded-lg flex items-center justify-center transition-all duration-200 border ${
                            isEnd
                              ? 'bg-gray-100 border-gray-200 cursor-not-allowed'
                              : 'bg-white border-gray-100 hover:bg-cyan-50 hover:shadow-xl cursor-pointer'
                          }`}
                          style={{
                            top: `${containerHeight + 8}px`,
                          }}
                          onClick={() => !isEnd && swiperInstance?.slideNext()}
                        >
                          <ChevronDown
                            className={`w-4 h-4 ${
                              isEnd ? 'text-gray-400' : 'text-cyan-600'
                            }`}
                          />
                        </button>
                      </div>
                    )
                  })()}

                {/* Main Image */}
                <div className="flex-1">
                  <div
                    ref={imageContainerRef}
                    className="relative aspect-square bg-gray-50 rounded-2xl group flex items-center justify-center"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                    onMouseEnter={() => handleImageInteraction()}
                  >
                    {/* Desktop: Use InnerImageZoom */}
                    <div className="hidden md:flex w-full h-full items-center justify-center overflow-hidden rounded-2xl">
                      <InnerImageZoom
                        src={currentImage?.url}
                        zoomSrc={currentImage?.url}
                        zoomType="click"
                        className="max-w-full max-h-full"
                        imgAttributes={{
                          alt: currentImage?.alt,
                          style: {
                            maxWidth: '100%',
                            maxHeight: '100%',
                            objectFit: 'contain',
                          },
                        }}
                      />
                    </div>

                    {/* Mobile: Regular image with click to zoom */}
                    <div
                      className="md:hidden w-full h-full cursor-pointer flex items-center justify-center"
                      onClick={handleImageClick}
                    >
                      <img
                        src={currentImage?.url}
                        alt={currentImage?.alt}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>

                    {/* Hidden OptimizedImage for ImageRegistry registration */}
                    <div className="sr-only" aria-hidden="true">
                      <OptimizedImage
                        src={currentImage?.url}
                        alt={product.name}
                        productId={product.id}
                        productSlug={product.slug}
                        variantId={selectedVariant?.id}
                        eager
                        key={`${product.id}-${selectedVariant?.id || 'base'}-${
                          currentImage?.url
                        }`}
                      />
                    </div>

                    {/* Desktop/Mobile: Product status badges */}
                    <div className="absolute top-4 left-4 flex flex-col gap-1">
                      {product.flags.is_featured && (
                        <Badge className="bg-cyan-500 text-xs w-fit">
                          Featured
                        </Badge>
                      )}
                      {product.flags.is_new_arrival && (
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md animate-pulse w-fit">
                          NEW
                        </Badge>
                      )}
                      {product.flags.on_sale && (
                        <Badge className="bg-red-500 text-xs w-fit">Sale</Badge>
                      )}
                    </div>

                    {/* Mobile: Wishlist and Share buttons */}
                    <div className="md:hidden absolute top-4 right-4 flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleWishlistToggle()
                        }}
                        className={`p-2 bg-white/90 hover:bg-white shadow-lg rounded-full w-9 h-9 ${
                          isInWishlist(product.id)
                            ? 'text-red-500'
                            : 'text-gray-700'
                        }`}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isInWishlist(product.id) ? 'fill-current' : ''
                          }`}
                        />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare()
                        }}
                        className="p-2 bg-white/90 hover:bg-white shadow-lg rounded-full w-9 h-9 text-gray-700"
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Mobile: Smaller pagination dots */}
                    {allImages.length > 1 && (
                      <div className="md:hidden absolute bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="flex space-x-1">
                          {allImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImage(index)
                                setUserNavigatedGallery(true)
                              }}
                              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                index === selectedImage
                                  ? 'bg-black scale-125'
                                  : 'bg-black/50 hover:bg-white/75'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mobile: Standalone main image */}
              <div className="md:hidden">
                <div
                  ref={imageContainerRef}
                  className="relative aspect-square bg-gray-50 overflow-hidden group cursor-pointer flex items-center justify-center"
                  onClick={handleImageClick}
                  onTouchStart={handleTouchStart}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={currentImage?.url}
                    alt={currentImage?.alt}
                    className="max-w-full max-h-full object-contain transition-transform duration-300"
                  />

                  {/* Hidden OptimizedImage for ImageRegistry registration */}
                  <div className="sr-only" aria-hidden="true">
                    <OptimizedImage
                      src={currentImage?.url}
                      alt={product.name}
                      productId={product.id}
                      productSlug={product.slug}
                      variantId={selectedVariant?.id}
                      eager
                      key={`${product.id}-${selectedVariant?.id || 'base'}-${
                        currentImage?.url
                      }`}
                    />
                  </div>

                  {/* Desktop: Zoom button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowImageZoom(true)}
                    className="hidden md:block absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/90 hover:bg-white shadow-lg"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>

                  {/* Mobile: Product status badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-1">
                    {product.flags.is_featured && (
                      <Badge className="bg-cyan-500 text-xs w-fit">
                        Featured
                      </Badge>
                    )}
                    {product.flags.is_new_arrival && (
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md animate-pulse w-fit">
                        NEW
                      </Badge>
                    )}
                    {product.flags.on_sale && (
                      <Badge className="bg-red-500 text-xs w-fit">Sale</Badge>
                    )}
                  </div>

                  {/* Mobile: Wishlist and Share buttons */}
                  <div className="absolute top-4 right-4 flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleWishlistToggle()
                      }}
                      className={`p-2 bg-white/90 hover:bg-white shadow-lg rounded-full w-9 h-9 ${
                        isInWishlist(product.id)
                          ? 'text-red-500'
                          : 'text-gray-700'
                      }`}
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isInWishlist(product.id) ? 'fill-current' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleShare()
                      }}
                      className="p-2 bg-white/90 hover:bg-white shadow-lg rounded-full w-9 h-9 text-gray-700"
                    >
                      <Share className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Mobile: Thumbnail gallery above dots - auto-hide */}
                  {allImages.length > 1 && (
                    <div
                      className={`absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 transition-all duration-200 ease-out ${
                        showThumbnails
                          ? 'opacity-100 translate-y-0 scale-100'
                          : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                      }`}
                      onMouseEnter={() => setShowThumbnails(true)}
                      onMouseLeave={() => setShowThumbnails(false)}
                      onTouchStart={() => {
                        setShowThumbnails(true)
                        if (thumbnailTimeoutRef.current) {
                          clearTimeout(thumbnailTimeoutRef.current)
                        }
                        thumbnailTimeoutRef.current = setTimeout(() => {
                          setShowThumbnails(false)
                        }, 1200)
                      }}
                    >
                      <div className="bg-white/90 backdrop-blur-lg rounded-xl px-3 shadow-sm border border-white/40">
                        <div className="h-14 flex items-center">
                          <Swiper
                            onSwiper={setMobileThumbnailSwiper}
                            watchSlidesProgress
                            spaceBetween={6}
                            slidesPerView="auto"
                            slideToClickedSlide={true}
                            centeredSlides={true}
                            centeredSlidesBounds={true}
                            initialSlide={selectedImage}
                            className="thumbnail-swiper"
                            style={{
                              maxWidth: 'calc(100vw - 32px)',
                            }}
                          >
                            {allImages.map((image, index) => (
                              <SwiperSlide key={index} style={{ width: '54px', height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setSelectedImage(index)
                                    setUserNavigatedGallery(true)
                                  }}
                                  className={`rounded-lg overflow-hidden transition-all duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center ${
                                    index === selectedImage
                                      ? 'w-12 h-12 border-2 border-cyan-400 opacity-100 scale-100 shadow-[0_0_8px_rgba(6,182,212,0.4)]'
                                      : 'w-9 h-9 border border-gray-200 opacity-50 hover:opacity-80 scale-95'
                                  }`}
                                >
                                  <img
                                    src={image.thumbnailUrl}
                                    alt={image.alt}
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

                  {/* Mobile: Pagination dots - auto-hide */}
                  {allImages.length > 1 && (
                    <div
                      className={`absolute bottom-2 left-1/2 transform -translate-x-1/2 transition-all duration-500 ${
                        showThumbnails
                          ? 'opacity-100'
                          : 'opacity-0 pointer-events-none'
                      }`}
                    >
                      <div className="bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-md">
                        <div className="flex space-x-1.5">
                          {allImages.map((_, index) => (
                            <button
                              key={index}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedImage(index)
                                setUserNavigatedGallery(true)
                              }}
                              className={`rounded-full transition-all duration-300 ${
                                index === selectedImage
                                  ? 'w-2 h-2 bg-cyan-500 scale-125'
                                  : 'w-1.5 h-1.5 bg-gray-400 hover:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Product Info */}
            <div
              className={`lg:col-span-1 px-4 lg:px-0 lg:py-0 space-y-4 ${
                allImages.length > 1 ? 'pt-3 pb-6 lg:pt-0' : 'py-6'
              }`}
            >
              {/* Product Title, Price and Rating */}
              <div className="space-y-3">
                <div className="relative">
                  {/* Review section - floated to top right */}
                  <div className="float-right ml-4 mb-2 flex flex-col items-end gap-1">
                    <div className="hidden md:flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={handleShare}>
                        <Share className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleWishlistToggle}
                        className={
                          isInWishlist(product.id) ? 'text-red-500' : ''
                        }
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            isInWishlist(product.id) ? 'fill-current' : ''
                          }`}
                        />
                      </Button>
                    </div>
                    <StarRating
                      rating={
                        reviewsData?.statistics?.average_rating
                          ? Math.round(reviewsData.statistics.average_rating)
                          : 0
                      }
                      size="md"
                      className="flex-shrink-0"
                    />
                    <button
                      onClick={() => {
                        if (user) {
                          setShowReviewForm(true)
                          setEditingReview(null)
                          setScrollToReview(true)
                        } else {
                          setAuthModalOpen(true)
                        }
                      }}
                      className="text-xs text-cyan-600 hover:text-cyan-700 font-medium hover:underline transition-all duration-200 whitespace-nowrap"
                    >
                      {user ? 'Write a review' : 'Sign in to review'}
                    </button>
                  </div>

                  {/* Product name - flows around the floated review */}
                  <div className="space-y-1">
                    <h1 className="text-lg md:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                      {product.name}
                    </h1>
                    {inStock ? (
                      <Badge className="bg-green-500 text-white text-xs">
                        In Stock
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-xs">
                        Out of Stock
                      </Badge>
                    )}
                  </div>

                  {/* Clear float */}
                  <div className="clear-both"></div>
                </div>

                {/* Two-column grid layout for tablet and desktop */}
                <div className="md:grid md:grid-cols-2 md:gap-6 space-y-3 md:space-y-0">
                  {/* Left Column */}
                  <div className="space-y-3">
                    {/* Price Section */}
                    <div className="space-y-2">
                      <div className="flex items-baseline flex-wrap gap-x-3 gap-y-1">
                        <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">
                          {selectedCurrency?.symbol || '$'}
                          {currentPrice ? currentPrice.toFixed(2) : '0.00'}
                        </span>
                        {originalPrice > currentPrice && (
                          <span className="text-base md:text-lg text-gray-500 line-through">
                            {selectedCurrency?.symbol || '$'}
                            {originalPrice ? originalPrice.toFixed(2) : '0.00'}
                          </span>
                        )}
                        {originalPrice > currentPrice && (
                          <Badge className="bg-red-500 text-white text-xs">
                            {Math.round(
                              ((originalPrice - currentPrice) / originalPrice) *
                                100
                            )}
                            % Off
                          </Badge>
                        )}
                      </div>
                      {(selectedVariant?.applied_discounts?.length > 0 ||
                        product.pricing.applied_discounts.length > 0) && (
                        <div className="flex flex-wrap gap-2">
                          {(
                            selectedVariant?.applied_discounts ||
                            product.pricing.applied_discounts
                          ).map((discount: any, index: number) => (
                            <Badge
                              key={index}
                              variant="outline"
                              className="text-xs"
                            >
                              {discount.name}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="text-sm md:text-base text-gray-600">
                        Inclusive of VAT ({selectedCurrency?.code || 'USD'})
                      </p>
                    </div>

                    {/* <p className="text-gray-600">{product.description}</p> */}

                    {/* Tablet/Desktop Stock Status */}
                    <div className="hidden md:block">
                      {inStock ? (
                        <div className="flex items-center space-x-2">
                          <Badge className="bg-green-500 text-white">
                            In Stock
                          </Badge>
                          <span className="text-sm text-gray-600">
                            Available
                          </span>
                        </div>
                      ) : (
                        <Badge variant="destructive">Out of Stock</Badge>
                      )}
                    </div>

                    {/* SKU Info */}
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">
                        SKU: {currentSku}
                      </span>
                      <button
                        onClick={handleCopySku}
                        className="p-1 hover:bg-gray-100 rounded transition-colors duration-200 group"
                        title="Copy SKU to clipboard"
                      >
                        {skuCopied ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3 text-gray-500 group-hover:text-gray-700" />
                        )}
                      </button>
                    </div>

                    {/* Product Variants */}
                    {product.variants && product.variants.length > 0 && (
                      <ProductVariants
                        variants={product.variants}
                        selectedVariant={selectedVariant}
                        onVariantChange={setSelectedVariant}
                        showInfoCard={false}
                        onSelectionsChange={setVariantSelections}
                      />
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-3">
                    {/* Delivery & Policy Info Card - Hidden on mobile */}
                    <Card className="hidden md:block border border-gray-200 bg-gray-50/50">
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Truck className="w-2.5 h-2.5 text-green-600" />
                          </div>
                          <span className="text-gray-700">
                            Delivery: {selectedCurrency?.symbol || '$'}
                            {product.delivery?.cost
                              ? Number(product.delivery.cost).toFixed(2)
                              : '0.00'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Shield className="w-2.5 h-2.5 text-blue-600" />
                          </div>
                          <span className="text-gray-700">
                            {product.flags.is_vat_exempt
                              ? 'VAT exempt'
                              : `VAT included (${
                                  product.pricing.vat?.rate || 0
                                }%)`}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs">
                          <div className="w-4 h-4 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                            <RotateCcw className="w-2.5 h-2.5 text-orange-600" />
                          </div>
                          <span className="text-gray-700">
                            30-day return policy
                          </span>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Variant Info Card */}
                    {product.variants && product.variants.length > 0 && (
                      <ProductVariants
                        variants={product.variants}
                        selectedVariant={selectedVariant}
                        onVariantChange={setSelectedVariant}
                        showInfoCard={true}
                        showSelectionOptions={false}
                        externalSelections={variantSelections}
                      />
                    )}

                    {/* Active Discounts */}
                    {(selectedVariant?.applied_discounts?.length > 0 ||
                      product.pricing.applied_discounts.length > 0) && (
                      <ProductDiscounts
                        discounts={
                          selectedVariant?.applied_discounts ||
                          product.pricing.applied_discounts
                        }
                        currency={selectedCurrency || product.pricing.currency}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity & Actions */}
              <div className="space-y-4">
                {/* Desktop/Tablet: Inline Quantity + Add to Cart */}
                <div className="hidden md:flex items-center gap-3">
                  {/* Quantity Selector */}
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-3">
                      Qty
                    </span>
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-10 p-0 hover:bg-gray-50"
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-10 text-center font-medium text-base">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-10 p-0 hover:bg-gray-50"
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white h-12 text-base font-semibold rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                    size="lg"
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    ADD TO CART
                  </Button>
                </div>

                {/* Mobile: Original Separate Layout */}
                <div className="md:hidden space-y-4">
                  {/* Quantity Selector */}
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium text-gray-900">
                      Qty
                    </span>
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-10 h-10 p-0 hover:bg-gray-50"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-12 text-center font-medium text-lg">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 p-0 hover:bg-gray-50"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-14 text-lg font-semibold rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50"
                    size="lg"
                  >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    ADD TO CART
                  </Button>
                </div>

                {/* Helper Messages */}
                <div className="space-y-2">
                  {/* Helper text when variant selection is incomplete */}
                  {hasVariants && !isVariantSelectionComplete && (
                    <p className="text-sm text-orange-600 text-center">
                      Please select all product options to add to cart
                    </p>
                  )}

                  {/* Out of stock message */}
                  {!inStock && (
                    <p className="text-sm text-red-600 text-center">
                      This item is currently out of stock
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <div className="mt-8 md:mt-12 px-4 sm:px-6 md:px-8 pb-8">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 bg-gray-50 p-0.5 md:p-1 rounded-xl">
                <TabsTrigger
                  value="description"
                  className="rounded-lg text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2"
                >
                  Description
                </TabsTrigger>
                <TabsTrigger
                  value="specifications"
                  className="rounded-lg text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2"
                >
                  Specifications
                </TabsTrigger>
                {/* <TabsTrigger
                  value="attributes"
                  className="rounded-lg text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2"
                >
                  Attributes
                </TabsTrigger> */}
                <TabsTrigger
                  value="reviews"
                  className="rounded-lg text-xs md:text-sm px-2 md:px-3 py-1.5 md:py-2"
                >
                  Reviews
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 md:p-6">
                    <p className="text-sm md:text-base text-gray-700 leading-relaxed">
                      {product.description}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specifications" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                      <div className="space-y-2 md:space-y-3">
                        <div className="flex justify-between">
                          <span className="font-medium text-sm md:text-base text-gray-900">
                            SKU:
                          </span>
                          <span className="text-sm md:text-base text-gray-600">
                            {currentSku}
                          </span>
                        </div>
                        {product.category && (
                          <div className="flex justify-between">
                            <span className="font-medium text-sm md:text-base text-gray-900">
                              Category:
                            </span>
                            <span className="text-sm md:text-base text-gray-600">
                              {product.category.name}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="font-medium text-sm md:text-base text-gray-900">
                            Store:
                          </span>
                          <span className="text-sm md:text-base text-gray-600">
                            {product.store}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2 md:space-y-3">
                        {product.specifications &&
                        product.specifications.length > 0 ? (
                          product.specifications.map((spec, index) => (
                            <div key={index} className="flex justify-between">
                              <span className="font-medium text-sm md:text-base text-gray-900">
                                {spec.name}:
                              </span>
                              <span className="text-sm md:text-base text-gray-600">
                                {spec.value}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center text-gray-500 py-3 md:py-4">
                            <Info className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-400" />
                            <p className="text-sm md:text-base">
                              No specifications available
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="attributes" className="mt-6">
                {product.attributes && product.attributes.length > 0 ? (
                  <ProductAttributes attributes={product.attributes} />
                ) : (
                  <Card className="border-0 shadow-sm">
                    <CardContent className="p-4 md:p-6">
                      <div className="text-center text-gray-500 py-6 md:py-8">
                        <Info className="w-6 h-6 md:w-8 md:h-8 mx-auto mb-2 text-gray-400" />
                        <p className="text-sm md:text-base">
                          No attributes available for this product
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6 md:p-8">
                    <div id="reviews-section" className="space-y-6">
                      {/* Reviews Header */}
                      <div className="flex items-center justify-between">
                        <h3 className="text-base md:text-lg font-semibold">
                          Customer Reviews
                        </h3>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs md:text-sm text-amber-600 font-medium">
                            {reviewsData?.statistics &&
                            reviewsData.statistics.total_reviews > 0
                              ? `${reviewsData.statistics.total_reviews}★ reviews`
                              : 'No reviews yet'}
                          </span>
                        </div>
                      </div>

                      {/* Add Review Button - Show for all users */}
                      {!showReviewForm && !editingReview && (
                        <div className="mb-4 md:mb-6">
                          <Button
                            onClick={() => {
                              if (user) {
                                setShowReviewForm(true)
                              } else {
                                setAuthModalOpen(true)
                              }
                            }}
                            className="w-full text-sm md:text-base h-12 md:h-14 font-semibold rounded-xl shadow-lg hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-[1.05] active:scale-[0.98] active:shadow-md relative overflow-hidden group hover:brightness-110"
                          >
                            {/* Pulse ring */}
                            <div className="absolute inset-0 rounded-xl bg-white/10 animate-ping opacity-20 group-hover:opacity-30"></div>

                            {/* Hover glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/0 via-blue-400/20 to-blue-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Ripple effect on click */}
                            <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 group-active:opacity-100 group-active:animate-pulse transition-opacity duration-150"></div>

                            {/* Button content */}
                            <div className="relative flex items-center justify-center">
                              <Star className="w-4 h-4 mr-2 group-hover:rotate-180 group-hover:scale-110 group-active:scale-90 transition-all duration-500 ease-out" />
                              <span className="group-hover:tracking-wide transition-all duration-300">
                                {reviewsData?.reviews &&
                                reviewsData.reviews.length > 0
                                  ? user
                                    ? 'Write a Review'
                                    : 'Sign In to Write a Review'
                                  : user
                                  ? 'Write the First Review'
                                  : 'Sign In to Write the First Review'}
                              </span>
                            </div>
                          </Button>

                          {/* Benefits - Show only when no reviews exist */}
                          {(!reviewsData?.reviews ||
                            reviewsData.reviews.length === 0) && (
                            <div className="mt-4 flex flex-col items-center space-y-2 text-xs md:text-sm text-gray-500">
                              <div className="flex items-center">
                                <Shield className="w-4 h-4 mr-1 text-green-500" />
                                <span>
                                  Help other customers make informed decisions
                                </span>
                              </div>
                              <div className="flex items-center">
                                <Package className="w-4 h-4 mr-1 text-blue-500" />
                                <span>Improve our products quality</span>
                              </div>
                              <div className="flex items-center">
                                <Heart className="w-4 h-4 mr-1 text-red-500" />
                                <span>Share your experience</span>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Review Form */}
                      {(showReviewForm || editingReview) && (
                        <div id="review-form" className="mb-4 md:mb-6">
                          <ReviewForm
                            productId={product.id.toString()}
                            existingReview={editingReview}
                            onReviewSubmitted={() => {
                              setShowReviewForm(false)
                              setEditingReview(null)
                              setCurrentPage(1) // Reset to first page when user adds their own review
                              setRefreshReviews((prev) => prev + 1)
                              refetchReviews()
                            }}
                            onCancel={() => {
                              setShowReviewForm(false)
                              setEditingReview(null)
                            }}
                          />
                        </div>
                      )}

                      {/* Review Filters & Sorting - Commented for now */}
                      {/*
                        {reviewsData?.reviews && reviewsData.reviews.length > 0 && (
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-6 p-3 bg-gray-50 rounded-lg border">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">Filter:</span>
                              <div className="flex flex-wrap gap-1">
                                <button className="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700 border border-blue-200">
                                  All ({reviewsData.reviews.length})
                                </button>
                                <button className="px-2 py-1 text-xs rounded-md bg-white text-gray-600 border border-gray-200 hover:bg-gray-50">
                                  5★ ({reviewsData.reviews.filter(r => r.rating === 5).length})
                                </button>
                                <button className="px-2 py-1 text-xs rounded-md bg-white text-gray-600 border border-gray-200 hover:bg-gray-50">
                                  4★ ({reviewsData.reviews.filter(r => r.rating === 4).length})
                                </button>
                                <button className="px-2 py-1 text-xs rounded-md bg-white text-gray-600 border border-gray-200 hover:bg-gray-50">
                                  3★ ({reviewsData.reviews.filter(r => r.rating === 3).length})
                                </button>
                                <button className="px-2 py-1 text-xs rounded-md bg-white text-gray-600 border border-gray-200 hover:bg-gray-50">
                                  2★ ({reviewsData.reviews.filter(r => r.rating === 2).length})
                                </button>
                                <button className="px-2 py-1 text-xs rounded-md bg-white text-gray-600 border border-gray-200 hover:bg-gray-50">
                                  1★ ({reviewsData.reviews.filter(r => r.rating === 1).length})
                                </button>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-700">Sort:</span>
                              <select className="text-xs border border-gray-200 rounded-md px-2 py-1 bg-white">
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                                <option value="highest">Highest Rating</option>
                                <option value="lowest">Lowest Rating</option>
                                <option value="helpful">Most Helpful</option>
                              </select>
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="flex items-center space-x-1 text-xs">
                                <input type="checkbox" className="rounded border-gray-300" />
                                <span className="text-gray-600">Verified only</span>
                              </label>
                              <label className="flex items-center space-x-1 text-xs">
                                <input type="checkbox" className="rounded border-gray-300" />
                                <span className="text-gray-600">With photos</span>
                              </label>
                            </div>
                          </div>
                        )}
                        */}

                      <div className="space-y-3 md:space-y-4">
                        {/* Reviews List */}
                        <div className="space-y-3 md:space-y-4">
                          {reviewsData?.reviews &&
                          reviewsData.reviews.length > 0 ? (
                            reviewsData.reviews.map((review) => (
                              <ReviewCard
                                key={review.id}
                                review={review}
                                productId={product.id.toString()}
                                mode={REVIEW_VERSION}
                                onEdit={(review) => {
                                  setEditingReview(review)
                                  setShowReviewForm(true)
                                  setScrollToReview(true)
                                }}
                                onDelete={() => {
                                  setCurrentPage(1)
                                  refetchReviews()
                                }}
                              />
                            ))
                          ) : (
                            <div className="text-center py-6 md:py-8">
                              <p className="text-sm md:text-base text-gray-500">
                                No reviews yet. Be the first to review this
                                product!
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Pagination */}
                        {reviewsData?.pagination &&
                          reviewsData.pagination.last_page > 1 && (
                            <div className="flex items-center justify-center pt-6 md:pt-8">
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    reviewsData.pagination.current_page <= 1
                                  }
                                  onClick={handlePreviousPage}
                                  className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Previous
                                </Button>

                                <div className="flex items-center space-x-1">
                                  {/* Page numbers */}
                                  {Array.from(
                                    {
                                      length: Math.min(
                                        5,
                                        reviewsData.pagination.last_page
                                      ),
                                    },
                                    (_, i) => {
                                      const pageNum = i + 1
                                      const isActive =
                                        pageNum ===
                                        reviewsData.pagination.current_page
                                      return (
                                        <Button
                                          key={pageNum}
                                          variant={
                                            isActive ? 'default' : 'outline'
                                          }
                                          size="sm"
                                          onClick={() =>
                                            handlePageChange(pageNum)
                                          }
                                          className={`px-3 py-2 text-xs font-medium rounded-lg ${
                                            isActive
                                              ? 'bg-gray-900 text-white hover:bg-gray-800'
                                              : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-700'
                                          }`}
                                        >
                                          {pageNum}
                                        </Button>
                                      )
                                    }
                                  )}
                                </div>

                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={
                                    reviewsData.pagination.current_page >=
                                    reviewsData.pagination.last_page
                                  }
                                  onClick={handleNextPage}
                                  className="px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Next
                                </Button>
                              </div>
                            </div>
                          )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Related Products */}
          {product.related_products && product.related_products.length > 0 && (
            <div className="mt-8 md:mt-12 px-4 sm:px-6 md:px-8 pb-8">
              <RelatedProducts products={product.related_products} />
            </div>
          )}
        </div>

        <ImageZoom
          images={allImages.map((img) => ({ url: img.zoomUrl, alt: img.alt }))}
          selectedIndex={selectedImage}
          open={showImageZoom}
          onOpenChange={setShowImageZoom}
          onImageChange={setSelectedImage}
        />

        {/* Auth Modal */}
        <AuthModal
          open={authModalOpen}
          onOpenChange={setAuthModalOpen}
          defaultMode="signin"
        />
      </div>
    </StoreLayout>
  )
}

export default ProductDetail
