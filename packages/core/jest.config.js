const config = {
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/', '/build/', '/src/__mocks__/'],
  coverageReporters: ['text-summary', 'lcov'],
  setupFilesAfterEnv: ['jest-matcher-specific-error', './jest.setup.js'],
  roots: ['./build'],
  moduleNameMapper: {
    '^#src/(.*)\\.js(x)?$': '<rootDir>/build/$1',
    '^(chalk|inquirer)$': '<rootDir>/../shared/lib/utils/module-proxy.js',
  },
};

export default config;
