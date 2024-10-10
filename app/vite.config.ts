import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import nodePolyfills from 'rollup-plugin-polyfill-node';
import EnvironmentPlugin from 'vite-plugin-environment';

export default defineConfig({
  plugins: [
    react(),
    EnvironmentPlugin({ // Define process.env polyfill
      NODE_ENV: 'development',
    }),
  ],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
        'process.env': '{}', // Define process.env to an empty object
      },
      plugins: [],
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        nodePolyfills(), // Polyfill Node.js built-in modules
      ],
    },
  },
  server: {
    host: 'localhost', // Ensure it binds only to localhost
    port: 5173
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
});
