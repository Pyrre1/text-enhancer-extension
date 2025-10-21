import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        content: resolve(__dirname, 'src/content/content.js'),
        popup: resolve(__dirname, 'src/popup/popup.js')
      },
      output: {
        entryFileNames: '[name].js'
      }
    },
    outDir: 'dist',
    emptyOutDir: true
  },
  publicDir: 'public'
})
