import type { QueryResult, QueryResultRow } from '@silverhand/slonik';
import { createMockPool, createMockQueryResult } from '@silverhand/slonik';
import type {
  PrimitiveValueExpression,
  TaggedTemplateLiteralInvocation,
} from '@silverhand/slonik/dist/src/types.js';
import type { Context, Middleware, MiddlewareType } from 'koa';
import Koa from 'koa';
import type { IRouterParamContext } from 'koa-router';
import Router from 'koa-router';
import request from 'supertest';

import type { AnonymousRouter, ManagementApiRouter } from '#src/routes/types.js';
import type TenantContext from '#src/tenants/TenantContext.js';
import type { Options } from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import { MockTenant } from '#src/test-utils/tenant.js';

/**
 *  Slonik Query Mock Utils
 **/
export const expectSqlAssert = (sql: string, expectSql: string) => {
  expect(
    sql
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)
  ).toEqual(
    expectSql
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)
  );
};

export const expectSqlTokenAssert = (
  sql: TaggedTemplateLiteralInvocation,
  expectSql: string,
  values?: unknown[]
) => {
  expect(
    sql.sql
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)
  ).toEqual(
    expectSql
      .split('\n')
      .map((row) => row.trim())
      .filter(Boolean)
  );

  if (values) {
    expect(sql.values).toStrictEqual(values);
  }
};

export type QueryType = (
  sql: string,
  values: readonly PrimitiveValueExpression[]
) => Promise<QueryResult<QueryResultRow>>;

export const createTestPool = <T extends QueryResultRow>(
  expectSql?: string,
  returning?: T | ((sql: string, values: readonly PrimitiveValueExpression[]) => T)
) =>
  createMockPool({
    query: async (sql, values) => {
      if (expectSql) {
        expectSqlAssert(sql, expectSql);
      }

      return createMockQueryResult(
        returning ? [typeof returning === 'function' ? returning(sql, values) : returning] : []
      );
    },
  });

/**
 * Middleware & Context Mock Utils
 **/
export const emptyMiddleware =
  <StateT, ContextT>(): MiddlewareType<StateT, ContextT> =>
  // Intend to mock the async middleware
  // eslint-disable-next-line unicorn/consistent-function-scoping
  async (ctx, next) => {
    return next();
  };

export const createContextWithRouteParameters = (
  mockContextOptions?: Options<Record<string, unknown>>
): Context & IRouterParamContext => {
  const ctx = createMockContext(mockContextOptions);

  return {
    ...ctx,
    path: ctx.path,
    URL: ctx.URL,
    params: {},
    headers: {},
    router: new Router(),
    _matchedRoute: undefined,
    _matchedRouteName: undefined,
  };
};

/**
 * Supertest Request Mock Utils
 **/
type RouteLauncher<T extends ManagementApiRouter | AnonymousRouter> = (
  router: T,
  tenant: TenantContext
) => void;

export function createRequester<StateT, ContextT extends IRouterParamContext, ResponseT>({
  anonymousRoutes,
  authedRoutes,
  middlewares,
  tenantContext,
}: {
  anonymousRoutes?: RouteLauncher<AnonymousRouter> | Array<RouteLauncher<AnonymousRouter>>;
  authedRoutes?: RouteLauncher<ManagementApiRouter> | Array<RouteLauncher<ManagementApiRouter>>;
  middlewares?: Array<Middleware<StateT, ContextT, ResponseT>>;
  tenantContext?: TenantContext;
}) {
  const app = new Koa();
  const tenant = tenantContext ?? new MockTenant();

  if (middlewares) {
    for (const middleware of middlewares) {
      app.use(middleware);
    }
  }

  if (anonymousRoutes) {
    const anonymousRouter: AnonymousRouter = new Router();

    for (const route of Array.isArray(anonymousRoutes) ? anonymousRoutes : [anonymousRoutes]) {
      route(anonymousRouter, tenant);
    }

    app.use(anonymousRouter.routes()).use(anonymousRouter.allowedMethods());
  }

  if (authedRoutes) {
    const authRouter: ManagementApiRouter = new Router();

    authRouter.use(async (ctx, next) => {
      ctx.auth = { type: 'user', id: 'foo' };

      return next();
    });

    for (const route of Array.isArray(authedRoutes) ? authedRoutes : [authedRoutes]) {
      route(authRouter, tenant);
    }

    app.use(authRouter.routes()).use(authRouter.allowedMethods());
  }

  return request(app.callback());
}
