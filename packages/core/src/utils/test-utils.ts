import { createMockContext, Options } from '@shopify/jest-koa-mocks';
import Koa, { MiddlewareType, Context } from 'koa';
import Router, { IRouterParamContext } from 'koa-router';
import { Provider } from 'oidc-provider';
import { createMockPool, createMockQueryResult, QueryResultRowType } from 'slonik';
import { PrimitiveValueExpressionType } from 'slonik/dist/src/types.d';
import request from 'supertest';

import { AuthedRouter, AnonymousRouter } from '@/routes/types';

jest.mock('oidc-provider');

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

type RouteLauncher<T extends AuthedRouter | AnonymousRouter> =
  | ((router: T) => void)
  | ((router: T, provider: Provider) => void);

export const createRequester = <T extends AuthedRouter | AnonymousRouter = AuthedRouter>(
  ...logtoRoute: Array<RouteLauncher<T>>
): request.SuperTest<request.Test> => {
  const app = new Koa();
  const router = new Router() as T;
  const provider = new Provider('');

  for (const route of logtoRoute) {
    route(router, provider);
  }

  app.use(router.routes()).use(router.allowedMethods());

  return request(app.callback());
};
