import { merge, Config } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  setupFilesAfterEnv: ['jest-matcher-specific-error', './jest.setup.ts'],
  globalSetup: './jest.global-setup.ts',
});

export default config;
