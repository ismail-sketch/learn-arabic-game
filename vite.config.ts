import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => ({
  // GitHub Pages публикует проект во вложенной папке, Vercel — от корня.
  // VERCEL автоматически выставляет сам Vercel во время сборки.
  base: mode === 'production' && !process.env.VERCEL ? '/learn-arabic-game/' : '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'Сад букв',
        short_name: 'Сад букв',
        description: 'Игра-обучение арабскому алфавиту для детей',
        theme_color: '#f4c76a',
        background_color: '#fbf3e2',
        display: 'standalone',
        orientation: 'portrait',
        lang: 'ru',
        dir: 'ltr',
        icons: [
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,json,mp3}']
      }
    })
  ]
}))
