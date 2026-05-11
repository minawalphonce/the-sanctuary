import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[64, 'favicon-64x64.png']],
    },
    maskable: {
      sizes: [512],
      padding: 0.1,
      resizeOptions: { background: '#0f172a' },
    },
    apple: {
      sizes: [180],
      resizeOptions: { background: '#0f172a' },
    },
  },
  images: ['public/logo.png'],
})
