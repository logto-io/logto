import { createMockContext, Options } from '@shopify/jest-koa-mocks';
import Koa, { MiddlewareType, Context } from 'koa';
import Router, { IRouterParamContext } from 'koa-router';
import { Provider } from 'oidc-provider';
import { createMockPool, createMockQueryResult, QueryResultRowType } from 'slonik';
import { PrimitiveValueExpressionType } from 'slonik/dist/src/types.d';
import request from 'supertest';

import { AuthedRouter, AnonymousRouter } from '@/routes/types';

export const createTestPool = <T extends QueryResultRowType>(
  expectSql?: string,
  returning?: T | ((sql: string, values: readonly PrimitiveValueExpressionType[]) => T)
) =>
  createMockPool({
    query: async (sql, values) => {
      if (expectSql) {
        expect(
          sql
            .split('\n')
            .map((row) => row.trim())
            .filter((row) => row)
        ).toEqual(expectSql.split('\n'));
      }

      return createMockQueryResult(
        returning ? [typeof returning === 'function' ? returning(sql, values) : returning] : []
      );
    },
  });

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
      }
    | {
        anonymousRoutes?:
          | ProviderRouteLauncher<AnonymousRouter>
          | Array<ProviderRouteLauncher<AnonymousRouter>>;
        authedRoutes?: RouteLauncher<AuthedRouter> | Array<RouteLauncher<AuthedRouter>>;
        provider: Provider;
      }
): request.SuperTest<request.Test>;

export function createRequester({
  anonymousRoutes,
  authedRoutes,
  provider,
}: {
  anonymousRoutes?:
    | RouteLauncher<AnonymousRouter>
    | Array<RouteLauncher<AnonymousRouter>>
    | ProviderRouteLauncher<AnonymousRouter>
    | Array<ProviderRouteLauncher<AnonymousRouter>>;
  authedRoutes?: RouteLauncher<AuthedRouter> | Array<RouteLauncher<AuthedRouter>>;
  provider?: Provider;
}): request.SuperTest<request.Test> {
  const app = new Koa();

  if (anonymousRoutes) {
    const anonymousRouter: AnonymousRouter = new Router();

    for (const route of Array.isArray(anonymousRoutes) ? anonymousRoutes : [anonymousRoutes]) {
      if (provider) {
        route(anonymousRouter, provider);
      } else {
        (route as RouteLauncher<AnonymousRouter>)(anonymousRouter);
      }
    }

    app.use(anonymousRouter.routes()).use(anonymousRouter.allowedMethods());
  }

  if (authedRoutes) {
    const authRouter: AuthedRouter = new Router();

    for (const route of Array.isArray(authedRoutes) ? authedRoutes : [authedRoutes]) {
      route(authRouter);
    }

    app.use(authRouter.routes()).use(authRouter.allowedMethods());
  }

  return request(app.callback());
}
