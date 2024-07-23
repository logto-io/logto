import { defineConfig } from 'vite';

export default defineConfig({
  base: '/demo-app',
  server: {
    port: 5003,
    hmr: {
      port: 6003,
    },
  },
  resolve: {
    alias: [
      {
        find: /^@\//,
        replacement: '/src/',
      },
    ],
  },
  optimizeDeps: {
    include: ['@logto/phrases', '@logto/phrases-experience', '@logto/schemas'],
  },
  build: {
    sourcemap: process.env.NODE_ENV === 'production',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/\/react[^/]*\//.test(id)) {
            return 'react';
          }

          if (id.includes('/@logto/')) {
            return 'logto';
          }

          if (id.includes('/node_modules/')) {
            return 'vendors';
          }

          const match = /\/lib\/locales\/([^/]+)/.exec(id);
          if (match?.[1]) {
            return `phrases-${match[1]}`;
          }
        },
      },
    },
  },
});
