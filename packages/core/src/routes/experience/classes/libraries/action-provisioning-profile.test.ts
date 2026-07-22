import { UsersPasswordEncryptionMethod } from '@logto/schemas';
import { ZodError } from 'zod';

import {
  appendPasswordPayloadToActionProvisioningProfile,
  toActionProvisioningProfile,
} from './action-provisioning-profile.js';

describe('toActionProvisioningProfile', () => {
  it('returns the action provisioning profile with whitelisted fields', () => {
    const provisioningProfile = toActionProvisioningProfile({
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
      toActionProvisioningProfile({
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
      toActionProvisioningProfile({
        passwordEncrypted: 'hashed-password',
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      })
    ).toThrow(ZodError);

    expect(() =>
      toActionProvisioningProfile({
        passwordEncrypted: 'hashed-password',
      })
    ).toThrow(ZodError);

    expect(() =>
      toActionProvisioningProfile({
        passwordEncryptionMethod: UsersPasswordEncryptionMethod.Argon2i,
      })
    ).toThrow(ZodError);
  });

  it('validates the profile field with userProfileGuard', () => {
    expect(() =>
      toActionProvisioningProfile({
        profile: {
          givenName: 1,
        },
      })
    ).toThrow(ZodError);
  });

  it('accepts partial action provisioning profiles', () => {
    expect(toActionProvisioningProfile({ name: 'Jane Doe' })).toEqual({
      name: 'Jane Doe',
    });
  });
});

describe('appendPasswordPayloadToActionProvisioningProfile', () => {
  it('appends a Logto-generated Argon2i password hash to the provisioning profile', async () => {
    const provisioningProfile = {
      primaryEmail: 'jane@example.com',
      customData: {
        plan: 'pro',
      },
    };

    const result = await appendPasswordPayloadToActionProvisioningProfile(
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
