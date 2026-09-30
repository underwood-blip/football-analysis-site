import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/football-analysis-site/',
  server: {
    allowedHosts: ['.monkeycode-ai.live']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
