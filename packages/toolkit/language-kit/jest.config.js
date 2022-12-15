/** @type {import('jest').Config} */
const config = {
  coveragePathIgnorePatterns: ['/node_modules/', '/src/__mocks__/'],
  coverageReporters: ['text-summary', 'lcov'],
  roots: ['./lib'],
  moduleNameMapper: {
    '^(chalk|inquirer)$': '<rootDir>/../../shared/lib/esm/module-proxy.js',
  },
};

export default config;
