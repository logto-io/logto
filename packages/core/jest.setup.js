/**
 * Setup environment variables for unit test
 */

import { createMockQueryResult, createMockPool } from 'slonik';

const { jest } = import.meta;

jest.unstable_mockModule('#src/env-set/index.js', () => ({
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

// eslint-disable-next-line unicorn/consistent-function-scoping
jest.unstable_mockModule('koa-logger', () => ({ default: () => (_, next) => next() }));

/**
 * Mocking `import.meta.url` and `got` here since they inevitably needs native ESM, but jest is sticking with CJS.
 * Will figure out a way to run tests in native ESM mode.
 */

// jest.mock('#src/connectors/meta-url.js', () => ({
//   metaUrl: 'file:///',
// }));

// jest.mock('../cli/lib/meta-url.js', () => ({
//   metaUrl: 'file:///',
// }));

// jest.mock('../cli/lib/commands/database/alteration/meta-url.js', () => ({
//   metaUrl: 'file:///',
// }));

// Jest.mock('got', () => ({
//   got: {},
// }));
