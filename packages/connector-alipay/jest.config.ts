import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^jose/(.*)$': '<rootDir>/node_modules/jose/dist/node/cjs/$1',
  },
  setupFilesAfterEnv: ['jest-matcher-specific-error'],
  coveragePathIgnorePatterns: ['/node_modules/', '/build/'],
  coverageReporters: ['text-summary', 'lcov'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
};

export default config;
