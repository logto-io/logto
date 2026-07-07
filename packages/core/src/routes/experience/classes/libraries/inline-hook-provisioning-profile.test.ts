import { UsersPasswordEncryptionMethod } from '@logto/schemas';
import { ZodError } from 'zod';

import { toHookProvisioningProfile } from './inline-hook-provisioning-profile.js';

describe('toHookProvisioningProfile', () => {
  it('returns the hook provisioning profile with whitelisted fields', () => {
    const provisioningProfile = toHookProvisioningProfile({
      name: 'Jane Doe',
      avatar: 'https://example.com/avatar.png',
      username: 'jane',
      primaryEmail: 'jane@example.com',
      primaryPhone: '+1234567890',
      profile: {
        givenName: 'Jane',
        familyName: 'Doe',
      },
      customData: {
        plan: 'pro',
      },
      passwordEncrypted: 'hashed-password',
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
    });

    expect(provisioningProfile).toEqual({
      name: 'Jane Doe',
      avatar: 'https://example.com/avatar.png',
      username: 'jane',
      primaryEmail: 'jane@example.com',
      primaryPhone: '+1234567890',
      profile: {
        givenName: 'Jane',
        familyName: 'Doe',
      },
      customData: {
        plan: 'pro',
      },
      passwordEncrypted: 'hashed-password',
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
    });
  });

  it('rejects non-whitelisted top-level user fields', () => {
    expect(() =>
      toHookProvisioningProfile({
        id: 'user-id',
        applicationId: 'application-id',
        isSuspended: true,
        isPasswordExpired: true,
        identities: {},
        mfaVerifications: [],
        lastSignInAt: Date.now(),
        logtoConfig: {},
        passwordDigest: 'password-digest',
        passwordAlgorithm: UsersPasswordEncryptionMethod.Argon2i,
      })
    ).toThrow(ZodError);
  });

  it('validates the profile field with userProfileGuard', () => {
    expect(() =>
      toHookProvisioningProfile({
        profile: {
          givenName: 1,
        },
      })
    ).toThrow(ZodError);
  });

  it('requires password fields to be provided together', () => {
    expect(() =>
      toHookProvisioningProfile({
        passwordEncrypted: 'hashed-password',
      })
    ).toThrow(ZodError);

    expect(() =>
      toHookProvisioningProfile({
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      })
    ).toThrow(ZodError);

    expect(() =>
      toHookProvisioningProfile({
        passwordEncrypted: null,
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      })
    ).toThrow(ZodError);

    expect(() =>
      toHookProvisioningProfile({
        passwordEncrypted: 'hashed-password',
        passwordEncryptionMethod: null,
      })
    ).toThrow(ZodError);

    expect(() =>
      toHookProvisioningProfile({
        passwordEncrypted: '',
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      })
    ).toThrow(ZodError);
  });

  it('accepts partial hook provisioning profiles', () => {
    expect(toHookProvisioningProfile({ name: 'Jane Doe' })).toEqual({
      name: 'Jane Doe',
    });
  });
});
