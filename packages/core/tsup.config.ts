import { defineConfig, type Options } from 'tsup';

import { defaultConfig } from '../../tsup.shared.config.js';

export const config = Object.freeze({
  ...defaultConfig,
  outDir: 'build',
  onSuccess: 'pnpm run copy:apidocs',
} satisfies Options);

export default defineConfig(config);
