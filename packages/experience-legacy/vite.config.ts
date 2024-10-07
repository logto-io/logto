import react from '@vitejs/plugin-react';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import svgr from 'vite-plugin-svgr';

import { defaultConfig, manualChunks } from '../../vite.shared.config';

const buildConfig = (mode: string): UserConfig => ({
  server: {
    port: 5001,
    hmr: {
      port: 6001,
    },
  },
  css: {
    modules: {
      generateScopedName:
        // Keep backward compatibility with the old CSS modules naming in production
        mode === 'development' ? '__[hash:base64:5]__[local]' : '[hash:base64:5]_[local]',
    },
  },
  plugins: [
    react(),
    svgr(),
    viteCompression({ disable: mode === 'development' }),
    viteCompression({ disable: mode === 'development', algorithm: 'brotliCompress' }),
  ],
  define: {
    'import.meta.env.DEV_FEATURES_ENABLED': JSON.stringify(process.env.DEV_FEATURES_ENABLED),
  },
  build: {
    // Use the same browserslist configuration as in README.md.
    // Consider using the esbuild target directly in the future.
    target: browserslistToEsbuild('> 0.5%, last 2 versions, Firefox ESR, not dead'),
    rollupOptions: {
      output: {
        // Tip: You can use `pnpx vite-bundle-visualizer` to analyze the bundle size
        manualChunks: (id, meta) => {
          if (/\/node_modules\/i18next[^/]*\//.test(id)) {
            return 'i18next';
          }

          for (const largePackage of ['libphonenumber-js', 'core-js']) {
            if (id.includes(`/node_modules/${largePackage}/`)) {
              return largePackage;
            }
          }

          return manualChunks(id, meta);
        },
      },
    },
  },
});

export default defineConfig(({ mode }) => mergeConfig(defaultConfig, buildConfig(mode)));
