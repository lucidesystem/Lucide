// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Weekly Task Tracker',
        short_name: 'Tasks',
        description: 'Track your weekly tasks and habits',
        theme_color: '#202124',
        background_color: '#202124',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png', // You need to add this image to your /public folder
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png', // You need to add this image to your /public folder
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      // This tells Vite we want to handle our own background push logic
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'sw.js',
    })
  ]
});