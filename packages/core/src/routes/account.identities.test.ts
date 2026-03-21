import { SignInIdentifier } from '@logto/schemas';

import { mockSignInExperience } from '#src/__mocks__/sign-in-experience.js';
import { mockUser, mockUserWebAuthnMfaVerification } from '#src/__mocks__/user.js';

import {
  canRemoveSocialIdentity,
  hasEnterpriseSsoSignInMethod,
  hasPasskeySignInMethod,
} from './account/identities.js';

const buildUser = () => ({
  ...mockUser,
  username: null,
  primaryEmail: null,
  primaryPhone: null,
  passwordEncrypted: null,
  passwordEncryptionMethod: null,
  identities: { github: { userId: 'github-user', details: {} } },
  mfaVerifications: [],
});

const signIn = {
  methods: [
    {
      identifier: SignInIdentifier.Username,
      password: true,
      verificationCode: false,
      isPasswordPrimary: true,
    },
  ],
};

describe('account social identity unlink guard', () => {
  it('blocks removing the last sign-in social identity', () => {
    expect(
      canRemoveSocialIdentity({
        user: buildUser(),
        signIn,
        socialSignInConnectorTargets: ['github'],
        targetToRemove: 'github',
        hasPasskeySignIn: false,
        hasEnterpriseSsoSignIn: false,
      })
    ).toBe(false);
  });

  it('allows removing a non-sign-in social target even if no sign-in method remains', () => {
    const user = {
      ...buildUser(),
      identities: { custom_social: { userId: 'custom-social-user', details: {} } },
    };

    expect(
      canRemoveSocialIdentity({
        user,
        signIn,
        socialSignInConnectorTargets: [...mockSignInExperience.socialSignInConnectorTargets],
        targetToRemove: 'custom_social',
        hasPasskeySignIn: false,
        hasEnterpriseSsoSignIn: false,
      })
    ).toBe(true);
  });

  it('treats passkey as a remaining sign-in method only when passkey sign-in is enabled', () => {
    const user = {
      ...buildUser(),
      mfaVerifications: [mockUserWebAuthnMfaVerification],
    };

    expect(
      hasPasskeySignInMethod({
        user,
        isPasskeySignInEnabled: true,
      })
    ).toBe(true);
    expect(
      canRemoveSocialIdentity({
        user,
        signIn,
        socialSignInConnectorTargets: ['github'],
        targetToRemove: 'github',
        hasPasskeySignIn: hasPasskeySignInMethod({
          user,
          isPasskeySignInEnabled: true,
        }),
        hasEnterpriseSsoSignIn: false,
      })
    ).toBe(true);
    expect(
      hasPasskeySignInMethod({
        user,
        isPasskeySignInEnabled: false,
      })
    ).toBe(false);
  });

  it('treats enterprise SSO as a remaining sign-in method only when SSO is enabled', () => {
    expect(
      hasEnterpriseSsoSignInMethod({
        ssoIdentityCount: 1,
        isSingleSignOnEnabled: true,
      })
    ).toBe(true);
    expect(
      canRemoveSocialIdentity({
        user: buildUser(),
        signIn,
        socialSignInConnectorTargets: ['github'],
        targetToRemove: 'github',
        hasPasskeySignIn: false,
        hasEnterpriseSsoSignIn: hasEnterpriseSsoSignInMethod({
          ssoIdentityCount: 1,
          isSingleSignOnEnabled: true,
        }),
      })
    ).toBe(true);
    expect(
      hasEnterpriseSsoSignInMethod({
        ssoIdentityCount: 1,
        isSingleSignOnEnabled: false,
      })
    ).toBe(false);
  });
});
