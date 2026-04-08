import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
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
    },
  },
});
