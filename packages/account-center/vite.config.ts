import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { mergeConfig, defineConfig, type Plugin, type UserConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import svgr from 'vite-plugin-svgr';

import { defaultConfig } from '../../vite.shared.config';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const experienceSrcPath = path.resolve(__dirname, '../experience/src');
const accountCenterSrcPath = path.resolve(__dirname, './src');

const experienceAliasPlugin = (): Plugin => ({
  name: 'experience-shared-alias',
  enforce: 'pre',
  transform(code, id) {
    const normalizedId = id.replaceAll('\\', '/');

    if (!normalizedId.startsWith(experienceSrcPath) || !code.includes('@/')) {
      return null;
    }

    return {
      code: code.replaceAll(/(["'])@\//g, '$1@experience/'),
      map: null,
    };
  },
});

const buildConfig = (mode: string): UserConfig => ({
  base: '/account',
  server: {
    port: 5004,
    hmr: {
      port: 6004,
    },
    fs: {
      allow: ['..'],
    },
  },
  resolve: {
    alias: [
      {
        find: /^@ac\//,
        replacement: `${accountCenterSrcPath}/`,
      },
      {
        find: /^@experience\//,
        replacement: `${experienceSrcPath}/`,
      },
    ],
  },
  plugins: [
    experienceAliasPlugin(),
    react(),
    svgr(),
    viteCompression({ disable: mode === 'development' }),
    viteCompression({ disable: mode === 'development', algorithm: 'brotliCompress' }),
  ],
});

export default defineConfig(({ mode }) => mergeConfig(defaultConfig, buildConfig(mode)));
