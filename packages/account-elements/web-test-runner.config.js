import { fileURLToPath } from 'node:url';

import { esbuildPlugin } from '@web/dev-server-esbuild';
import { playwrightLauncher } from '@web/test-runner-playwright';

const config = {
  files: ['src/**/*.test.ts'],
  nodeResolve: {
    exportConditions: ['development'],
  },
  plugins: [
    esbuildPlugin({
      ts: true,
      tsconfig: fileURLToPath(new URL('tsconfig.json', import.meta.url)),
    }),
  ],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  testFramework: {
    config: {
      ui: 'tdd',
      timeout: 500_000,
    },
  },
  coverageConfig: {
    include: ['src/**/*.ts'],
  },
};

export default config;
