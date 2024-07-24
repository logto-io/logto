/** @fileoverview The common config for frontend projects. */

import { UserConfig } from 'vite';
import fs from 'fs';

export const defaultConfig: UserConfig = {
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
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
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
};
