/** @type {import('jest').Config} */
const config = {
  transform: {},
  testPathIgnorePatterns: ['/node_modules/'],
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['./jest.setup.js', './jest.setup.api.js'],
  roots: ['./lib'],
  moduleNameMapper: {
    '^#src/(.*)\\.js(x)?$': '<rootDir>/lib/$1',
    '^(chalk|inquirer)$': '<rootDir>/../shared/lib/esm/module-proxy.js',
  },
};

export default config;
