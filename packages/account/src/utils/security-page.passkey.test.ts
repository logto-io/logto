import { AccountCenterControlValue, MfaPolicy } from '@logto/schemas';

import { hasVisibleMfaSection, isPasskeySignInEnabled } from './security-page';

jest.mock('@ac/constants/env', () => ({
  __esModule: true,
  isDevFeaturesEnabled: true,
}));

describe('security-page utils with passkey sign-in enabled', () => {
  const experienceSettings = {
    socialConnectors: [],
    mfa: { factors: [], policy: MfaPolicy.UserControlled },
    passkeySignIn: { enabled: true },
  };

  it('isPasskeySignInEnabled returns true when passkey sign-in is enabled', () => {
    expect(isPasskeySignInEnabled(experienceSettings)).toBe(true);
    expect(
      isPasskeySignInEnabled({ ...experienceSettings, passkeySignIn: { enabled: false } })
    ).toBe(false);
    expect(isPasskeySignInEnabled({ ...experienceSettings, passkeySignIn: {} })).toBe(false);
  });

  it('hasVisibleMfaSection returns true when passkey sign-in is enabled without MFA factors', () => {
    expect(hasVisibleMfaSection(AccountCenterControlValue.Edit, experienceSettings)).toBe(true);
  });

  it('hasVisibleMfaSection still requires a visible MFA control', () => {
    expect(hasVisibleMfaSection(AccountCenterControlValue.Off, experienceSettings)).toBe(false);
    expect(hasVisibleMfaSection(undefined, experienceSettings)).toBe(false);
  });
});
