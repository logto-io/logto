import { SignInIdentifier, VerificationType } from '@logto/schemas';

import { MockTenant } from '#src/test-utils/tenant.js';

import { OneTimeTokenVerification } from './one-time-token-verification.js';

const { jest } = import.meta;

describe('OneTimeTokenVerification', () => {
  it('interpolates the identifier for unknown users', async () => {
    const email = 'foo@example.com';
    const findUserByEmail = jest.fn().mockResolvedValue(null);
    const tenant = new MockTenant(undefined, {
      users: {
        findUserByEmail,
      },
    });
    const verification = new OneTimeTokenVerification(tenant.libraries, tenant.queries, {
      id: 'mock_one_time_token_verification_id',
      type: VerificationType.OneTimeToken,
      identifier: {
        type: SignInIdentifier.Email,
        value: email,
      },
      verified: true,
    });

    await expect(verification.identifyUser()).rejects.toMatchObject({
      code: 'user.user_not_exist',
      message: `User with ${email} does not exist.`,
      status: 404,
    });
    expect(findUserByEmail).toHaveBeenCalledWith(email);
  });
});
