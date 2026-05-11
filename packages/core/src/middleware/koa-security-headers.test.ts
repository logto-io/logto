import { GlobalValues } from '@logto/shared';
import { createMockUtils } from '@logto/shared/esm';
import { noop } from '@silverhand/essentials';
import type Koa from 'koa';

import type Queries from '#src/tenants/Queries.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

const { jest } = import.meta;
const { mockEsmWithActual } = createMockUtils(jest);

const getIsDevFeaturesEnabled = jest.fn(() => false);

await mockEsmWithActual('#src/env-set/index.js', () => ({
  EnvSet: {
    get values() {
      return { ...new GlobalValues(), isDevFeaturesEnabled: getIsDevFeaturesEnabled() };
    },
  },
  AdminApps: { Console: 'console', Welcome: 'welcome' },
  UserApps: { AccountCenter: 'account' },
  getTenantEndpoint: () => new URL('https://tenant.example.com'),
}));

const { default: koaSecurityHeaders, koaExperienceSecurityHeaders } = await import(
  './koa-security-headers.js'
);

const koaNoop = noop as unknown as Koa.Next;
const customScriptSource = 'https://scripts.example.com';
const customConnectSource = 'https://api.example.com';
const customUiAssets = Object.freeze({ id: 'custom_ui_assets_id', createdAt: 1 });

type CustomUiSettings = {
  readonly customUiAssets?: { readonly id: string; readonly createdAt: number };
  readonly customUiCsp?: Record<string, string[]>;
};

const createQueries = ({ customUiAssets, customUiCsp = {} }: CustomUiSettings = {}) =>
  ({
    signInExperiences: {
      findDefaultSignInExperience: jest.fn(async () => ({
        customUiAssets: customUiAssets ?? null,
        customUiCsp,
      })),
    },
  }) as unknown as Queries;

const getCsp = (ctx: Koa.Context): string => {
  const value = ctx.res.getHeader('Content-Security-Policy');
  return typeof value === 'string' ? value : '';
};

const getCspDirective = (ctx: Koa.Context, directiveName: string): string | undefined =>
  getCsp(ctx)
    .split(';')
    .map((directive) => directive.trim())
    .find((directive) => directive.startsWith(`${directiveName} `));

describe('koaSecurityHeaders() middleware — experience CSP', () => {
  beforeEach(() => {
    getIsDevFeaturesEnabled.mockReturnValue(false);
  });

  it('includes the hardcoded custom tenant allowlist (e.g. LaunchDarkly) in connect-src', async () => {
    const run = koaSecurityHeaders([], 'default');
    // Any path that isn't an admin app / user app / mounted app falls through
    // to the experience CSP settings.
    const ctx = createMockContext({ method: 'GET', url: '/sign-in' });

    await run(ctx, koaNoop);

    const connectSource = getCspDirective(ctx, 'connect-src');

    expect(connectSource).toBeDefined();
    expect(connectSource).toContain('https://*.launchdarkly.com');
  });

  it('skips the hardcoded LaunchDarkly allowlist when dev features are enabled', async () => {
    getIsDevFeaturesEnabled.mockReturnValue(true);
    const run = koaSecurityHeaders([], 'default');
    const ctx = createMockContext({ method: 'GET', url: '/sign-in' });

    await run(ctx, koaNoop);

    expect(getCspDirective(ctx, 'connect-src')).not.toContain('https://*.launchdarkly.com');
  });

  it('adds Custom UI CSP sources to the matching experience directives', async () => {
    const run = koaExperienceSecurityHeaders(
      'default',
      createQueries({
        customUiAssets,
        customUiCsp: {
          scriptSrc: [customScriptSource],
          connectSrc: [customConnectSource],
        },
      })
    );
    const ctx = createMockContext({ method: 'GET', url: '/sign-in' });

    await run(ctx, koaNoop);

    const scriptSource = getCspDirective(ctx, 'script-src');
    const connectSource = getCspDirective(ctx, 'connect-src');

    expect(scriptSource).toContain("'self'");
    expect(scriptSource).toContain(customScriptSource);
    expect(scriptSource).not.toContain(customConnectSource);
    expect(connectSource).toContain('https://tenant.example.com');
    expect(connectSource).toContain(customConnectSource);
    expect(connectSource).not.toContain(customScriptSource);
  });

  it('does not add Custom UI CSP sources when Custom UI assets are not configured', async () => {
    const run = koaExperienceSecurityHeaders(
      'default',
      createQueries({
        customUiCsp: {
          scriptSrc: [customScriptSource],
          connectSrc: [customConnectSource],
        },
      })
    );
    const ctx = createMockContext({ method: 'GET', url: '/sign-in' });

    await run(ctx, koaNoop);

    const scriptSource = getCspDirective(ctx, 'script-src');
    const connectSource = getCspDirective(ctx, 'connect-src');

    expect(scriptSource).toContain("'self'");
    expect(scriptSource).not.toContain(customScriptSource);
    expect(connectSource).toContain('https://tenant.example.com');
    expect(connectSource).not.toContain(customConnectSource);
  });

  it('does not leak Custom UI CSP sources outside hosted experience routes', async () => {
    const run = koaSecurityHeaders(['api', 'oidc', '.well-known', 'demo-app'], 'default');
    const urlsWithDedicatedCsp = ['/console', '/account', '/account/callback/social/google'];
    const mountedAppUrls = ['/oidc/auth', '/api/.well-known', '/demo-app'];

    const cspHeaders = await Promise.all(
      urlsWithDedicatedCsp.map(async (url) => {
        const ctx = createMockContext({ method: 'GET', url });

        await run(ctx, koaNoop);

        return getCsp(ctx);
      })
    );

    for (const cspHeader of cspHeaders) {
      expect(cspHeader).not.toContain(customScriptSource);
      expect(cspHeader).not.toContain(customConnectSource);
    }

    const mountedAppCspHeaders = await Promise.all(
      mountedAppUrls.map(async (url) => {
        const ctx = createMockContext({ method: 'GET', url });

        await run(ctx, koaNoop);

        return getCsp(ctx);
      })
    );

    expect(mountedAppCspHeaders).toEqual(['', '', '']);
  });

  it('does not override mounted app CSP when the experience middleware is reached later', async () => {
    const queries = createQueries({
      customUiAssets,
      customUiCsp: {
        scriptSrc: [customScriptSource],
      },
    });
    const runSecurityHeaders = koaSecurityHeaders(['console'], 'default');
    const runExperienceSecurityHeaders = koaExperienceSecurityHeaders('default', queries, [
      'console',
    ]);
    const ctx = createMockContext({ method: 'GET', url: '/console/organizations' });

    await runSecurityHeaders(ctx, async () => runExperienceSecurityHeaders(ctx, koaNoop));

    const scriptSource = getCspDirective(ctx, 'script-src');

    expect(scriptSource).toContain('https://cdn.jsdelivr.net/');
    expect(scriptSource).not.toContain(customScriptSource);
    expect(queries.signInExperiences.findDefaultSignInExperience).not.toHaveBeenCalled();
  });
});
