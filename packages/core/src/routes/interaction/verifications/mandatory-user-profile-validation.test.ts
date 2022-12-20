import { Event, MissingProfile, SignInIdentifier } from '@logto/schemas';
import { mockEsm, mockEsmWithActual, pickDefault } from '@logto/shared/esm';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import RequestError from '#src/errors/RequestError/index.js';
import { createMockProvider } from '#src/test-utils/oidc-provider.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.js';

import type { IdentifierVerifiedInteractionResult } from '../types/index.js';

const { jest } = import.meta;

const { findUserById } = await mockEsmWithActual('#src/queries/user.js', () => ({
  findUserById: jest.fn(),
}));

const { isUserPasswordSet } = mockEsm('../utils/index.js', () => ({
  isUserPasswordSet: jest.fn(),
}));

const { getSignInExperience } = mockEsm('../utils/sign-in-experience-validation.js', () => ({
  getSignInExperience: jest.fn().mockReturnValue(mockSignInExperience),
}));

const validateMandatoryUserProfile = await pickDefault(
  import('./mandatory-user-profile-validation.js')
);

describe('validateMandatoryUserProfile', () => {
  const provider = createMockProvider();
  const baseCtx = createContextWithRouteParameters();
  const interaction: IdentifierVerifiedInteractionResult = {
    event: Event.SignIn,
    accountId: 'foo',
  };

  it('username and password missing but required', async () => {
    await expect(validateMandatoryUserProfile(baseCtx, provider, interaction)).rejects.toMatchError(
      new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: [MissingProfile.password, MissingProfile.username] }
      )
    );

    await expect(
      validateMandatoryUserProfile(baseCtx, provider, {
        ...interaction,
        profile: {
          username: 'username',
          password: 'password',
        },
      })
    ).resolves.not.toThrow();
  });

  it('user account has username and password', async () => {
    findUserById.mockResolvedValueOnce({
      username: 'foo',
    });
    isUserPasswordSet.mockResolvedValueOnce(true);

    await expect(
      validateMandatoryUserProfile(baseCtx, provider, interaction)
    ).resolves.not.toThrow();
  });

  it('email missing but required', async () => {
    getSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
    });

    await expect(validateMandatoryUserProfile(baseCtx, provider, interaction)).rejects.toMatchError(
      new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: [MissingProfile.email] }
      )
    );
  });

  it('user account has email', async () => {
    findUserById.mockResolvedValueOnce({
      primaryEmail: 'email',
    });

    getSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
    });

    await expect(
      validateMandatoryUserProfile(baseCtx, provider, interaction)
    ).resolves.not.toThrow();
  });

  it('phone missing but required', async () => {
    getSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      signUp: { identifiers: [SignInIdentifier.Sms], password: false, verify: true },
    });

    await expect(validateMandatoryUserProfile(baseCtx, provider, interaction)).rejects.toMatchError(
      new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: [MissingProfile.phone] }
      )
    );
  });

  it('user account has phone', async () => {
    findUserById.mockResolvedValueOnce({
      primaryPhone: 'phone',
    });

    getSignInExperience.mockResolvedValueOnce({
      ...mockSignInExperience,
      signUp: { identifiers: [SignInIdentifier.Sms], password: false, verify: true },
    });

    await expect(
      validateMandatoryUserProfile(baseCtx, provider, interaction)
    ).resolves.not.toThrow();
  });

  it('email or Phone required', async () => {
    getSignInExperience.mockResolvedValue({
      ...mockSignInExperience,
      signUp: {
        identifiers: [SignInIdentifier.Email, SignInIdentifier.Sms],
        password: false,
        verify: true,
      },
    });

    await expect(validateMandatoryUserProfile(baseCtx, provider, interaction)).rejects.toMatchError(
      new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: [MissingProfile.emailOrPhone] }
      )
    );

    await expect(
      validateMandatoryUserProfile(baseCtx, provider, {
        ...interaction,
        profile: { email: 'email' },
      })
    ).resolves.not.toThrow();

    await expect(
      validateMandatoryUserProfile(baseCtx, provider, {
        ...interaction,
        profile: { phone: '123456' },
      })
    ).resolves.not.toThrow();
  });
});
