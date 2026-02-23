import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()], 
  build: {
    // Increase chunk size warning threshold (in kB)
    chunkSizeWarningLimit: 2000,
  },
  // Force restart for Tailwind config changes
})
