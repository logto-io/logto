import type { Config } from '@silverhand/jest-config';
import { merge } from '@silverhand/jest-config';

const config: Config.InitialOptions = {
  ...merge({
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  }),
  // Will update common config soon
  transformIgnorePatterns: [
    'node_modules/(?!(.*(nanoid|jose|ky|@logto|got|chalk|decamelize|find-up|nanoid|ora|p-retry))/)',
  ],
};

export default config;
