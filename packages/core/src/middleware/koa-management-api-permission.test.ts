import { ManagementApiScope, PredefinedScope } from '@logto/schemas';
import Koa from 'koa';
import Router from 'koa-router';
import request from 'supertest';
import { z } from 'zod';

import RequestError from '#src/errors/RequestError/index.js';
import koaErrorHandler from '#src/middleware/koa-error-handler.js';
import koaI18next from '#src/middleware/koa-i18next.js';

import { type WithAuthContext } from './koa-auth/index.js';
import koaGuard from './koa-guard.js';
import koaManagementApiPermission, {
  assertHasManagementApiPermission,
  assertHasScope,
  extractPolicyScopes,
  hasManagementApiPermission,
  isKnownManagementApiScope,
  isManagementApiPermissionMiddleware,
  normalizeManagementApiPermissionPolicy,
  registerManagementApiPolicyEnforcer,
} from './koa-management-api-permission.js';

const { jest } = import.meta;

const createAuth = (scopes: string[]): WithAuthContext['auth'] => ({
  type: 'app',
  id: 'app-id',
  scopes: new Set(scopes),
});

describe('koaManagementApiPermission helpers', () => {
  it('recognizes all built-in Management API scopes and `all`', () => {
    expect(isKnownManagementApiScope(PredefinedScope.All)).toBe(true);
    expect(isKnownManagementApiScope(ManagementApiScope.ReadUsers)).toBe(true);
    expect(isKnownManagementApiScope(ManagementApiScope.CreateSubjectTokens)).toBe(true);
    expect(isKnownManagementApiScope('unknown:scope')).toBe(false);
  });

  it('normalizes single scope, anyOf single scopes, and anyOf AND tuples', () => {
    expect(normalizeManagementApiPermissionPolicy(ManagementApiScope.ReadUsers)).toEqual([
      [ManagementApiScope.ReadUsers],
    ]);

    expect(
      normalizeManagementApiPermissionPolicy({
        anyOf: [
          ManagementApiScope.UpdateUsers,
          [ManagementApiScope.ReadUsers, ManagementApiScope.CreateUsers],
        ],
      })
    ).toEqual([
      [ManagementApiScope.UpdateUsers],
      [ManagementApiScope.ReadUsers, ManagementApiScope.CreateUsers],
    ]);

    expect(
      extractPolicyScopes({
        anyOf: [
          ManagementApiScope.UpdateUsers,
          [ManagementApiScope.ReadUsers, ManagementApiScope.CreateUsers],
        ],
      })
    ).toEqual([
      ManagementApiScope.UpdateUsers,
      ManagementApiScope.ReadUsers,
      ManagementApiScope.CreateUsers,
    ]);
  });

  it('evaluates single scope, `all`, and `anyOf` (OR + AND tuple) policies', () => {
    expect(
      hasManagementApiPermission(createAuth([PredefinedScope.All]), ManagementApiScope.ReadUsers)
    ).toBe(true);
    expect(
      hasManagementApiPermission(
        createAuth([ManagementApiScope.ReadUsers]),
        ManagementApiScope.ReadUsers
      )
    ).toBe(true);
    expect(
      hasManagementApiPermission(
        createAuth([ManagementApiScope.ReadHooks]),
        ManagementApiScope.ReadUsers
      )
    ).toBe(false);

    const anyOfPolicy = {
      anyOf: [
        ManagementApiScope.UpdateUsers,
        [ManagementApiScope.ReadUsers, ManagementApiScope.CreateUsers],
      ] as const,
    };

    expect(
      hasManagementApiPermission(createAuth([ManagementApiScope.UpdateUsers]), anyOfPolicy)
    ).toBe(true);
    expect(
      hasManagementApiPermission(
        createAuth([ManagementApiScope.ReadUsers, ManagementApiScope.CreateUsers]),
        anyOfPolicy
      )
    ).toBe(true);
    expect(
      hasManagementApiPermission(createAuth([ManagementApiScope.ReadUsers]), anyOfPolicy)
    ).toBe(false);
  });

  it('throws 403 auth.forbidden from assertHasManagementApiPermission and assertHasScope', () => {
    expect(() => {
      assertHasManagementApiPermission(createAuth([]), ManagementApiScope.ReadUsers);
    }).toThrow(new RequestError({ code: 'auth.forbidden', status: 403 }));

    expect(() => {
      assertHasScope(createAuth([ManagementApiScope.ReadUsers]), PredefinedScope.All);
    }).toThrow(new RequestError({ code: 'auth.forbidden', status: 403 }));

    expect(() => {
      assertHasScope(createAuth([PredefinedScope.All]), PredefinedScope.All);
    }).not.toThrow();

    expect(() => {
      assertHasScope(createAuth([ManagementApiScope.ReadUsers]), ManagementApiScope.ReadUsers);
    }).not.toThrow();
  });

  it('attaches immutable static policy metadata to middleware', () => {
    const middleware = koaManagementApiPermission({
      anyOf: [ManagementApiScope.ReadUsers],
    });

    expect(isManagementApiPermissionMiddleware(middleware)).toBe(true);
    expect(middleware.policy).toEqual({ anyOf: [ManagementApiScope.ReadUsers] });
    expect(Object.isFrozen(middleware.policy)).toBe(true);
  });
});

const buildApp = (scopes: string[]) => {
  const routerUseDatabaseLookup = jest.fn();
  const nestedRouterUseDatabaseLookup = jest.fn();
  const routeHandler = jest.fn();

  const router = new Router<unknown, WithAuthContext>();
  router.use(async (ctx, next) => {
    ctx.auth = createAuth(scopes);
    return next();
  });

  const finalize = registerManagementApiPolicyEnforcer(router);

  // Simulate a route file with a `router.use()` DB existence lookup preceding a scoped GET route
  router.use('/items/:id', async (_ctx, next) => {
    routerUseDatabaseLookup();
    return next();
  });

  router.get(
    '/items/:id',
    koaManagementApiPermission(ManagementApiScope.ReadApplications),
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      status: [200],
    }),
    async (ctx, next) => {
      routeHandler('get-item');
      ctx.body = { id: ctx.guard.params.id };
      return next();
    }
  );

  // Undeclared write route under the same `router.use()` prefix (defaults to `all`)
  router.post(
    '/items/:id',
    koaGuard({
      params: z.object({ id: z.string().min(1) }),
      status: [201],
    }),
    async (ctx, next) => {
      routeHandler('post-item');
      ctx.status = 201;
      return next();
    }
  );

  // Route with inline `assertHasScope` inside a `koaGuard` without `403` in `status`
  router.patch(
    '/sign-in-exp',
    koaManagementApiPermission(ManagementApiScope.UpdateSignInExperience),
    koaGuard({
      status: [200],
    }),
    async (ctx, next) => {
      assertHasScope(ctx.auth, PredefinedScope.All);
      ctx.body = { ok: true };
      return next();
    }
  );

  // Nested sub-router (like SchemaRouter / organizationRoutes) with its own `router.use()`
  const nested = new Router<unknown, WithAuthContext>({ prefix: '/organizations' });
  nested.use('/:id/roles', async (_ctx, next) => {
    nestedRouterUseDatabaseLookup();
    return next();
  });
  nested.get(
    '/:id/roles',
    koaManagementApiPermission(ManagementApiScope.ReadOrganizations),
    async (ctx, next) => {
      routeHandler('nested-get');
      ctx.body = [];
      return next();
    }
  );
  nested.delete('/:id/roles', async (ctx, next) => {
    routeHandler('nested-delete');
    ctx.status = 204;
    return next();
  });

  router.use(nested.routes());
  finalize();

  const app = new Koa();
  app.use(koaI18next());
  app.use(koaErrorHandler());
  app.use(router.routes()).use(router.allowedMethods());

  return {
    app,
    routerUseDbLookup: routerUseDatabaseLookup,
    nestedRouterUseDbLookup: nestedRouterUseDatabaseLookup,
    routeHandler,
  };
};

describe('registerManagementApiPolicyEnforcer', () => {
  it('rejects unauthorized scoped token with 403 BEFORE router.use() DB lookup on scoped GET', async () => {
    const { app, routerUseDbLookup, routeHandler } = buildApp([ManagementApiScope.ReadUsers]);

    const response = await request(app.callback()).get('/items/123');

    expect(response.status).toBe(403);
    expect(routerUseDbLookup).not.toHaveBeenCalled();
    expect(routeHandler).not.toHaveBeenCalled();
  });

  it('allows matching scoped token and runs router.use() DB lookup + handler', async () => {
    const { app, routerUseDbLookup, routeHandler } = buildApp([
      ManagementApiScope.ReadApplications,
    ]);

    const response = await request(app.callback()).get('/items/123');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: '123' });
    expect(routerUseDbLookup).toHaveBeenCalledTimes(1);
    expect(routeHandler).toHaveBeenCalledWith('get-item');
  });

  it('rejects non-all token with 403 BEFORE router.use() on undeclared default-all routes', async () => {
    const { app, routerUseDbLookup, routeHandler } = buildApp([
      ManagementApiScope.ReadApplications,
    ]);

    const response = await request(app.callback()).post('/items/123');

    expect(response.status).toBe(403);
    expect(routerUseDbLookup).not.toHaveBeenCalled();
    expect(routeHandler).not.toHaveBeenCalled();
  });

  it('enforces declared and default-all policies before nested sub-router router.use()', async () => {
    const { app, nestedRouterUseDbLookup, routeHandler } = buildApp([ManagementApiScope.ReadUsers]);

    const getResponse = await request(app.callback()).get('/organizations/org-1/roles');
    expect(getResponse.status).toBe(403);
    expect(nestedRouterUseDbLookup).not.toHaveBeenCalled();

    const deleteResponse = await request(app.callback()).delete('/organizations/org-1/roles');
    expect(deleteResponse.status).toBe(403);
    expect(nestedRouterUseDbLookup).not.toHaveBeenCalled();
    expect(routeHandler).not.toHaveBeenCalled();
  });

  it('inherits GET policy for HEAD requests and preserves OPTIONS / 404 fallthrough', async () => {
    const { app: deniedApp, routerUseDbLookup } = buildApp([ManagementApiScope.ReadUsers]);
    const headDenied = await request(deniedApp.callback()).head('/items/123');
    expect(headDenied.status).toBe(403);
    expect(routerUseDbLookup).not.toHaveBeenCalled();

    const optionsResponse = await request(deniedApp.callback()).options('/items/123');
    expect(optionsResponse.status).toBe(200);

    const notFoundResponse = await request(deniedApp.callback()).get('/does-not-exist');
    expect(notFoundResponse.status).toBe(404);

    const { app: allowedApp } = buildApp([ManagementApiScope.ReadApplications]);
    const headAllowed = await request(allowedApp.callback()).head('/items/123');
    expect(headAllowed.status).toBe(200);
  });

  it('allows inline assertHasScope inside koaGuard to return 403 cleanly', async () => {
    const { app } = buildApp([ManagementApiScope.UpdateSignInExperience]);

    const response = await request(app.callback()).patch('/sign-in-exp');
    expect(response.status).toBe(403);

    const { app: allApp } = buildApp([PredefinedScope.All]);
    const allowedResponse = await request(allApp.callback()).patch('/sign-in-exp');
    expect(allowedResponse.status).toBe(200);
    expect(allowedResponse.body).toEqual({ ok: true });
  });
});
