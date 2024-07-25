/** @fileoverview The common config for frontend projects. */

import { Rollup, UserConfig } from 'vite';

export const manualChunks: Rollup.GetManualChunk = (id, { getModuleInfo }) => {
  const hasReactDependency = (id: string): boolean => {
    return getModuleInfo(id)
      ?.importedIds
      .some((importedId) =>
        importedId.includes('react') ||
        importedId.includes('react-dom')
      ) ?? false;
  }

  // Caution: React-related packages should be bundled together otherwise it will cause runtime errors
  if (id.includes('/node_modules/') && hasReactDependency(id)) {
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
