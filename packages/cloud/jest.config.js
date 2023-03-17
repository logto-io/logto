import baseConfig from '@silverhand/jest-config';

/** @type {import('jest').Config} */
const config = {
  ...baseConfig,
  coveragePathIgnorePatterns: ['/node_modules/', '/test-utils/'],
  collectCoverageFrom: ['**/*.js'],
  roots: ['./build'],
  setupFilesAfterEnv: ['./jest.setup.js'],
};
export default config;
