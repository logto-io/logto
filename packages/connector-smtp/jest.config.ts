import { Config, merge } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  testEnvironment: 'node',
});

export default config;
