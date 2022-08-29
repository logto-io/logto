import { merge, Config } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  transform: {
    '\\.(svg)$': 'jest-transformer-svg',
  },
});

export default config;
