import { User, userInfoSelectFields } from '@logto/schemas';
import { createMockContext, Options } from '@shopify/jest-koa-mocks';
import { MiddlewareType, Context } from 'koa';
import Router, { IRouterParamContext } from 'koa-router';
import pick from 'lodash.pick';
import { createMockPool, createMockQueryResult, QueryResultRowType } from 'slonik';
import { PrimitiveValueExpressionType } from 'slonik/dist/src/types.d';

import { WithAuthContext } from '@/middleware/koa-auth';

export const mockUser: User = {
  id: 'foo',
  username: 'foo',
  primaryEmail: 'foo@logto.io',
  primaryPhone: '111111',
  roleNames: ['admin'],
  passwordEncrypted: null,
  passwordEncryptionMethod: null,
  passwordEncryptionSalt: null,
  name: null,
  avatar: null,
  identities: {},
  customData: {},
};

export const mockUserResponse = pick(mockUser, ...userInfoSelectFields);

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

export const mockKoaAuthMiddleware = <StateT, ContextT extends IRouterParamContext, ResponseBodyT>(
  userId = 'foo'
): MiddlewareType<StateT, WithAuthContext<ContextT>, ResponseBodyT> => {
  return async (ctx, next) => {
    ctx.auth = userId;

    return next();
  };
};
