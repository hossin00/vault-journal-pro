import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/vault-journal-pro/',
  define: {
    '__ANTHROPIC_KEY__': JSON.stringify(process.env.VITE_ANTHROPIC_KEY || ''),
  }
})
