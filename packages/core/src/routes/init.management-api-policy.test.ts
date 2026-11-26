import { ManagementApiScope, PredefinedScope } from '@logto/schemas';
import Koa from 'koa';
import type Router from 'koa-router';
import request from 'supertest';

import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import { isGuardMiddleware } from '#src/middleware/koa-guard.js';
import koaI18next from '#src/middleware/koa-i18next.js';
import {
  extractPolicyScopes,
  isKnownManagementApiScope,
  isManagementApiPermissionMiddleware,
} from '#src/middleware/koa-management-api-permission.js';
import { isPaginationMiddleware } from '#src/middleware/koa-pagination.js';
import { isQuotaGuardMiddleware } from '#src/middleware/koa-quota-guard.js';
import { MockTenant } from '#src/test-utils/tenant.js';

const { jest } = import.meta;

const mockAuthScopes = new Set<string>(['read:users']);

const mockAuthMiddleware = async (ctx: { auth?: unknown }, next: () => Promise<void>) => {
  ctx.auth = { type: 'app', id: 'm2m-app', scopes: mockAuthScopes };
  return next();
};

const actualKoaAuth = await import('#src/middleware/koa-auth/index.js');

jest.unstable_mockModule('#src/middleware/koa-auth/index.js', () => ({
  ...actualKoaAuth,
  default: () => mockAuthMiddleware,
}));

const { createRouters } = await import('./init.js');

const getManagementRouter = (tenant: MockTenant) => {
  const managementRouter = createRouters(tenant)[2];

  if (!managementRouter) {
    throw new Error('Expected managementRouter from createRouters()');
  }

  return managementRouter;
};

/**
 * Non-GET endpoints explicitly allowed to accept a `read:*` scope (read-only queries over POST).
 */
const readScopeNonGetAllowlist = new Set<string>(['POST /sign-in-exp/default/check-password']);

/**
 * Allowed scope resource suffixes per route path prefix (first path segment).
 * Prevents copy-paste mistakes such as attaching `read:users` to an `/organizations` route.
 */
const allowedDomainsByFirstSegment: Readonly<Record<string, readonly string[]>> = Object.freeze({
  users: ['users'],
  organizations: ['organizations'],
  'organization-invitations': ['organizations'],
  'organization-roles': ['organization_roles'],
  'organization-scopes': ['organization_scopes'],
  applications: ['applications'],
  'saml-applications': ['applications'],
  cimd: ['applications'],
  roles: ['roles'],
  resources: ['api_resources'],
  'sign-in-exp': ['sign_in_experience'],
  'account-center': ['sign_in_experience'],
  'custom-phrases': ['sign_in_experience'],
  'custom-profile-fields': ['sign_in_experience'],
  hooks: ['hooks'],
  connectors: ['connectors'],
  'connector-factories': ['connectors'],
  'sso-connectors': ['connectors'],
  'sso-connector-factories': ['connectors'],
  domains: ['tenant_settings'],
  'email-templates': ['tenant_settings'],
  configs: ['tenant_settings'],
  'captcha-provider': ['tenant_settings'],
  'sentinel-activities': ['tenant_settings'],
  'user-assets': ['tenant_settings'],
  secrets: ['tenant_settings'],
  system: ['tenant_settings'],
  logs: ['logs'],
  dashboard: ['dashboard'],
  'one-time-tokens': ['one_time_tokens'],
  'verification-codes': ['verification_codes'],
  'subject-tokens': ['subject_tokens'],
});

/**
 * Sensitive write/delete/delegation path patterns that MUST remain `all`-only to
 * prevent privilege escalation or unauthorized secret/IdP mutation.
 */
const allOnlyWritePathPatterns: readonly RegExp[] = [
  /^\/roles(?:\/|$)/,
  /^\/users\/:userId\/roles(?:\/|$)/,
  /^\/users\/:userId\/personal-access-tokens(?:\/|$)/,
  /^\/users\/:userId\/mfa-verifications(?:\/|$)/,
  /^\/users\/:userId\/identities(?:\/|$)/,
  /^\/users\/:userId\/logto-configs(?:\/|$)/,
  /^\/applications(?:\/|$)/,
  /^\/saml-applications(?:\/|$)/,
  /^\/connectors(?:\/|$)/,
  /^\/sso-connectors(?:\/|$)/,
  /^\/configs\/(?:jwt-customizer|oidc)(?:\/|$)/,
  /^\/organizations\/:id\/applications(?:\/|$)/,
  /^\/organizations\/:id\/jit(?:\/|$)/,
  /^\/organization-roles(?:\/|$)/,
  /^\/organization-scopes(?:\/|$)/,
];

const assertPermissionMiddlewareOrder = (layer: Router.Layer, permissionIndex: number) => {
  const guardIndex = layer.stack.findIndex((middleware) => isGuardMiddleware(middleware));
  const quotaIndex = layer.stack.findIndex((middleware) => isQuotaGuardMiddleware(middleware));
  const paginationIndex = layer.stack.findIndex((middleware) => isPaginationMiddleware(middleware));

  if (guardIndex >= 0) {
    expect(permissionIndex).toBeLessThan(guardIndex);
  }
  if (quotaIndex >= 0) {
    expect(permissionIndex).toBeLessThan(quotaIndex);
  }
  if (paginationIndex >= 0) {
    expect(permissionIndex).toBeLessThan(paginationIndex);
  }
};

const assertMethodAndDomainInvariants = (
  layer: Router.Layer,
  methods: readonly string[],
  scopeName: string
) => {
  const [action, domain] = scopeName.split(':');
  const [firstSegment = ''] = layer.path.split('/').slice(1);
  const allowedDomains = allowedDomainsByFirstSegment[firstSegment];

  for (const method of methods) {
    const operationKey = `${method} ${layer.path}`;

    if (method === 'GET') {
      expect(action).toBe('read');
    } else if (!readScopeNonGetAllowlist.has(operationKey)) {
      expect(action).not.toBe('read');
    }

    if (method !== 'GET') {
      for (const pattern of allOnlyWritePathPatterns) {
        expect(pattern.test(layer.path)).toBe(false);
      }
    }
  }

  expect(allowedDomains).toBeDefined();
  expect(allowedDomains).toContain(domain);
};

describe('Management API route-stack policy validation', () => {
  it('validates middleware ordering, uniqueness, catalog consistency, and domain/method invariants', () => {
    const managementRouter = getManagementRouter(new MockTenant());
    const routeLayers = managementRouter.stack.filter((layer) => layer.methods.length > 0);
    const referencedScopes = new Set<string>();

    expect(routeLayers.length).toBeGreaterThan(0);

    for (const layer of routeLayers) {
      const methods = layer.methods.filter((method) => method !== 'HEAD');
      const permissionIndices = layer.stack
        .map((middleware, index) => (isManagementApiPermissionMiddleware(middleware) ? index : -1))
        .filter((index) => index >= 0);

      // 1. No duplicate permission middleware per route
      expect(permissionIndices.length).toBeLessThanOrEqual(1);

      const permissionIndex = permissionIndices[0];
      if (permissionIndex === undefined) {
        continue;
      }

      const permissionMiddleware = layer.stack[permissionIndex];
      if (!permissionMiddleware || !isManagementApiPermissionMiddleware(permissionMiddleware)) {
        throw new Error(`Expected permission middleware at index ${permissionIndex}`);
      }

      // 2. Permission middleware must sit before koaPagination, koaGuard, and koaQuotaGuard
      assertPermissionMiddlewareOrder(layer, permissionIndex);

      for (const scope of extractPolicyScopes(permissionMiddleware.policy)) {
        const scopeName = String(scope);

        // 3. Every referenced scope must exist in the built-in catalog
        expect(isKnownManagementApiScope(scopeName)).toBe(true);
        referencedScopes.add(scopeName);

        if (scopeName !== PredefinedScope.All) {
          // 4-6. HTTP method <-> action, sensitive all-only guard, and path prefix <-> domain
          assertMethodAndDomainInvariants(layer, methods, scopeName);
        }
      }
    }

    // 7. Zero orphan scopes in ManagementApiScope catalog
    for (const catalogScope of Object.values<string>(ManagementApiScope)) {
      expect(referencedScopes.has(catalogScope)).toBe(true);
    }
  });

  it('rejects non-all tokens with 403 on undeclared routes before router.use() DB lookups', async () => {
    const validateThirdPartyApplicationById = jest.fn();
    const validateProtectedApplicationById = jest.fn();
    const orgAppsExists = jest.fn();
    const orgUsersExists = jest.fn();

    const tenant = new MockTenant(undefined, undefined, undefined, {
      applications: {
        validateThirdPartyApplicationById,
        validateProtectedApplicationById,
      },
    });
    /* eslint-disable @silverhand/fp/no-mutation -- spy on membership lookups */
    tenant.queries.organizations.relations.apps.exists = orgAppsExists;
    tenant.queries.organizations.relations.users.exists = orgUsersExists;
    /* eslint-enable @silverhand/fp/no-mutation */

    const managementRouter = getManagementRouter(tenant);
    const app = new Koa();
    app.use(koaI18next());
    app.use(koaErrorHandler());
    app.use(managementRouter.routes()).use(managementRouter.allowedMethods());

    // All 4 router.use() validator sites must return 403 without triggering their DB lookups
    const responses = await Promise.all([
      request(app.callback()).get('/applications/app-1/users/user-1/consent-organizations'),
      request(app.callback()).get('/applications/app-1/protected-app-metadata/custom-domains'),
      request(app.callback()).get('/organizations/org-1/applications/app-1/roles'),
      request(app.callback()).get('/organizations/org-1/users/user-1/roles'),
    ]);

    for (const response of responses) {
      expect(response.status).toBe(403);
    }

    expect(validateThirdPartyApplicationById).not.toHaveBeenCalled();
    expect(validateProtectedApplicationById).not.toHaveBeenCalled();
    expect(orgAppsExists).not.toHaveBeenCalled();
    expect(orgUsersExists).not.toHaveBeenCalled();

    // OPTIONS and unknown paths fall through instead of 403
    const optionsResponse = await request(app.callback()).options('/users');
    expect(optionsResponse.status).toBe(200);

    const notFoundResponse = await request(app.callback()).get('/definitely-not-a-route');
    expect(notFoundResponse.status).toBe(404);
  });
});
