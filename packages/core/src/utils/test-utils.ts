import type { MiddlewareType, Context, Middleware } from 'koa';
import Koa from 'koa';
import type { IRouterParamContext } from 'koa-router';
import Router from 'koa-router';
import type { Provider } from 'oidc-provider';
import type { QueryResult, QueryResultRow } from 'slonik';
import { createMockPool, createMockQueryResult } from 'slonik';
import type {
  PrimitiveValueExpression,
  TaggedTemplateLiteralInvocation,
} from 'slonik/dist/src/types.js';
import request from 'supertest';

import type { AuthedRouter, AnonymousRouter } from '#src/routes/types.js';
import type { Options } from '#src/test-utils/jest-koa-mocks/create-mock-context.js';
import createMockContext from '#src/test-utils/jest-koa-mocks/create-mock-context.js';

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
    params: {},
    router: new Router(),
    _matchedRoute: undefined,
    _matchedRouteName: undefined,
  };
};

/**
 * Supertest Request Mock Utils
 **/
type RouteLauncher<T extends AuthedRouter | AnonymousRouter> = (router: T) => void;

type ProviderRouteLauncher<T extends AuthedRouter | AnonymousRouter> = (
  router: T,
  provider: Provider
) => void;

export function createRequester(
  payload:
    | {
        anonymousRoutes?: RouteLauncher<AnonymousRouter> | Array<RouteLauncher<AnonymousRouter>>;
        authedRoutes?: RouteLauncher<AuthedRouter> | Array<RouteLauncher<AuthedRouter>>;
        middlewares?: Middleware[];
      }
    | {
        anonymousRoutes?:
          | ProviderRouteLauncher<AnonymousRouter>
          | Array<ProviderRouteLauncher<AnonymousRouter>>;
        authedRoutes?: RouteLauncher<AuthedRouter> | Array<RouteLauncher<AuthedRouter>>;
        middlewares?: Middleware[];
        provider: Provider;
      }
): request.SuperTest<request.Test>;

export function createRequester({
  anonymousRoutes,
  authedRoutes,
  provider,
  middlewares,
}: {
  anonymousRoutes?:
    | RouteLauncher<AnonymousRouter>
    | Array<RouteLauncher<AnonymousRouter>>
    | ProviderRouteLauncher<AnonymousRouter>
    | Array<ProviderRouteLauncher<AnonymousRouter>>;
  authedRoutes?: RouteLauncher<AuthedRouter> | Array<RouteLauncher<AuthedRouter>>;
  provider?: Provider;
  middlewares?: Middleware[];
}): request.SuperTest<request.Test> {
  const app = new Koa();

  if (middlewares) {
    for (const middleware of middlewares) {
      app.use(middleware);
    }
  }

  if (anonymousRoutes) {
    const anonymousRouter: AnonymousRouter = new Router();

    for (const route of Array.isArray(anonymousRoutes) ? anonymousRoutes : [anonymousRoutes]) {
      if (provider) {
        route(anonymousRouter, provider);
      } else {
        // For test use only
        // eslint-disable-next-line no-restricted-syntax
        (route as RouteLauncher<AnonymousRouter>)(anonymousRouter);
      }
    }

    app.use(anonymousRouter.routes()).use(anonymousRouter.allowedMethods());
  }

  if (authedRoutes) {
    const authRouter: AuthedRouter = new Router();

    authRouter.use(async (ctx, next) => {
      ctx.auth = { type: 'user', id: 'foo' };

      return next();
    });

    for (const route of Array.isArray(authedRoutes) ? authedRoutes : [authedRoutes]) {
      route(authRouter);
    }

    app.use(authRouter.routes()).use(authRouter.allowedMethods());
  }

  return request(app.callback());
}
