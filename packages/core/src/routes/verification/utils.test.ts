import { SignInIdentifier, type VerificationCodeIdentifier } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/index.js';
import RequestError from '#src/errors/RequestError/index.js';
import type Queries from '#src/tenants/Queries.js';

import { guardNewIdentifierEmailBlocklist } from './utils.js';

const { jest } = import.meta;

describe('guardNewIdentifierEmailBlocklist', () => {
  const findDefaultSignInExperience = jest.fn(async () => ({
    ...mockSignInExperience,
    emailBlocklistPolicy: {
      customAllowlist: ['@allowed.com'],
    },
  }));
  const queries = {
    signInExperiences: {
      findDefaultSignInExperience,
    },
  } as unknown as Queries;

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should reject a new email identifier that does not match the custom allowlist', async () => {
    const identifier: VerificationCodeIdentifier = {
      type: SignInIdentifier.Email,
      value: 'foo@bar.com',
    };

    await expect(guardNewIdentifierEmailBlocklist(queries, identifier, true)).rejects.toMatchError(
      new RequestError({
        code: 'session.email_blocklist.email_not_allowed',
        status: 422,
        email: identifier.value,
      })
    );
    expect(findDefaultSignInExperience).toHaveBeenCalledTimes(1);
  });
});
