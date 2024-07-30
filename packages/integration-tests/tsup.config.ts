import { defineConfig, type Options } from 'tsup';

import { defaultConfig } from '../../tsup.shared.config.js';

export const config = Object.freeze({
  ...defaultConfig,
  entry: ['src/**/*.ts'],
} satisfies Options);

export default defineConfig(config);
