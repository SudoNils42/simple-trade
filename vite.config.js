import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/trade_simple/',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/yahoo-api': {
        target: 'https://query2.finance.yahoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yahoo-api/, ''),
        headers: {
          'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
          'Referer': 'https://finance.yahoo.com/',
          'Accept': 'application/json'
        }
      }
    }
  }
})
