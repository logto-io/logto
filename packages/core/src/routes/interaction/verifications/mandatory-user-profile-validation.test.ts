import { InteractionEvent, MissingProfile, SignInIdentifier } from '@logto/schemas';
import { createMockUtils, pickDefault } from '@logto/shared/esm';
import type Provider from 'oidc-provider';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import RequestError from '#src/errors/RequestError/index.js';
import { MockQueries } from '#src/test-utils/tenant.test.js';
import { createContextWithRouteParameters } from '#src/utils/test-utils.test.js';

import type { IdentifierVerifiedInteractionResult } from '../types/index.js';

const { jest } = import.meta;
const { mockEsm, mockEsmWithActual } = createMockUtils(jest);

const findUserById = jest.fn();
const hasUserWithEmail = jest.fn();
const hasUserWithPhone = jest.fn();

const { users } = new MockQueries({ users: { findUserById, hasUserWithEmail, hasUserWithPhone } });

const { isUserPasswordSet } = mockEsm('../utils/index.js', () => ({
  isUserPasswordSet: jest.fn(),
}));

const validateMandatoryUserProfile = await pickDefault(
  import('./mandatory-user-profile-validation.js')
);

describe('validateMandatoryUserProfile', () => {
  const baseCtx = {
    ...createContextWithRouteParameters(),
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    interactionDetails: {} as Awaited<ReturnType<Provider['interactionDetails']>>,
    signInExperience: mockSignInExperience,
  };

  const interaction: IdentifierVerifiedInteractionResult = {
    event: InteractionEvent.SignIn,
    identifiers: [{ key: 'accountId', value: 'foo' }],
    accountId: 'foo',
  };

  describe('username and password required', () => {
    it('username and password missing should throw', async () => {
      await expect(validateMandatoryUserProfile(users, baseCtx, interaction)).rejects.toMatchError(
        new RequestError(
          { code: 'user.missing_profile', status: 422 },
          { missingProfile: [MissingProfile.password, MissingProfile.username] }
        )
      );

      await expect(
        validateMandatoryUserProfile(users, baseCtx, {
          ...interaction,
          profile: {
            username: 'username',
            password: 'password',
          },
        })
      ).resolves.not.toThrow();
    });

    it('user account has username and password should not throw', async () => {
      findUserById.mockResolvedValueOnce({
        username: 'foo',
      });
      isUserPasswordSet.mockResolvedValueOnce(true);

      await expect(
        validateMandatoryUserProfile(users, baseCtx, interaction)
      ).resolves.not.toThrow();
    });

    it('register user has social profile and username should not throw', async () => {
      await expect(
        validateMandatoryUserProfile(users, baseCtx, {
          event: InteractionEvent.Register,
          profile: {
            username: 'foo',
            connectorId: 'logto',
          },
        })
      ).resolves.not.toThrow();
    });
  });

  describe('email required', () => {
    const emailRequiredCtx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: { identifiers: [SignInIdentifier.Email], password: false, verify: true },
      },
    };

    it('email missing but required should throw', async () => {
      await expect(
        validateMandatoryUserProfile(users, emailRequiredCtx, interaction)
      ).rejects.toMatchError(
        new RequestError(
          { code: 'user.missing_profile', status: 422 },
          { missingProfile: [MissingProfile.email] }
        )
      );
    });

    it('user account has email should not throw', async () => {
      findUserById.mockResolvedValueOnce({
        primaryEmail: 'email',
      });

      await expect(
        validateMandatoryUserProfile(users, emailRequiredCtx, interaction)
      ).resolves.not.toThrow();
    });

    it('profile includes email should not throw', async () => {
      await expect(
        validateMandatoryUserProfile(users, emailRequiredCtx, {
          ...interaction,
          profile: {
            email: 'email',
          },
        })
      ).resolves.not.toThrow();
    });

    it('identifier includes social with verified email but email occupied should throw', async () => {
      hasUserWithEmail.mockResolvedValueOnce(true);

      await expect(
        validateMandatoryUserProfile(users, emailRequiredCtx, {
          ...interaction,
          identifiers: [
            ...interaction.identifiers,
            { key: 'social', userInfo: { email: 'email', id: 'foo' }, connectorId: 'logto' },
          ],
        })
      ).rejects.toMatchError(
        new RequestError(
          { code: 'user.missing_profile', status: 422 },
          { missingProfile: [MissingProfile.email], registeredSocialIdentity: { email: 'email' } }
        )
      );
    });

    it('identifier includes social with verified email should not throw', async () => {
      hasUserWithEmail.mockResolvedValueOnce(false);

      const updatedInteraction = await validateMandatoryUserProfile(users, emailRequiredCtx, {
        ...interaction,
        identifiers: [
          ...interaction.identifiers,
          { key: 'social', userInfo: { email: 'email', id: 'foo' }, connectorId: 'logto' },
        ],
      });

      expect(updatedInteraction.profile).toEqual({ email: 'email' });
    });
  });

  describe('phone required', () => {
    const phoneRequiredCtx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: { identifiers: [SignInIdentifier.Phone], password: false, verify: true },
      },
    };

    it('phone missing should throw', async () => {
      await expect(
        validateMandatoryUserProfile(users, phoneRequiredCtx, interaction)
      ).rejects.toMatchError(
        new RequestError(
          { code: 'user.missing_profile', status: 422 },
          { missingProfile: [MissingProfile.phone] }
        )
      );
    });

    it('user account has phone should not throw', async () => {
      findUserById.mockResolvedValueOnce({
        primaryPhone: 'phone',
      });

      await expect(
        validateMandatoryUserProfile(users, phoneRequiredCtx, interaction)
      ).resolves.not.toThrow();
    });

    it('profile includes phone should not throw', async () => {
      await expect(
        validateMandatoryUserProfile(users, phoneRequiredCtx, {
          ...interaction,
          profile: {
            phone: '123456',
          },
        })
      ).resolves.not.toThrow();
    });

    it('identifier includes social with verified phone but phone occupied should throw', async () => {
      hasUserWithPhone.mockResolvedValueOnce(true);

      await expect(
        validateMandatoryUserProfile(users, phoneRequiredCtx, {
          ...interaction,
          identifiers: [
            ...interaction.identifiers,
            { key: 'social', userInfo: { phone: '123456', id: 'foo' }, connectorId: 'logto' },
          ],
        })
      ).rejects.toMatchError(
        new RequestError(
          { code: 'user.missing_profile', status: 422 },
          { missingProfile: [MissingProfile.phone], registeredSocialIdentity: { phone: '123456' } }
        )
      );
    });

    it('identifier includes social with verified phone should not throw', async () => {
      hasUserWithPhone.mockResolvedValueOnce(false);

      const updatedInteraction = await validateMandatoryUserProfile(users, phoneRequiredCtx, {
        ...interaction,
        identifiers: [
          ...interaction.identifiers,
          { key: 'social', userInfo: { phone: '123456', id: 'foo' }, connectorId: 'logto' },
        ],
      });

      expect(updatedInteraction.profile).toEqual({ phone: '123456' });
    });
  });

  describe('email or Phone required', () => {
    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: {
          identifiers: [SignInIdentifier.Email, SignInIdentifier.Phone],
          password: false,
          verify: true,
        },
      },
    };

    it('missing email and phone should throw', async () => {
      await expect(validateMandatoryUserProfile(users, ctx, interaction)).rejects.toMatchError(
        new RequestError(
          { code: 'user.missing_profile', status: 422 },
          { missingProfile: [MissingProfile.emailOrPhone] }
        )
      );
    });

    it('profile includes email should not throw', async () => {
      await expect(
        validateMandatoryUserProfile(users, ctx, {
          ...interaction,
          profile: { email: 'email' },
        })
      ).resolves.not.toThrow();
    });

    it('profile includes phone should not throw', async () => {
      await expect(
        validateMandatoryUserProfile(users, ctx, {
          ...interaction,
          profile: { phone: '123456' },
        })
      ).resolves.not.toThrow();
    });

    it('identifier includes social with verified email should not throw', async () => {
      const updatedInteraction = await validateMandatoryUserProfile(users, ctx, {
        ...interaction,
        identifiers: [
          ...interaction.identifiers,
          { key: 'social', userInfo: { email: 'email', id: 'foo' }, connectorId: 'logto' },
        ],
      });

      expect(updatedInteraction.profile).toEqual({ email: 'email' });
    });

    it('identifier includes social with verified phone should not throw', async () => {
      const updatedInteraction = await validateMandatoryUserProfile(users, ctx, {
        ...interaction,
        identifiers: [
          ...interaction.identifiers,
          { key: 'social', userInfo: { phone: '123456', id: 'foo' }, connectorId: 'logto' },
        ],
      });

      expect(updatedInteraction.profile).toEqual({ phone: '123456' });
    });
  });

  it('register fallback profile validation', async () => {
    const ctx = {
      ...baseCtx,
      signInExperience: {
        ...mockSignInExperience,
        signUp: {
          identifiers: [],
          password: false,
          verify: false,
        },
      },
    };

    await expect(
      validateMandatoryUserProfile(users, ctx, {
        event: InteractionEvent.Register,
        profile: { password: 'password' },
      })
    ).rejects.toMatchError(new RequestError({ code: 'user.missing_profile', status: 422 }));

    await expect(
      validateMandatoryUserProfile(users, ctx, {
        event: InteractionEvent.Register,
        profile: { username: 'username' },
      })
    ).resolves.not.toThrow();

    await expect(
      validateMandatoryUserProfile(users, ctx, {
        event: InteractionEvent.Register,
        profile: { email: 'email' },
      })
    ).resolves.not.toThrow();

    await expect(
      validateMandatoryUserProfile(users, ctx, {
        event: InteractionEvent.Register,
        profile: { phone: '123456' },
      })
    ).resolves.not.toThrow();

    await expect(
      validateMandatoryUserProfile(users, ctx, {
        event: InteractionEvent.Register,
        profile: { connectorId: 'logto' },
      })
    ).resolves.not.toThrow();
  });
});
