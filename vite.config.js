import { defineConfig } from 'vite'

export default defineConfig({
  root: 'views',
  build: {
    rollupOptions: {
      input: 'views/Homepage.html'
    }
  },
  server: {
    port: 3000,
    open: '/Homepage.html'
  }
})