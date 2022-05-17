import { merge, Config } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  testEnvironment: 'node',
});

export default config;
