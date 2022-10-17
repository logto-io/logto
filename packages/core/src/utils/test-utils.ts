import { createMockContext, Options } from '@shopify/jest-koa-mocks';
import Koa, { MiddlewareType, Context, Middleware } from 'koa';
import Router, { IRouterParamContext } from 'koa-router';
import { Provider } from 'oidc-provider';
import { createMockPool, createMockQueryResult, QueryResult, QueryResultRow } from 'slonik';
import { PrimitiveValueExpression } from 'slonik/dist/src/types.d';
import request from 'supertest';

import { AuthedRouter, AnonymousRouter } from '@/routes/types';

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
  mockContestOptions?: Options<Record<string, unknown>>
): Context & IRouterParamContext => {
  const ctx = createMockContext(mockContestOptions);

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

// TODO: Refacttor me
// eslint-disable-next-line complexity
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
