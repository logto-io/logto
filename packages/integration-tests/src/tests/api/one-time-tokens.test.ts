import { OneTimeTokenStatus } from '@logto/schemas';
import { generateStandardId } from '@logto/shared';

import { createOneTimeToken, verifyOneTimeToken } from '#src/api/one-time-token.js';
import { expectRejects } from '#src/helpers/index.js';
import { devFeatureTest } from '#src/utils.js';

const { it, describe } = devFeatureTest;

describe('one time tokens API', () => {
  it('should create one time token with default 10 mins expiration time', async () => {
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
  });

  it('should create one time token with custom expiration time', async () => {
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
  });

  it('should create one time token with `applicationIds` and `jitOrganizationIds` configured', async () => {
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
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  it(`update expired tokens' status to expired when creating new one time token`, async () => {});

  it('should verify one time token', async () => {
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
  });

  it('should not succeed to verify one time token with expired token', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    const oneTimeToken = await createOneTimeToken({
      email,
      context: {
        jitOrganizationIds: ['org-1'],
      },
      expiresIn: 1,
    });

    // Wait for the token to be expired
    await new Promise((resolve) => {
      setTimeout(resolve, 2000);
    });

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
  });

  it('should not succeed to verify one time token wrong email', async () => {
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
  });

  it('should not succeed to verify one time token wrong token', async () => {
    const email = `foo${generateStandardId()}@bar.com`;
    await createOneTimeToken({
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
  });

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  it('should throw token_expired error and update token status to expired (token already expired but status is not updated)', async () => {});

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  it('should throw token_revoked error', async () => {});
});
