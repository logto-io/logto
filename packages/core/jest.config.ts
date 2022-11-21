import type { Config } from '@silverhand/jest-config';
import { merge } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  testPathIgnorePatterns: ['/core/connectors/'],
  setupFilesAfterEnv: ['jest-matcher-specific-error', './jest.setup.ts'],
  moduleNameMapper: {
    '^#src/(.*)\\.js(x)?$': '<rootDir>/src/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
});

export default config;
