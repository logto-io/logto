import { merge, Config } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
});

export default config;
