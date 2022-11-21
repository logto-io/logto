import type { Config } from '@silverhand/jest-config';
import { merge } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  // Preset: 'ts-jest/presets/default-esm',
  // TransformIgnorePatterns: ['schemas'],
  setupFilesAfterEnv: ['./jest.setup.ts'],
  roots: ['./src'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  globals: {
    'ts-jest': {
      useESM: true,
      diagnostics: {
        ignoreCodes: [1343],
      },
    },
  },
  // ExtensionsToTreatAsEsm: ['.ts', '.tsx'],
});

export default config;
