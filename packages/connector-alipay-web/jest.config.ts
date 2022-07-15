import { Config, merge } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  testEnvironment: 'node',
  setupFilesAfterEnv: ['jest-matcher-specific-error'],
});

export default config;
