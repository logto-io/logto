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
   * Workers accumulate module registry and v8 coverage state across test files. Recycle a worker
   * once it goes idle above this limit, which costs far less than keeping the heap: when every
   * worker holds 2 GB or more, a machine can run out of RAM, and a GC then has to page the worker's
   * compressed heap back in, which is what pushes ordinary tests past their timeouts.
   *
   * The limit is checked between test files only, so a worker can still grow past it within a file.
   * The largest single-file growth (~1 GB observed) stays well below the 4 GB heap cap.
   */
  workerIdleMemoryLimit: '1GB',
  moduleNameMapper: {
    '^#src/(.*)\\.js(x)?$': '<rootDir>/build/$1',
    '^(chalk|inquirer)$': '<rootDir>/../shared/lib/esm/module-proxy.js',
    // Map the connector-kit to the installed version rather than finding it from the `shared` package (which is the default behavior of `mockEsm` in the `shared` package)
    '^@logto/connector-kit$': '<rootDir>/node_modules/@logto/connector-kit/lib/index.js',
  },
};

export default config;
