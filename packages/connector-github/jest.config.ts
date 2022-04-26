import { Config, merge } from '@logto/jest-config';

const config: Config.InitialOptions = merge({
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-matcher-specific-error'],
});

export default config;
