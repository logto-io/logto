/** @fileoverview The common config for frontend projects. */

import { Rollup, UserConfig } from 'vite';

export const manualChunks: Rollup.GetManualChunk = (id) => {
  // Caution: React-related packages should be bundled together otherwise it will cause runtime errors
  // Update this list if necessary when adding new React-related packages
  if (/\/(react|react-[^/]*|[^/]*-react|@react-spring|swr|use-sync-external-store|recharts|reactcss|rc-[^/]*)\//.test(id)) {
    return 'react';
  }

  if (id.includes('/@logto/')) {
    return '@logto';
  }

  if (id.includes('/node_modules/')) {
    return 'vendors';
  }

  const match = /\/lib\/locales\/([^/]+)/.exec(id);
  if (match?.[1]) {
    return `phrases-${match[1]}`;
  }
};

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
    sourcemap: true,
    rollupOptions: {
      output: { manualChunks },
    },
  },
};
