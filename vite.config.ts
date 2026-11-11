import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['sb-1dm9vzikvysv.vercel.run', 'sb-gc70exdmjqcu.vercel.run' , 'sb-gc70exdmjqcu.vercel.run'],
  },
})
