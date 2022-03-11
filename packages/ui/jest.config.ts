import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  transform: {
    // Enable JS/JSX transformation
    '\\.(ts|js)x?$': 'ts-jest',
    '\\.(svg)$': 'jest-transform-stub',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\]((?!ky[/\\\\]).)+\\.(js|jsx|mjs|cjs|ts|tsx)$',
  ],
  moduleNameMapper: {
    // Map path alias in `tsconfig.json`
    '@/(.*)': '<rootDir>/src/$1',
    // Mock CSS Modules
    '\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
  },
  setupFilesAfterEnv: ['<rootDir>/src/jest.setup.ts'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  coverageReporters: ['text-summary', 'lcov'],
  globals: {
    'ts-jest': {
      tsconfig: './tsconfig.test.json',
    },
  },
};

export default config;
