import { UsersPasswordEncryptionMethod } from '@logto/schemas';
import { ZodError } from 'zod';

import {
  appendPasswordPayloadToInlineHookProvisioningProfile,
  toHookProvisioningProfile,
} from './inline-hook-provisioning-profile.js';

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

  it('rejects script-supplied password hash fields', () => {
    expect(() =>
      toHookProvisioningProfile({
        passwordEncrypted: 'hashed-password',
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      })
    ).toThrow(ZodError);

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

  it('accepts partial hook provisioning profiles', () => {
    expect(toHookProvisioningProfile({ name: 'Jane Doe' })).toEqual({
      name: 'Jane Doe',
    });
  });
});

describe('appendPasswordPayloadToInlineHookProvisioningProfile', () => {
  it('appends a Logto-generated Argon2i password hash to the provisioning profile', async () => {
    const provisioningProfile = {
      primaryEmail: 'jane@example.com',
      customData: {
        plan: 'pro',
      },
    };

    const result = await appendPasswordPayloadToInlineHookProvisioningProfile(
      provisioningProfile,
      'P@ssw0rd'
    );

    expect(result).toMatchObject({
      ...provisioningProfile,
      passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
    });
    expect(result.passwordEncrypted).toContain('argon2');
    expect(result.passwordEncrypted).not.toBe('P@ssw0rd');
  });
});
