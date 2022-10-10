import { merge, Config } from '@silverhand/jest-config';

const config: Config.InitialOptions = merge({
  testPathIgnorePatterns: ['/core/connectors/'],
  setupFilesAfterEnv: ['jest-matcher-specific-error', './jest.setup.ts'],
});

export default config;
