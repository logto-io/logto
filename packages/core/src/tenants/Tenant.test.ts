import { createMockUtils, pickDefault } from '@logto/shared/esm';

import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { emptyMiddleware } from '#src/utils/test-utils.js';

const { jest } = import.meta;
const { mockEsm, mockEsmDefault } = createMockUtils(jest);

const middlewareList = [
  'error-handler',
  'i18next',
  'audit-log',
  'oidc-error-handler',
  'slonik-error-handler',
  'spa-proxy',
].map((name) => {
  const mock = jest.fn(() => emptyMiddleware);
  mockEsm(`#src/middleware/koa-${name}.js`, () => ({
    default: mock,
    ...(name === 'audit-log' && { LogEntry: jest.fn() }),
  }));

  return mock;
});

// eslint-disable-next-line unicorn/consistent-function-scoping
mockEsmDefault('#src/oidc/init.js', () => () => createMockProvider());

const Tenant = await pickDefault(import('./Tenant.js'));

describe('Tenant', () => {
  it('should call middleware factories', () => {
    const _ = new Tenant('foo');

    for (const middleware of middlewareList) {
      expect(middleware).toBeCalled();
    }
  });
});
