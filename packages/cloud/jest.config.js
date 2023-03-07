import baseConfig from '@silverhand/jest-config';

/** @type {import('jest').Config} */
const config = {
  ...baseConfig,
  coveragePathIgnorePatterns: ['/node_modules/', '/test-utils/'],
  collectCoverageFrom: ['**/*.js'],
  roots: ['./build'],
};
export default config;
