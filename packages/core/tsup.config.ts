import { defineConfig, type Options } from 'tsup';

import { defaultConfig } from '../../tsup.shared.config.js';

export const config = Object.freeze({
  ...defaultConfig,
  entry: ['src/index.ts', 'src/workers/tasks/**/*.ts'],
  outDir: 'build',
  onSuccess: 'pnpm run copy:apidocs',
} satisfies Options);

export default defineConfig(config);
