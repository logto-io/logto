import type { Config } from '@silverhand/jest-config';
import { merge } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
});

export default config;
