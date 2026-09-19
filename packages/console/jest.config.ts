import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
  roots: ['<rootDir>/src'],
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  transform: {
    '^.+\\.(t|j)sx?$': [
      '@swc/jest',
      {
        sourceMaps: true,
        jsc: {
          transform: {
            react: {
              runtime: 'automatic',
            },
          },
        },
      },
    ],
    '\\.(svg)$': 'jest-transformer-svg',
    '\\.(png)$': 'jest-transform-stub',
  },
  moduleNameMapper: {
    '\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    '^@/(.*)\\.svg\\?react$': '<rootDir>/src/$1.svg',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@logto/shared/(.*)$': '<rootDir>/../shared/lib/$1',
  },
  transformIgnorePatterns: ['node_modules/(?!(.*(nanoid|jose|ky|@logto|@silverhand))/)'],
};

export default config;
