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
  it('should return proper ID Token claims', () => {
    expect(getAcceptedUserClaims(use.idToken, 'openid profile', {}, [])).toEqual(
      profileExpectation
    );

    expect(getAcceptedUserClaims(use.idToken, 'openid profile email phone', {}, [])).toEqual([
      ...profileExpectation,
      'email',
      'email_verified',
      'phone_number',
      'phone_number_verified',
    ]);

    expect(
      getAcceptedUserClaims(use.idToken, 'openid profile custom_data identities', {}, [])
    ).toEqual(profileExpectation);

    expect(
      getAcceptedUserClaims(use.idToken, 'openid profile email', {}, ['email_verified'])
    ).toEqual([...profileExpectation, 'email']);
  });

  it('should return proper Userinfo claims', () => {
    expect(
      getAcceptedUserClaims(use.userinfo, 'openid profile custom_data identities', {}, [])
    ).toEqual([...profileExpectation, 'custom_data', 'identities']);
  });

  // Ignore `_claims` since [Claims Parameter](https://github.com/panva/node-oidc-provider/tree/main/docs#featuresclaimsparameter) is not enabled
  it('should ignore claims parameter', () => {
    expect(
      getAcceptedUserClaims(use.idToken, 'openid profile custom_data', { email: null }, [])
    ).toEqual(profileExpectation);
  });
});
