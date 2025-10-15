import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '0.0.0.0', // Bind to all network interfaces but use 0.0.0.0 consistently
    port: 8080,
    strictPort: true, // Fail if port 8080 is already in use instead of trying another port
  },
  plugins: [react(), mode === 'development' && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Generate source maps only in development
    sourcemap: mode === 'development',

    // Increase chunk size warning limit (default is 500kb)
    chunkSizeWarningLimit: 2000,

    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks - separate large libraries for better caching
          if (id.includes('node_modules')) {
            // React core only (small, frequently used)
            if (id.includes('/react/') && !id.includes('react-dom') && !id.includes('react-router') && !id.includes('react-hook')) {
              return 'react-core'
            }

            // React DOM (medium, frequently used)
            if (id.includes('react-dom')) {
              return 'react-dom'
            }

            // Router (medium, store pages only)
            if (id.includes('react-router')) {
              return 'router'
            }

            // UI libraries - Radix (large, used across site)
            if (id.includes('@radix-ui')) {
              return 'ui-radix'
            }

            // React Query (medium, used for data fetching)
            if (id.includes('@tanstack/react-query')) {
              return 'query'
            }

            // Chart libraries (large, admin only - lazy load)
            if (id.includes('recharts') || id.includes('d3-')) {
              return 'charts'
            }

            // Excel/PDF libraries (large, admin only - lazy load)
            if (id.includes('xlsx') || id.includes('jspdf')) {
              return 'documents'
            }

            // Form libraries (medium, checkout/admin)
            if (id.includes('react-hook-form') || id.includes('zod') || id.includes('@hookform')) {
              return 'forms'
            }

            // Carousel/Swiper (medium, store homepage)
            if (id.includes('swiper') || id.includes('embla-carousel')) {
              return 'carousel'
            }

            // Icons (medium, used everywhere)
            if (id.includes('lucide-react')) {
              return 'icons'
            }

            // DnD Kit (medium, admin only)
            if (id.includes('@dnd-kit')) {
              return 'dnd'
            }

            // All other small utilities
            return 'vendor-utils'
          }
        },

        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const name = assetInfo.name || 'asset'
          const info = name.split('.')
          let extType = info[info.length - 1]

          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(name)) {
            extType = 'images'
          } else if (/\.(woff|woff2|eot|ttf|otf)$/i.test(name)) {
            extType = 'fonts'
          }

          return `assets/${extType}/[name]-[hash][extname]`
        },

        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },

    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production', // Remove console.logs in production
        drop_debugger: true,
      },
    },
  },
}))
