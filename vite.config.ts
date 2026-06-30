import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Let vite-plugin-pwa generate and inject the service worker
      // This replaces the manual sw.js + pwaRegistration.ts approach
      injectRegister: 'auto',
      workbox: {
        // Precache all static assets built by Vite
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Cache API responses
        runtimeCaching: [
          {
            // Hospital API — network first, fallback to cache
            urlPattern: /^https?:\/\/.*\/api\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'oltra-api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Images (radiology uploads, avatars)
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'oltra-images',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
            },
          },
          {
            // Google Fonts
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 365 * 24 * 60 * 60,
              },
            },
          },
        ],
      },
      manifest: {
        name: 'OltraHMS — Hospital Management System',
        short_name: 'OltraHMS',
        description: 'Next-generation Hospital Management System for Nigerian healthcare',
        theme_color: '#0ea5e9',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        categories: ['medical', 'health', 'productivity'],
        shortcuts: [
          {
            name: 'Queue Display',
            url: '/queue-display',
            description: 'Open patient queue TV display',
          },
          {
            name: 'New Patient',
            url: '/receptionist/queue',
            description: 'Register walk-in patient',
          },
        ],
      },
      devOptions: {
        enabled: false, // Don't run service worker in dev (causes confusion)
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 2000,
  },
});
