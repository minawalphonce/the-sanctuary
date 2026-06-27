import path from "path"
import { defineConfig, loadEnv } from 'vite'
import tailwindcss from "@tailwindcss/vite"
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const appName = env.VITE_ORG_NAME || 'The Sanctuary'

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'prompt',
        includeAssets: ['favicon.svg', 'logo.png'],
        manifest: {
          name: appName,
          short_name: appName,
          description: 'Empowering Youth, Strengthening Community',
          theme_color: '#1B2B48',
          background_color: '#1B2B48',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: 'pwa-64x64.png',
              sizes: '64x64',
              type: 'image/png',
            },
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: 'maskable-icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        // No runtime/offline caching of API calls — only the precached
        // app shell (index.html, JS/CSS, icons) for installability.
        // Update flow: registerType 'prompt' + usePwaUpdate() shows a
        // reload toast instead of silently swapping the SW.
        workbox: {
          navigateFallback: null,
          runtimeCaching: [],
        },
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  }
})
