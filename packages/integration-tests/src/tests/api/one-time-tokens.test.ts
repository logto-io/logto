import { OneTimeTokenStatus } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import { authedAdminApi } from '#src/api/api.js';
import {
  createOneTimeToken,
  verifyOneTimeToken,
  getOneTimeTokenById,
  updateOneTimeTokenStatus,
  deleteOneTimeTokenById,
  getOneTimeTokens,
} from '#src/api/one-time-token.js';
import { expectRejects } from '#src/helpers/index.js';
import { waitFor } from '#src/utils.js';

describe('one-time tokens API', () => {
  beforeAll(async () => {
    // Clear all one-time tokens before running tests
    const allTokens = await getOneTimeTokens();
    await Promise.all(allTokens.map(async (token) => deleteOneTimeTokenById(token.id)));
  });
  it('should create one-time token with default 10 mins expiration time', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({
      email,
    });

    expect(oneTimeToken.expiresAt).toBeGreaterThan(Date.now());
    expect(oneTimeToken.expiresAt).toBeLessThanOrEqual(Date.now() + 10 * 60 * 1000);
    expect(oneTimeToken.status).toBe(OneTimeTokenStatus.Active);
    expect(oneTimeToken.context).toEqual({});
    expect(oneTimeToken.email).toBe(email);
    expect(oneTimeToken.token.length).toBe(32);

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should create one-time token with custom expiration time', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({
      email,
      expiresIn: 30,
    });

    expect(oneTimeToken.expiresAt).toBeGreaterThan(Date.now());
    expect(oneTimeToken.expiresAt).toBeLessThanOrEqual(Date.now() + 30 * 1000);
    expect(oneTimeToken.status).toBe(OneTimeTokenStatus.Active);
    expect(oneTimeToken.email).toBe(email);
    expect(oneTimeToken.token.length).toBe(32);

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should create one-time token with `applicationIds` and `jitOrganizationIds` configured', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({
      email,
      context: {
        jitOrganizationIds: ['org-1'],
      },
    });

    expect(oneTimeToken.status).toBe(OneTimeTokenStatus.Active);
    expect(oneTimeToken.email).toBe(email);
    expect(oneTimeToken.context).toEqual({
      jitOrganizationIds: ['org-1'],
    });
    expect(oneTimeToken.token.length).toBe(32);

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should be able to get one-time token by its ID', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({
      email,
      context: {
        jitOrganizationIds: ['org-1'],
      },
    });

    const token = await getOneTimeTokenById(oneTimeToken.id);
    expect(token).toEqual(oneTimeToken);

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should throw when getting a non-existent one-time token', async () => {
    await expectRejects(getOneTimeTokenById('non-existent-id'), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });

  it('should return expired status when the expiration time is passed', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken1 = await createOneTimeToken({
      email,
      expiresIn: 1,
    });
    const oneTimeToken2 = await createOneTimeToken({
      email,
      expiresIn: 600,
    });

    await waitFor(1001);
    const [token1, token2] = await Promise.all([
      getOneTimeTokenById(oneTimeToken1.id),
      getOneTimeTokenById(oneTimeToken2.id),
    ]);
    expect(token1.status).toBe(OneTimeTokenStatus.Expired);
    expect(token2.status).toBe(OneTimeTokenStatus.Active);

    const tokens = await getOneTimeTokens({ email });
    expect(tokens).toHaveLength(2);
    expect(tokens).toEqual(
      expect.arrayContaining([
        { ...oneTimeToken1, status: OneTimeTokenStatus.Expired },
        { ...oneTimeToken2, status: OneTimeTokenStatus.Active },
      ])
    );

    await deleteOneTimeTokenById(oneTimeToken1.id);
    await deleteOneTimeTokenById(oneTimeToken2.id);
  });

  it(`update expired tokens' status to expired when creating new one-time token`, async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({
      email,
      expiresIn: 1,
    });

    await waitFor(1001);
    const newOneTimeToken = await createOneTimeToken({ email });

    const reFetchedToken = await getOneTimeTokenById(oneTimeToken.id);
    expect(reFetchedToken.status).toBe(OneTimeTokenStatus.Expired);

    await deleteOneTimeTokenById(oneTimeToken.id);
    await deleteOneTimeTokenById(newOneTimeToken.id);
  });

  it('should verify one-time token', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({
      email,
      context: {
        jitOrganizationIds: ['org-1'],
      },
    });

    const verifiedToken = await verifyOneTimeToken({
      email,
      token: oneTimeToken.token,
    });

    expect(verifiedToken).toEqual({
      ...oneTimeToken,
      status: OneTimeTokenStatus.Consumed,
    });

    // Should throw token_consumed error when token is already consumed
    await expectRejects(
      verifyOneTimeToken({
        email,
        token: oneTimeToken.token,
      }),
      {
        code: 'one_time_token.token_consumed',
        status: 400,
      }
    );

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should not succeed to verify one-time token with expired token', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({
      email,
      context: {
        jitOrganizationIds: ['org-1'],
      },
      expiresIn: 1,
    });

    // Wait for the token to be expired
    await waitFor(1001);

    await expectRejects(
      verifyOneTimeToken({
        email,
        token: oneTimeToken.token,
      }),
      {
        code: 'one_time_token.token_expired',
        status: 400,
      }
    );

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should not succeed to verify one-time token wrong email', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({
      email,
      context: {
        jitOrganizationIds: ['org-1'],
      },
    });

    await expectRejects(
      verifyOneTimeToken({
        email: 'wrong-email@bar.com',
        token: oneTimeToken.token,
      }),
      {
        code: 'one_time_token.email_mismatch',
        status: 400,
      }
    );

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should not succeed to verify one-time token wrong token', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({
      email,
      context: {
        jitOrganizationIds: ['org-1'],
      },
    });

    await expectRejects(
      verifyOneTimeToken({
        email,
        token: 'wrong-token',
      }),
      {
        code: 'one_time_token.token_not_found',
        status: 404,
      }
    );
    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should throw token_expired error and update token status to expired (token already expired but status is not updated)', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({ email, expiresIn: 1 });

    await waitFor(1001);

    await expectRejects(
      verifyOneTimeToken({
        email,
        token: oneTimeToken.token,
      }),
      {
        code: 'one_time_token.token_expired',
        status: 400,
      }
    );

    const updatedToken = await getOneTimeTokenById(oneTimeToken.id);
    expect(updatedToken.status).toBe(OneTimeTokenStatus.Expired);

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should be able to revoke a token by updating the status', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({ email, expiresIn: 1 });

    await updateOneTimeTokenStatus(oneTimeToken.id, OneTimeTokenStatus.Revoked);

    const updatedToken = await getOneTimeTokenById(oneTimeToken.id);
    expect(updatedToken.status).toBe(OneTimeTokenStatus.Revoked);

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should throw when trying to re-activate a token', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({ email, expiresIn: 1 });

    await expectRejects(updateOneTimeTokenStatus(oneTimeToken.id, OneTimeTokenStatus.Active), {
      code: 'one_time_token.cannot_reactivate_token',
      status: 400,
    });

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should throw when verifying a revoked token', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({ email });

    await updateOneTimeTokenStatus(oneTimeToken.id, OneTimeTokenStatus.Revoked);

    await expectRejects(
      verifyOneTimeToken({
        email,
        token: oneTimeToken.token,
      }),
      {
        code: 'one_time_token.token_revoked',
        status: 400,
      }
    );

    await deleteOneTimeTokenById(oneTimeToken.id);
  });

  it('should throw when trying to delete a non-existent one-time token', async () => {
    await expectRejects(deleteOneTimeTokenById('non-existent-id'), {
      code: 'entity.not_found',
      status: 404,
    });
  });

  it('should delete the one-time token successfully', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({ email });

    await deleteOneTimeTokenById(oneTimeToken.id);

    await expectRejects(getOneTimeTokenById(oneTimeToken.id), {
      code: 'entity.not_exists_with_id',
      status: 404,
    });
  });

  it('should be able to batch fetch one-time tokens', async () => {
    const email = `foo${generateStandardId()}@bar.com`;

    // Clean up any existing tokens with this email first
    const existingTokensResponse = await authedAdminApi.get(
      `one-time-tokens?email=${encodeURIComponent(email)}`
    );
    const existingTokens = await existingTokensResponse.json<Array<{ id: string }>>();
    await Promise.all(existingTokens.map(async (token) => deleteOneTimeTokenById(token.id)));
    const oneTimeToken1 = await createOneTimeToken({ email });
    const oneTimeToken2 = await createOneTimeToken({ email });
    const oneTimeToken3 = await createOneTimeToken({ email });

    const tokens = await getOneTimeTokens();
    expect(tokens).toEqual(expect.arrayContaining([oneTimeToken1, oneTimeToken2, oneTimeToken3]));

    const response = await authedAdminApi.get(
      `one-time-tokens?email=${encodeURIComponent(email)}&page=1&page_size=2`
    );
    expect(response.headers.get('Total-Number')).toBe('3');
    expect(await response.json()).toEqual(expect.arrayContaining([oneTimeToken2, oneTimeToken3]));

    await deleteOneTimeTokenById(oneTimeToken1.id);
    await deleteOneTimeTokenById(oneTimeToken2.id);
    await deleteOneTimeTokenById(oneTimeToken3.id);
  });

  it('should be able fetch list of one-time tokens with query params', async () => {
    const fooEmail = `foo${generateStandardId()}@bar.com`;
    const barEmail = `bar${generateStandardId()}@bar.com`;
    const [oneTimeToken1, oneTimeToken2, oneTimeToken3] = await Promise.all([
      createOneTimeToken({ email: fooEmail }),
      createOneTimeToken({ email: fooEmail }),
      createOneTimeToken({ email: barEmail }),
    ]);

    const tokens = await getOneTimeTokens({ email: fooEmail });
    expect(tokens).toEqual(expect.arrayContaining([oneTimeToken1, oneTimeToken2]));

    await updateOneTimeTokenStatus(oneTimeToken1.id, OneTimeTokenStatus.Revoked);
    await verifyOneTimeToken({ email: fooEmail, token: oneTimeToken2.token });

    const revokedTokens = await getOneTimeTokens({
      email: fooEmail,
      status: OneTimeTokenStatus.Revoked,
    });
    expect(revokedTokens).toEqual([{ ...oneTimeToken1, status: OneTimeTokenStatus.Revoked }]);

    const consumedTokens = await getOneTimeTokens({
      email: fooEmail,
      status: OneTimeTokenStatus.Consumed,
    });
    expect(consumedTokens).toEqual([{ ...oneTimeToken2, status: OneTimeTokenStatus.Consumed }]);

    const activeBarTokens = await getOneTimeTokens({
      email: barEmail,
      status: OneTimeTokenStatus.Active,
    });
    expect(activeBarTokens).toEqual([oneTimeToken3]);

    await deleteOneTimeTokenById(oneTimeToken1.id);
    await deleteOneTimeTokenById(oneTimeToken2.id);
    await deleteOneTimeTokenById(oneTimeToken3.id);
  });
});
