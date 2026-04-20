import { GlobalValues } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';
import { noop } from '@silverhand/essentials';
import type Koa from 'koa';

import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    get values() {
      return new GlobalValues();
    },
  },
  AdminApps: { Console: 'console', Welcome: 'welcome' },
  UserApps: { AccountCenter: 'account-center' },
  getTenantEndpoint: () => new URL('https://tenant.example.com'),
}));

const { default: koaSecurityHeaders } = await import('./koa-security-headers.js');

const koaNoop = noop as unknown as Koa.Next;

const getCsp = (ctx: Koa.Context): string => {
  const value = ctx.res.getHeader('Content-Security-Policy');
  return typeof value === 'string' ? value : '';
};

describe('koaSecurityHeaders() middleware — experience CSP', () => {
  it('includes the hardcoded custom tenant allowlist (e.g. LaunchDarkly) in connect-src', async () => {
    const run = koaSecurityHeaders([], 'default');
    // Any path that isn't an admin app / user app / mounted app falls through
    // to the experience CSP settings.
    const ctx = createMockContext({ method: 'GET', url: '/sign-in' });

    await run(ctx, koaNoop);

    const csp = getCsp(ctx);
    const connectSource = csp
      .split(';')
      .map((directive) => directive.trim())
      .find((directive) => directive.startsWith('connect-src '));

    expect(connectSource).toBeDefined();
    expect(connectSource).toContain('https://*.launchdarkly.com');
  });

  it('does not leak the custom allowlist into the admin console CSP', async () => {
    const run = koaSecurityHeaders([], 'default');
    const ctx = createMockContext({ method: 'GET', url: '/console' });

    await run(ctx, koaNoop);

    expect(getCsp(ctx)).not.toContain('launchdarkly');
  });
});
