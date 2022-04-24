import { merge, Config } from '@logto/jest-config';

const config: Config.InitialOptions = merge({
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
});

export default config;
