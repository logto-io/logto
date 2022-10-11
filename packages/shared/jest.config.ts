import { merge, Config } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  roots: ['./src'],
});

export default config;
