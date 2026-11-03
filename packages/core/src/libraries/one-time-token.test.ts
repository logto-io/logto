import { OneTimeTokenStatus, type OneTimeToken } from '@logto/schemas';
import type { Nullable } from '@silverhand/essentials';

import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.js';

import { createOneTimeTokenLibrary } from './one-time-token.js';

const { jest } = import.meta;

const activeToken: OneTimeToken = {
  tenantId: 'tenant_id',
  id: 'token_id',
  email: 'foo@example.com',
  token: 'token_value',
  context: {},
  status: OneTimeTokenStatus.Active,
  createdAt: Date.now(),
  expiresAt: Date.now() + 60_000,
};

const getOneTimeTokenByToken = jest.fn(async () => activeToken);
const consumeActiveOneTimeToken = jest.fn<Promise<Nullable<OneTimeToken>>, [string]>();

const { verifyOneTimeToken } = createOneTimeTokenLibrary(
  new MockQueries({ oneTimeTokens: { getOneTimeTokenByToken, consumeActiveOneTimeToken } })
);

describe('verifyOneTimeToken()', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('returns the token it consumed', async () => {
    const consumedToken = { ...activeToken, status: OneTimeTokenStatus.Consumed };
    consumeActiveOneTimeToken.mockResolvedValueOnce(consumedToken);

    await expect(verifyOneTimeToken(activeToken.token, activeToken.email)).resolves.toBe(
      consumedToken
    );
    expect(consumeActiveOneTimeToken).toHaveBeenCalledWith(activeToken.token);
  });

  it('rejects a token that is no longer active', async () => {
    consumeActiveOneTimeToken.mockResolvedValueOnce(null);

    await expect(verifyOneTimeToken(activeToken.token, activeToken.email)).rejects.toMatchError(
      new RequestError('one_time_token.token_consumed')
    );
  });
});
