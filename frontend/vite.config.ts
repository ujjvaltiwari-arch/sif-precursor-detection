import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  optimizeDeps: {
    include: [
      'react', 'react-dom', 'react-router-dom',
      'three', '@react-three/fiber', '@react-three/drei',
      'framer-motion', 'lucide-react', 'recharts', 'axios',
      'gsap',
    ],
  },
})
