import type { Config } from '@jest/types';
import deepmerge from 'deepmerge';

const baseConfig: Config.InitialOptions = Object.freeze({
  preset: 'ts-jest',
  transform: {
    // Enable JS/JSX transformation
    '\\.(t|j)sx?$': 'ts-jest',
    '\\.(svg)$': 'jest-transform-stub',
  },
  transformIgnorePatterns: [
    '[/\\\\]node_modules[/\\\\]((?!ky[/\\\\]).)+\\.(js|jsx|mjs|cjs|ts|tsx)$',
  ],
  moduleNameMapper: {
    // Map path alias in `tsconfig.json`
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock CSS Modules
    '\\.module\\.(css|sass|scss)$': 'identity-obj-proxy',
    // Explicitly point jose to cjs version
    '^jose/(.*)$': '<rootDir>/node_modules/jose/dist/node/cjs/$1',
  },
  coveragePathIgnorePatterns: ['/node_modules/', '/lib/', '/build/', '/src/__mocks__/'],
  coverageReporters: ['text-summary', 'lcov'],
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.test.json',
    },
  },
});

export default baseConfig;

export const merge = (
  config: Config.InitialOptions,
  mergeOptions?: deepmerge.Options
): Config.InitialOptions => deepmerge(baseConfig, config, mergeOptions);

export type { Config } from '@jest/types';

process.env.TZ = 'UTC';
