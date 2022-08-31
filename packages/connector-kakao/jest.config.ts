import { Config, merge } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  setupFilesAfterEnv: ['jest-matcher-specific-error'],
});

export default config;
