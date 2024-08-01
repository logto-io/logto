import mdx from '@mdx-js/rollup';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { findUp } from 'find-up';
import rehypeMdxCodeProps from 'rehype-mdx-code-props';
import remarkGfm from 'remark-gfm';
import { defineConfig, mergeConfig, type UserConfig } from 'vite';
import viteCompression from 'vite-plugin-compression';
import svgr from 'vite-plugin-svgr';

import { defaultConfig, manualChunks } from '../../vite.shared.config';

// We need to explicitly import the `.env` file and use `define` later because we do not have a
// prefix for our environment variables which it is required in Vite.
// @see {@link https://vitejs.dev/config/shared-options.html#envprefix}
dotenv.config({ path: await findUp('.env', {}) });

const buildConfig = (mode: string): UserConfig => ({
  base: `${process.env.CONSOLE_PUBLIC_URL ?? '/console'}`,
  envDir: '../../',
  server: {
    port: 5002,
    hmr: {
      port: 6002,
    },
  },
  css: {
    modules: {
      generateScopedName: '__[hash:base64:5]__[local]',
    },
  },
  plugins: [
    {
      enforce: 'pre',
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkGfm],
        rehypePlugins: [[rehypeMdxCodeProps, { tagName: 'code' }]],
      }),
    },
    react(),
    svgr(),
    viteCompression({ disable: mode === 'development' }),
    viteCompression({ disable: mode === 'development', algorithm: 'brotliCompress' }),
  ],
  define: {
    'import.meta.env.IS_CLOUD': JSON.stringify(process.env.IS_CLOUD),
    'import.meta.env.ADMIN_ENDPOINT': JSON.stringify(process.env.ADMIN_ENDPOINT),
    'import.meta.env.DEV_FEATURES_ENABLED': JSON.stringify(process.env.DEV_FEATURES_ENABLED),
    'import.meta.env.INTEGRATION_TEST': JSON.stringify(process.env.INTEGRATION_TEST),
    // `@withtyped/client` needs this to be defined. We can optimize this later.
    'process.env': {},
  },
  build: {
    rollupOptions: {
      output: {
        // Tip: You can use `pnpx vite-bundle-visualizer` to analyze the bundle size
        manualChunks: (id, meta) => {
          if (/\/node_modules\/(cose-base|layout-base|cytoscape|cytoscape-[^/]*)\//.test(id)) {
            return 'cytoscape';
          }

          for (const largePackage of [
            'libphonenumber-js',
            'mermaid',
            'elkjs',
            'katex',
            'refractor',
            'lodash',
            'lodash-es',
          ]) {
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
