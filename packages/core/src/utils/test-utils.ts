import { createMockContext, Options } from '@shopify/jest-koa-mocks';
import { MiddlewareType, Context } from 'koa';
import Router, { IRouterParamContext } from 'koa-router';
import { createMockPool, createMockQueryResult, QueryResultRowType } from 'slonik';
import { PrimitiveValueExpressionType } from 'slonik/dist/src/types.d';

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

export const envVariablesSetUp = () => {
  const OIDC_PROVIDER_PRIVATE_KEY_BASE64 =
    'LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlDV2dJQkFBS0JnR3pLendQcVp6Q3dncjR5a0U1NTN2aWw3QTZYM2l1VnJ3TVJtbVJDTVNBL3lkUm04bXA1CjlHZUYyMlRCSVBtUEVNM29Lbnk4KytFL2FDRnByWXVDa0loREhodVR5N1diT25nd3kyb3JpYnNEQm1OS3FybTkKM0xkYWYrZm1aU2tsL0FMUjZNeUhNV2dTUkQrbFhxVnplNFdSRGIzVTlrTyt3RmVXUlNZNmlRL2pBZ01CQUFFQwpnWUJOZkczUjVpUTFJNk1iZ0x3VGlPM3N2NURRSEE3YmtETWt4bWJtdmRacmw4TlRDemZoNnBiUEhTSFVNMUlmCkxXelVtMldYanFzQUZiOCsvUnZrWDh3OHI3SENNUUdLVGs0ay9adkZ5YUhkM2tIUXhjSkJPakNOUUtjS2NZalUKRGdnTUVJeW5PblNZNjJpWEV6RExKVTJEMVUrY3JEbTZXUTVHaG1NS1p2Vnl3UUpCQU1lcFBFV2gwakNDOEdmQwpQQU1yT1JvOHJYeHYwVEdXNlJWYmxad0ppdjhNeGZacnpZT1cwZUFPek9IK0ZRWE90SjNTdUZONzdEcVQ5TDI3CmN2M3QySkVDUVFDTGZZeVl2ZUg0UnY2bnVET0RnckkzRUJHMFNJbURHcC94UUV2NEk5Z0hrRFF0aFF4bW5xNTEKZ1QxajhFN1lmRHEwMTkvN2htL3dmMXNzMERQNkpic3pBa0JqOEUzKy9MVGRHMjJDUWpNUDB2N09KemtmWkVqdAo3WC9WOVBXNkdQeStGWUt4aWR4ZzFZbFFBWmlFTms0SGppUFNLN3VmN2hPY2JwcStyYWt0ZVhSQkFrQmhaaFFECkh5c20wbVBFTnNGNWhZdnRHTUpUOFFaYnpmNTZWUnYyc3dpSUYyL25qT3hneDFJbjZFczJlamlEdnhLNjdiV1AKQ29zbEViaFhMVFh0NStTekFrQjJQOUYzNExubE9tVjh4Zjk1VmVlcXNPbDFmWWx2Uy9vUUx1a2ZxVkJsTmtzNgpzdmNLVDJOQjlzSHlCeE8vY3Zqa0ZpWXdHR2MzNjlmQklkcDU1S2IwCi0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0t';
  const UI_SIGN_IN_ROUTE = '/sign-in';

  process.env = {
    ...process.env,
    OIDC_PROVIDER_PRIVATE_KEY_BASE64,
    UI_SIGN_IN_ROUTE,
  };
};

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
