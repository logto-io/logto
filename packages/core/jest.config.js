/** @type {import('jest').Config} */
const config = {
  transform: {},
  collectCoverageFrom: ['**/*.{js,ts}'],
  coveragePathIgnorePatterns: ['/node_modules/', '/src/__mocks__/'],
  coverageReporters: ['text-summary', 'lcov'],
  coverageProvider: 'v8',
  testPathIgnorePatterns: ['/node_modules/', '/build/routes/session/'], // `routes/session` is freezed
  setupFilesAfterEnv: ['jest-matcher-specific-error', './jest.setup.js'],
  roots: ['./build'],
  moduleNameMapper: {
    '^#src/(.*)\\.js(x)?$': '<rootDir>/build/$1',
    '^(chalk|inquirer)$': '<rootDir>/../shared/lib/esm/module-proxy.js',
    // Map the connector-kit to the installed version rather than finding it from the `shared` package (which is the default behavior of `mockEsm` in the `shared` package)
    '^@logto/connector-kit$': '<rootDir>/node_modules/@logto/connector-kit/lib/index.js',
  },
};

export default config;
