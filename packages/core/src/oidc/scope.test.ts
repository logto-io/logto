import { getUserClaims } from './scope.js';

const use = {
  idToken: 'id_token',
  userinfo: 'userinfo',
};

describe('OIDC getUserClaims()', () => {
  it('should return proper ID Token claims', () => {
    expect(getUserClaims(use.idToken, 'openid profile', {}, [])).toEqual([
      'name',
      'picture',
      'username',
    ]);

    expect(getUserClaims(use.idToken, 'openid profile email phone', {}, [])).toEqual([
      'name',
      'picture',
      'username',
      'email',
      'email_verified',
      'phone_number',
      'phone_number_verified',
    ]);

    expect(getUserClaims(use.idToken, 'openid profile custom_data identities', {}, [])).toEqual([
      'name',
      'picture',
      'username',
    ]);

    expect(getUserClaims(use.idToken, 'openid profile email', {}, ['email_verified'])).toEqual([
      'name',
      'picture',
      'username',
      'email',
    ]);
  });

  it('should return proper Userinfo claims', () => {
    expect(getUserClaims(use.userinfo, 'openid profile custom_data identities', {}, [])).toEqual([
      'name',
      'picture',
      'username',
      'custom_data',
      'identities',
    ]);
  });

  // Ignore `_claims` since [Claims Parameter](https://github.com/panva/node-oidc-provider/tree/main/docs#featuresclaimsparameter) is not enabled
  it('should ignore claims parameter', () => {
    expect(getUserClaims(use.idToken, 'openid profile custom_data', { email: null }, [])).toEqual([
      'name',
      'picture',
      'username',
    ]);
  });
});
