import { merge, Config } from '@logto/jest-config';

const config: Config.InitialOptions = merge({
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-matcher-specific-error', './jest.setup.ts'],
  globalSetup: './jest.global-setup.ts',
});

export default config;
