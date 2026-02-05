import { getAcceptedUserClaims } from './scope.js';

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
});
