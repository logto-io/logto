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
  /**
   * Workers accumulate module registry and v8 coverage state across test files, and the whole run
   * peaks within a few percent of the 4 GB heap cap. Recycle a worker once it goes idle above this
   * limit. The limit is checked between test files only, so it has to leave room for the largest
   * single-file growth (~1 GB observed) on top of it.
   */
  workerIdleMemoryLimit: '2.5GB',
  moduleNameMapper: {
    '^#src/(.*)\\.js(x)?$': '<rootDir>/build/$1',
    '^(chalk|inquirer)$': '<rootDir>/../shared/lib/esm/module-proxy.js',
    // Map the connector-kit to the installed version rather than finding it from the `shared` package (which is the default behavior of `mockEsm` in the `shared` package)
    '^@logto/connector-kit$': '<rootDir>/node_modules/@logto/connector-kit/lib/index.js',
  },
};

export default config;
