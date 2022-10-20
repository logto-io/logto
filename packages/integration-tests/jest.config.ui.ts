import { merge, Config } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  preset: 'jest-puppeteer',
});

export default config;
