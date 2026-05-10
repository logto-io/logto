import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  collectCoverageFrom: ['**/*.{js,jsx,ts,tsx}'],
  coveragePathIgnorePatterns: ['/node_modules/', '/src/__mocks__/', '/src/include.d/'],
  coverageReporters: ['text-summary', 'lcov'],
  transform: {
    '^.+\\.(t|j)sx?$': '<rootDir>/jest.transform.cjs',
    '\\.(svg)$': 'jest-transformer-svg',
    '\\.(png)$': 'jest-transform-stub',
  },
  moduleNameMapper: {
    // Ensure CSS modules are stubbed before applying path aliases.
    '\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@ac/([^?]*)(\\?.*)?$': '<rootDir>/src/$1',
    '^@experience/([^?]*)(\\?.*)?$': '<rootDir>/../experience/src/$1',
    '^@/([^?]*)(\\?.*)?$': '<rootDir>/src/$1',
    '^@logto/shared/universal$': '<rootDir>/../shared/lib/universal.js',
    '^@logto/shared/(.*)$': '<rootDir>/../shared/lib/$1',
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(.*(nanoid|jose|ky|@logto|@silverhand))/)'],
};

export default config;
