import { CreateLog } from '@logto/schemas';

import { OmitAutoSetFields } from '@/database/utils';
import { grantSuccessListener } from '@/utils/oidc-provider-event-listener';
import { createContextWithRouteParameters } from '@/utils/test-utils';

const insertLog: (data: OmitAutoSetFields<CreateLog>) => Promise<void> = jest.fn();

jest.mock('@/queries/log', () => ({
  insertLog: jest.fn(async (data) => insertLog(data)),
}));

describe('grantSuccessListener', () => {
  const ip = '192.168.0.1';
  const userAgent =
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36';
  const request = { ip, headers: { 'user-agent': userAgent } };

  const userId = 'userIdValue';
  const entities = { Account: { accountId: userId } };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should log type CodeExchangeToken when grant type is authorization_code', async () => {
    const parameters = { grant_type: 'authorization_code', code: 'codeValue' };
    const ctx = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      request,
      oidc: { entities, params: parameters },
      body: {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        id_token: 'newIdToken',
        scope: 'openid offline-access',
      },
    };
    ctx.request.ip = ip;

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await grantSuccessListener(ctx);
    expect(insertLog).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(String),
        type: 'CodeExchangeToken',
        payload: {
          ip,
          issued: ['accessToken', 'refreshToken', 'idToken'],
          params: parameters,
          result: 'Success',
          scope: 'openid offline-access',
          userAgent,
          userId,
        },
      })
    );
  });

  it('should log type RefreshTokenExchangeToken when grant type is refresh_code', async () => {
    const parameters = { grant_type: 'refresh_token', refresh_token: 'refreshTokenValue' };
    const ctx = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      request,
      oidc: { entities, params: parameters },
      body: {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        id_token: 'newIdToken',
        scope: 'openid offline-access',
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await grantSuccessListener(ctx);
    expect(insertLog).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(String),
        type: 'RefreshTokenExchangeToken',
        payload: {
          ip,
          issued: ['accessToken', 'refreshToken', 'idToken'],
          params: parameters,
          result: 'Success',
          scope: 'openid offline-access',
          userAgent,
          userId,
        },
      })
    );
  });

  test('issued field should not contain "idToken" when there is no issued idToken', async () => {
    const parameters = { grant_type: 'refresh_token', refresh_token: 'refreshTokenValue' };
    const ctx = {
      ...createContextWithRouteParameters({ headers: { 'user-agent': userAgent } }),
      request,
      oidc: { entities, params: parameters },
      body: {
        access_token: 'newAccessTokenValue',
        refresh_token: 'newRefreshTokenValue',
        scope: 'offline-access',
      },
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    await grantSuccessListener(ctx);
    expect(insertLog).toHaveBeenCalledWith(
      expect.objectContaining({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(String),
        type: 'RefreshTokenExchangeToken',
        payload: {
          ip,
          issued: ['accessToken', 'refreshToken'],
          params: parameters,
          result: 'Success',
          scope: 'offline-access',
          userAgent,
          userId,
        },
      })
    );
  });
});
