import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'
  const apiUrl = isDev ? 'http://localhost:3001/api' : 'https://passportease.onrender.com/api'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true
        }
      }
    },
    build: {
      base: '/'
    },
    define: {
      __API_URL__: JSON.stringify(apiUrl),
      __IS_DEV__: isDev
    }
  }
})
