import type { Config } from '@silverhand/jest-config';
import { merge } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  preset: 'ts-jest/presets/js-with-ts-esm',
  testPathIgnorePatterns: ['/core/connectors/'],
  setupFilesAfterEnv: ['jest-matcher-specific-error', './jest.setup.ts'],
  moduleNameMapper: {
    '^#src/(.*)\\.js(x)?$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  globals: {
    'ts-jest': {
      useESM: true,
    },
  },
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
});

export default config;
