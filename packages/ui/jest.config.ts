import type { Config } from '@silverhand/jest-config';
import { merge } from '@silverhand/jest-config';

const config: Config.InitialOptions = {
  ...merge({
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
    transform: {
      '\\.(svg)$': 'jest-transformer-svg',
      '\\.(png)$': 'jest-transform-stub',
    },
  }),
  // Will update common config soon
  transformIgnorePatterns: ['node_modules/(?!(.*(nanoid|jose|ky|@logto|@silverhand))/)'],
};

export default config;
