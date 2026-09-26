import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    allowedHosts: ['.monkeycode-ai.live', '.monkeycode-ai.online'],
    proxy: {
      '/api/fd': {
        target: 'https://www.football-data.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fd/, '')
      }
    }
  }
})
