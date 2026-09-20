import react from '@vitejs/plugin-react';
import { mergeConfig, defineConfig, type UserConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';

import { defaultConfig } from '../../vite.shared.config';

const buildConfig = (mode: string): UserConfig => ({
  base: '/demo-app',
  server: {
    port: 5003,
    hmr: {
      port: 6003,
    },
  },
  plugins: [
    react(),
    viteCompression({ disable: mode === 'development' }),
    viteCompression({ disable: mode === 'development', algorithm: 'brotliCompress' }),
  ],
  define: {
    'import.meta.env.DEV_FEATURES_ENABLED': JSON.stringify(process.env.DEV_FEATURES_ENABLED ?? ''),
  },
});

export default defineConfig(({ mode }) => mergeConfig(defaultConfig, buildConfig(mode)));
