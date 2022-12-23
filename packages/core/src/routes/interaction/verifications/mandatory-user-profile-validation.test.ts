import { InteractionEvent, MissingProfile, SignInIdentifier } from '@logto/schemas';
import { mockEsm, mockEsmWithActual, pickDefault } from '@logto/shared/esm';
import type { Provider } from 'oidc-provider';

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

const validateMandatoryUserProfile = await pickDefault(
  import('./mandatory-user-profile-validation.js')
);

describe('validateMandatoryUserProfile', () => {
  const provider = createMockProvider();
  const baseCtx = {
    ...createContextWithRouteParameters(),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    interactionDetails: {} as Awaited<ReturnType<Provider['interactionDetails']>>,
    signInExperience: mockSignInExperience,
  };
  const interaction: IdentifierVerifiedInteractionResult = {
    event: InteractionEvent.SignIn,
    accountId: 'foo',
  };

  it('username and password missing but required', async () => {
    await expect(validateMandatoryUserProfile(baseCtx, interaction)).rejects.toMatchError(
      new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: [MissingProfile.password, MissingProfile.username] }
      )
    );

    await expect(
      validateMandatoryUserProfile(baseCtx, {
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

    await expect(validateMandatoryUserProfile(baseCtx, interaction)).resolves.not.toThrow();
  });

  it('email missing but required', async () => {
    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
      },
    };

    await expect(validateMandatoryUserProfile(ctx, interaction)).rejects.toMatchError(
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

    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
      },
    };

    await expect(validateMandatoryUserProfile(ctx, interaction)).resolves.not.toThrow();
  });

  it('phone missing but required', async () => {
    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: { identifiers: [SignInIdentifier.Sms], password: false, verify: true },
      },
    };

    await expect(validateMandatoryUserProfile(ctx, interaction)).rejects.toMatchError(
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

    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: { identifiers: [SignInIdentifier.Sms], password: false, verify: true },
      },
    };

    await expect(validateMandatoryUserProfile(ctx, interaction)).resolves.not.toThrow();
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

    await expect(validateMandatoryUserProfile(ctx, interaction)).rejects.toMatchError(
      new RequestError(
        { code: 'user.missing_profile', status: 422 },
        { missingProfile: [MissingProfile.emailOrPhone] }
      )
    );

    await expect(
      validateMandatoryUserProfile(ctx, {
        ...interaction,
        profile: { email: 'email' },
      })
    ).resolves.not.toThrow();

    await expect(
      validateMandatoryUserProfile(ctx, {
        ...interaction,
        profile: { phone: '123456' },
      })
    ).resolves.not.toThrow();
  });
});
