/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts', 'jest-matcher-specific-error'],
  globalSetup: './jest.global-setup.ts',
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^jose/(.*)$': '<rootDir>/node_modules/jose/dist/node/cjs/$1',
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/build/', '/src/__mocks__/'],
  coverageReporters: ['text-summary', 'lcov'],
};
