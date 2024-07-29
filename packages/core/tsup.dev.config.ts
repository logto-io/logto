import { defineConfig } from 'tsup';

import { config as baseConfig } from './tsup.config.js';

export default defineConfig({
  ...baseConfig,
  watch: ['src/**/*.ts', '.env', '../../.env', '../connectors/*/lib/'],
  onSuccess: baseConfig.onSuccess + ' && node ./build/index.js',
});
