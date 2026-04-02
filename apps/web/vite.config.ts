
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:80",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  optimizeDeps: {
    include: [
      'react-quill',
      'katex',
      'quill-image-resize-module-react',
    ],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})
