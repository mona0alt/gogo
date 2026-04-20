import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'
import { resolve } from 'path'

export default defineConfig({
  plugins: [uni()],
  server: {
    host: '0.0.0.0',
    port: 5173
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
        additionalData: '@use "@/styles/variables.scss" as *;'
      }
    }
  }
})
