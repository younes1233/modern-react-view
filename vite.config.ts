import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'
import { componentTagger } from 'lovable-tagger'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: '::',
    port: 8080,
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
          // Vendor chunks - separate large libraries
          if (id.includes('node_modules')) {
            // React core in its own chunk
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }

            // UI libraries (Radix, shadcn components)
            if (id.includes('@radix-ui')) {
              return 'ui-vendor'
            }

            // React Query for data fetching
            if (id.includes('@tanstack')) {
              return 'query-vendor'
            }

            // Chart libraries
            if (id.includes('recharts') || id.includes('d3')) {
              return 'chart-vendor'
            }

            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'form-vendor'
            }

            // Router
            if (id.includes('react-router')) {
              return 'router-vendor'
            }

            // All other node_modules
            return 'vendor'
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
