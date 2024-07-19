// eslint-disable-next-line unicorn/prevent-abbreviations
import { fileURLToPath } from 'node:url';

import { esbuildPlugin } from '@web/dev-server-esbuild';

const config = {
  open: true,
  watch: true,
  appIndex: 'index.html',
  nodeResolve: {
    exportConditions: ['development'],
  },
  plugins: [
    esbuildPlugin({
      ts: true,
      tsconfig: fileURLToPath(new URL('tsconfig.json', import.meta.url)),
    }),
  ],
};

export default config;
