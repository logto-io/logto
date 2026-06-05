import { type UserClaim } from '@logto/core-kit';
import { type User } from '@logto/schemas';

import { mockUser } from '#src/__mocks__/user.js';
import { EnvSet } from '#src/env-set/index.js';

import { getAcceptedUserClaims, getUserClaimsData } from './scope.js';

const use = {
  idToken: 'id_token',
  userinfo: 'userinfo',
} as const;

const profileExpectation = Object.freeze([
  'name',
  'family_name',
  'given_name',
  'middle_name',
  'nickname',
  'preferred_username',
  'profile',
  'picture',
  'website',
  'gender',
  'birthdate',
  'zoneinfo',
  'locale',
  'updated_at',
  'username',
  'created_at',
]);

describe('OIDC getUserClaims()', () => {
  it('should return proper ID Token claims without extended claims by default', () => {
    expect(
      getAcceptedUserClaims({
        use: use.idToken,
        scope: 'openid profile',
        rejected: [],
      })
    ).toEqual(profileExpectation);

    expect(
      getAcceptedUserClaims({
        use: use.idToken,
        scope: 'openid profile email phone',
        rejected: [],
      })
    ).toEqual([
      ...profileExpectation,
      'email',
      'email_verified',
      'phone_number',
      'phone_number_verified',
    ]);

    // Extended claims (custom_data, identities) are not included without enabledExtendedIdTokenClaims
    expect(
      getAcceptedUserClaims({
        use: use.idToken,
        scope: 'openid profile custom_data identities',
        rejected: [],
      })
    ).toEqual(profileExpectation);

    expect(
      getAcceptedUserClaims({
        use: use.idToken,
        scope: 'openid profile email',
        rejected: ['email_verified'],
      })
    ).toEqual([...profileExpectation, 'email']);
  });

  it('should return extended claims when explicitly enabled', () => {
    // With custom_data enabled
    expect(
      getAcceptedUserClaims({
        use: use.idToken,
        scope: 'openid profile custom_data',
        rejected: [],
        enabledExtendedIdTokenClaims: ['custom_data'],
      })
    ).toEqual([...profileExpectation, 'custom_data']);

    // With multiple extended claims enabled
    expect(
      getAcceptedUserClaims({
        use: use.idToken,
        scope: 'openid profile custom_data identities',
        rejected: [],
        enabledExtendedIdTokenClaims: ['custom_data', 'identities', 'sso_identities'],
      })
    ).toEqual([...profileExpectation, 'custom_data', 'identities', 'sso_identities']);

    // With roles, organizations, and organization_roles enabled
    expect(
      getAcceptedUserClaims({
        use: use.idToken,
        scope:
          'openid profile roles urn:logto:scope:organizations urn:logto:scope:organization_roles',
        rejected: [],
        enabledExtendedIdTokenClaims: [
          'roles',
          'organizations',
          'organization_data',
          'organization_roles',
        ],
      })
    ).toEqual([
      ...profileExpectation,
      'roles',
      'organizations',
      'organization_data',
      'organization_roles',
    ]);
  });

  it('should return proper Userinfo claims (not affected by enabledExtendedIdTokenClaims)', () => {
    // Userinfo always includes all claims for the requested scopes
    expect(
      getAcceptedUserClaims({
        use: use.userinfo,
        scope: 'openid profile custom_data identities',
        rejected: [],
      })
    ).toEqual([...profileExpectation, 'custom_data', 'identities', 'sso_identities']);

    // EnabledExtendedIdTokenClaims should not affect userinfo
    expect(
      getAcceptedUserClaims({
        use: use.userinfo,
        scope: 'openid profile custom_data identities',
        rejected: [],
        enabledExtendedIdTokenClaims: [],
      })
    ).toEqual([...profileExpectation, 'custom_data', 'identities', 'sso_identities']);
  });

  it('should ignore account API session scope in getUserClaims()', () => {
    expect(
      getAcceptedUserClaims({
        use: use.idToken,
        scope: 'openid profile urn:logto:scope:sessions',
        rejected: [],
      })
    ).toEqual(profileExpectation);
  });
});

describe('OIDC getUserClaimsData() preferred_username', () => {
  // Unused for the `preferred_username` claim, but required by the function signature.
  const userLibrary = {} as unknown as Parameters<typeof getUserClaimsData>[2];
  const organizationQueries = {} as unknown as Parameters<typeof getUserClaimsData>[3];
  const originalIsDevFeaturesEnabled = EnvSet.values.isDevFeaturesEnabled;

  const getPreferredUsername = async (user: User): Promise<unknown> => {
    const claims: UserClaim[] = ['preferred_username'];
    const data = await getUserClaimsData(user, claims, userLibrary, organizationQueries);
    return data.find(([claim]) => claim === 'preferred_username')?.[1];
  };

  afterAll(() => {
    Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', originalIsDevFeaturesEnabled);
  });

  describe('when dev features are enabled', () => {
    beforeAll(() => {
      Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', true);
    });

    it('falls back to username when profile.preferredUsername is unset', async () => {
      await expect(getPreferredUsername(mockUser)).resolves.toBe(mockUser.username);
    });

    it('uses profile.preferredUsername when set', async () => {
      const user = { ...mockUser, profile: { preferredUsername: 'alice_the_great' } };
      await expect(getPreferredUsername(user)).resolves.toBe('alice_the_great');
    });

    it('returns undefined when both username and profile.preferredUsername are unset', async () => {
      const user = { ...mockUser, username: null };
      await expect(getPreferredUsername(user)).resolves.toBeUndefined();
    });
  });

  describe('when dev features are disabled', () => {
    beforeAll(() => {
      Reflect.set(EnvSet.values, 'isDevFeaturesEnabled', false);
    });

    it('does not fall back to username (preserves prior behavior)', async () => {
      await expect(getPreferredUsername(mockUser)).resolves.toBeUndefined();
    });

    it('still uses an explicit profile.preferredUsername', async () => {
      const user = { ...mockUser, profile: { preferredUsername: 'alice_the_great' } };
      await expect(getPreferredUsername(user)).resolves.toBe('alice_the_great');
    });
  });
});
