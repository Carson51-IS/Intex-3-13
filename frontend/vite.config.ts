import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const devCsp =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http://localhost:5055; font-src 'self'; connect-src 'self' http://localhost:5055 ws://localhost:3000; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    headers: {
      'Content-Security-Policy': devCsp,
    },
    proxy: {
      '/api': {
        // Must match backend (see HavenLightApi/Properties/launchSettings.json — http profile uses 5055)
        target: 'http://localhost:5055',
        changeOrigin: true,
      },
      // Static profile images live on the API host, not under /api
      '/profile-images': {
        target: 'http://localhost:5055',
        changeOrigin: true,
      },
      '/gallery-images': {
        target: 'http://localhost:5055',
        changeOrigin: true,
      },
    },
  },
});
