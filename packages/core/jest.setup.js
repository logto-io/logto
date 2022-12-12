/**
 * Setup environment variables for unit test
 */

import { mockEsm } from '@logto/shared/esm';
import { createMockQueryResult, createMockPool } from 'slonik';

const { jest } = import.meta;

mockEsm('#src/env-set/index.js', () => ({
  MountedApps: {
    Api: 'api',
    Oidc: 'oidc',
    Console: 'console',
    DemoApp: 'demo-app',
    Welcome: 'welcome',
  },
  default: {
    get values() {
      return {
        endpoint: 'https://logto.test',
        adminConsoleUrl: 'https://logto.test/console',
      };
    },
    get oidc() {
      return {
        issuer: 'https://logto.test/oidc',
      };
    },
    get pool() {
      return createMockPool({ query: async () => createMockQueryResult([]) });
    },
    load: jest.fn(),
  },
}));

// Logger is not considered in all test cases
// eslint-disable-next-line unicorn/consistent-function-scoping
mockEsm('koa-logger', () => ({ default: () => (_, next) => next() }));
