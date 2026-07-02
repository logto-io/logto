import { UsersPasswordEncryptionMethod } from '@logto/schemas';
import { ZodError } from 'zod';

import {
  mergeCustomData,
  mergeInlineHookProvisioningProfileUserData,
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

  it('allows arbitrary customData fields', () => {
    expect(
      toHookProvisioningProfile({
        customData: {
          plan: 'pro',
          campaign: 'spring',
        },
      })
    ).toEqual({
      customData: {
        plan: 'pro',
        campaign: 'spring',
      },
    });
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
        passwordEncrypted: '',
      })
    ).toThrow(ZodError);
  });

  it('accepts partial hook provisioning profiles', () => {
    expect(toHookProvisioningProfile({ name: 'Jane Doe' })).toEqual({
      name: 'Jane Doe',
    });
  });
});

describe('mergeCustomData', () => {
  it('shallow-merges customData into existing data', () => {
    expect(
      mergeCustomData(
        {
          source: 'registration',
          plan: 'free',
        },
        {
          plan: 'pro',
          upstreamId: 'user-1',
        }
      )
    ).toEqual({
      source: 'registration',
      plan: 'pro',
      upstreamId: 'user-1',
    });
  });

  it('returns existing data when customData is missing or empty', () => {
    const existingData = {
      source: 'registration',
    };

    expect(mergeCustomData(existingData)).toBe(existingData);
    expect(mergeCustomData(existingData, {})).toBe(existingData);
  });
});

describe('mergeInlineHookProvisioningProfileUserData', () => {
  it('shallow-merges customData into existing user data', () => {
    const mergedProfile = mergeInlineHookProvisioningProfileUserData(
      {
        customData: {
          source: 'registration',
          plan: 'free',
        },
      },
      {
        name: 'Jane Doe',
        customData: {
          plan: 'pro',
          upstreamId: 'user-1',
        },
      }
    );

    expect(mergedProfile).toEqual({
      name: 'Jane Doe',
      customData: {
        source: 'registration',
        plan: 'pro',
        upstreamId: 'user-1',
      },
    });
  });

  it('leaves customData out when hook data has no effective patch', () => {
    const mergedProfile = mergeInlineHookProvisioningProfileUserData(
      {
        customData: {
          source: 'registration',
        },
      },
      {
        username: 'jane',
        customData: {},
      }
    );

    expect(mergedProfile).toEqual({
      username: 'jane',
    });
  });
});
