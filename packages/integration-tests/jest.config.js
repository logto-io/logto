/** @type {import('jest').Config} */
const config = {
  transform: {},
  testPathIgnorePatterns: ['/node_modules/'],
  coverageProvider: 'v8',
  setupFilesAfterEnv: ['./jest.setup.js', './jest.setup.api.js'],
  roots: ['./lib'],
  moduleNameMapper: {
    '^#src/(.*)\\.js(x)?$': '<rootDir>/lib/$1',
  },
};

export default config;
