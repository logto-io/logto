import { MissingProfile, SignInIdentifier } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import RequestError from '#src/errors/RequestError/index.js';
import { findUserById } from '#src/queries/user.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { Identifier } from '../types/index.js';
import { isUserPasswordSet } from '../utils/index.js';
import mandatoryUserProfileValidation from './mandatory-user-profile-validation.js';

jest.mock('#src/queries/user.js', () => ({
  findUserById: jest.fn(),
}));

jest.mock('../utils/index.js', () => ({
  isUserPasswordSet: jest.fn(),
}));

describe('mandatoryUserProfileValidation', () => {
  const baseCtx = createContextWithRouteParameters();
  const identifiers: Identifier[] = [{ key: 'accountId', value: 'foo' }];

  it('username and password missing but required', async () => {
    const ctx = {
      ...baseCtx,
      signInExperience: mockSignInExperience,
    };

    await expect(
      mandatoryUserProfileValidation(ctx, identifiers, { email: 'email' })
    ).rejects.toMatchError(
      new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: [MissingProfile.password, MissingProfile.username] }
      )
    );

    await expect(
      mandatoryUserProfileValidation(ctx, identifiers, {
        username: 'username',
        password: 'password',
      })
    ).resolves.not.toThrow();
  });

  it('user account has username and password', async () => {
    (findUserById as jest.Mock).mockResolvedValueOnce({
      username: 'foo',
    });
    (isUserPasswordSet as jest.Mock).mockResolvedValueOnce(true);

    const ctx = {
      ...baseCtx,
      signInExperience: mockSignInExperience,
    };

    await expect(mandatoryUserProfileValidation(ctx, identifiers, {})).resolves.not.toThrow();
  });

  it('email missing but required', async () => {
    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
      },
    };

    await expect(
      mandatoryUserProfileValidation(ctx, identifiers, { username: 'username' })
    ).rejects.toMatchError(
      new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: [MissingProfile.email] }
      )
    );
  });

  it('user account has email', async () => {
    (findUserById as jest.Mock).mockResolvedValueOnce({
      primaryEmail: 'email',
    });

    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
      },
    };

    await expect(
      mandatoryUserProfileValidation(ctx, identifiers, { username: 'username' })
    ).resolves.not.toThrow();
  });

  it('phone missing but required', async () => {
    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: { identifiers: [SignInIdentifier.Sms], password: false, verify: true },
      },
    };

    await expect(
      mandatoryUserProfileValidation(ctx, identifiers, { username: 'username' })
    ).rejects.toMatchError(
      new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: [MissingProfile.phone] }
      )
    );
  });

  it('user account has phone', async () => {
    (findUserById as jest.Mock).mockResolvedValueOnce({
      primaryPhone: 'phone',
    });

    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: { identifiers: [SignInIdentifier.Sms], password: false, verify: true },
      },
    };

    await expect(
      mandatoryUserProfileValidation(ctx, identifiers, { username: 'username' })
    ).resolves.not.toThrow();
  });

  it('email or Phone required', async () => {
    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: {
          identifiers: [SignInIdentifier.Email, SignInIdentifier.Sms],
          password: false,
          verify: true,
        },
      },
    };

    await expect(
      mandatoryUserProfileValidation(ctx, identifiers, { username: 'username' })
    ).rejects.toMatchError(
      new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: [MissingProfile.emailOrPhone] }
      )
    );

    await expect(
      mandatoryUserProfileValidation(ctx, identifiers, { email: 'email' })
    ).resolves.not.toThrow();

    await expect(
      mandatoryUserProfileValidation(ctx, identifiers, { phone: 'phone' })
    ).resolves.not.toThrow();
  });
});
