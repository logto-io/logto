import { ManagementApiScope } from '@logto/schemas';
import Koa from 'koa';
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

const mockAuthScopes = new Set<string>([ManagementApiScope.ReadUsers]);

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

describe('Management API route-stack policy validation', () => {
  it('validates middleware ordering, uniqueness, and catalog membership across all mounted routes', () => {
    const managementRouter = getManagementRouter(new MockTenant());
    const routeLayers = managementRouter.stack.filter((layer) => layer.methods.length > 0);

    expect(routeLayers.length).toBeGreaterThan(0);

    for (const layer of routeLayers) {
      const permissionIndices = layer.stack
        .map((middleware, index) => (isManagementApiPermissionMiddleware(middleware) ? index : -1))
        .filter((index) => index >= 0);

      // No duplicate permission middleware per route
      expect(permissionIndices.length).toBeLessThanOrEqual(1);

      const permissionIndex = permissionIndices[0];
      if (permissionIndex === undefined) {
        continue;
      }

      const permissionMiddleware = layer.stack[permissionIndex];
      if (!permissionMiddleware || !isManagementApiPermissionMiddleware(permissionMiddleware)) {
        throw new Error(`Expected permission middleware at index ${permissionIndex}`);
      }

      // All referenced scopes must exist in the built-in catalog
      for (const scope of extractPolicyScopes(permissionMiddleware.policy)) {
        expect(isKnownManagementApiScope(scope)).toBe(true);
      }

      // Permission middleware must sit before koaPagination, koaGuard, and koaQuotaGuard
      const guardIndex = layer.stack.findIndex((middleware) => isGuardMiddleware(middleware));
      const quotaIndex = layer.stack.findIndex((middleware) => isQuotaGuardMiddleware(middleware));
      const paginationIndex = layer.stack.findIndex((middleware) =>
        isPaginationMiddleware(middleware)
      );

      if (guardIndex >= 0) {
        expect(permissionIndex).toBeLessThan(guardIndex);
      }
      if (quotaIndex >= 0) {
        expect(permissionIndex).toBeLessThan(quotaIndex);
      }
      if (paginationIndex >= 0) {
        expect(permissionIndex).toBeLessThan(paginationIndex);
      }
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
