/** @type {import('jest').Config} */
const config = {
  transform: {},
  coveragePathIgnorePatterns: ['/node_modules/', '/src/__mocks__/'],
  coverageReporters: ['text-summary', 'lcov'],
  coverageProvider: 'v8',
  testPathIgnorePatterns: ['/node_modules/', '/build/routes/session/'], // `routes/session` is freezed
  setupFilesAfterEnv: ['jest-matcher-specific-error', './jest.setup.js'],
  roots: ['./build'],
  // See https://jestjs.io/docs/configuration#testregex-string--arraystring for default testRegex setup, should filter out files such as: **/test.js.
  testRegex: '(/__tests__/.*|(\\.|/).+\\.(test|spec))\\.[jt]sx?$',
  moduleNameMapper: {
    '^#src/(.*)\\.js(x)?$': '<rootDir>/build/$1',
    '^(chalk|inquirer)$': '<rootDir>/../shared/lib/esm/module-proxy.js',
  },
};

export default config;
