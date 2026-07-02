import {
  UsersPasswordEncryptionMethod,
  userMfaDataKey,
  userPasskeySignInDataKey,
} from '@logto/schemas';
import { ZodError } from 'zod';

import {
  mergeInlineHookProvisioningProfileUserData,
  mergeInlineHookUserData,
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
        inlineHook: {
          plan: 'pro',
        },
      },
      logtoConfig: {
        inlineHook: {
          acceptedTerms: true,
        },
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
        inlineHook: {
          plan: 'pro',
        },
      },
      logtoConfig: {
        inlineHook: {
          acceptedTerms: true,
        },
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

  it('rejects customData and logtoConfig writes outside the inlineHook namespace', () => {
    expect(() =>
      toHookProvisioningProfile({
        customData: {
          plan: 'pro',
        },
      })
    ).toThrow(ZodError);

    expect(() =>
      toHookProvisioningProfile({
        logtoConfig: {
          theme: 'dark',
        },
      })
    ).toThrow(ZodError);
  });

  it('rejects reserved internal logtoConfig keys', () => {
    expect(() =>
      toHookProvisioningProfile({
        logtoConfig: {
          [userMfaDataKey]: {
            enabled: true,
          },
        },
      })
    ).toThrow(ZodError);

    expect(() =>
      toHookProvisioningProfile({
        logtoConfig: {
          [userPasskeySignInDataKey]: {
            skipped: true,
          },
        },
      })
    ).toThrow(ZodError);
  });

  it('requires inlineHook namespace data to be an object', () => {
    expect(() =>
      toHookProvisioningProfile({
        customData: {
          inlineHook: true,
        },
      })
    ).toThrow(ZodError);

    expect(() =>
      toHookProvisioningProfile({
        logtoConfig: {
          inlineHook: null,
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
  });
});

describe('mergeInlineHookUserData', () => {
  it('merges only the inlineHook namespace into existing data', () => {
    expect(
      mergeInlineHookUserData(
        {
          source: 'registration',
          inlineHook: {
            oldPlan: 'free',
          },
        },
        {
          inlineHook: {
            plan: 'pro',
          },
        }
      )
    ).toEqual({
      source: 'registration',
      inlineHook: {
        plan: 'pro',
      },
    });
  });

  it('returns existing data when hook data does not include inlineHook', () => {
    const existingData = {
      source: 'registration',
    };

    expect(mergeInlineHookUserData(existingData, {})).toBe(existingData);
  });
});

describe('mergeInlineHookProvisioningProfileUserData', () => {
  it('merges only inlineHook namespaced data and preserves existing top-level keys', () => {
    const mergedProfile = mergeInlineHookProvisioningProfileUserData(
      {
        customData: {
          source: 'registration',
          inlineHook: {
            oldPlan: 'free',
          },
        },
        logtoConfig: {
          [userMfaDataKey]: {
            enabled: true,
          },
          [userPasskeySignInDataKey]: {
            skipped: true,
          },
          inlineHook: {
            oldFlag: true,
          },
        },
      },
      {
        name: 'Jane Doe',
        customData: {
          inlineHook: {
            plan: 'pro',
          },
        },
        logtoConfig: {
          inlineHook: {
            acceptedTerms: true,
          },
        },
      }
    );

    expect(mergedProfile).toEqual({
      name: 'Jane Doe',
      customData: {
        source: 'registration',
        inlineHook: {
          plan: 'pro',
        },
      },
      logtoConfig: {
        [userMfaDataKey]: {
          enabled: true,
        },
        [userPasskeySignInDataKey]: {
          skipped: true,
        },
        inlineHook: {
          acceptedTerms: true,
        },
      },
    });
  });

  it('leaves user data fields out when hook data does not include inlineHook', () => {
    const mergedProfile = mergeInlineHookProvisioningProfileUserData(
      {
        customData: {
          source: 'registration',
        },
        logtoConfig: {
          [userMfaDataKey]: {
            enabled: true,
          },
        },
      },
      {
        username: 'jane',
        customData: {},
        logtoConfig: {},
      }
    );

    expect(mergedProfile).toEqual({
      username: 'jane',
    });
  });
});
