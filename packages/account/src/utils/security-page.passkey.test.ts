import { AccountCenterControlValue, MfaFactor, MfaPolicy } from '@logto/schemas';

import {
  getPasskeyFieldControl,
  hasVisibleMfaSection,
  hasVisiblePasskeySection,
  isPasskeySignInEnabled,
} from './security-page';

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

  it('hasVisibleMfaSection ignores passkey sign-in and only depends on MFA factors', () => {
    expect(hasVisibleMfaSection(AccountCenterControlValue.Edit, experienceSettings)).toBe(false);
    expect(
      hasVisibleMfaSection(AccountCenterControlValue.Edit, {
        ...experienceSettings,
        mfa: { factors: [MfaFactor.WebAuthn], policy: MfaPolicy.UserControlled },
      })
    ).toBe(true);
  });

  it('hasVisiblePasskeySection requires both a visible control and passkey sign-in enabled', () => {
    expect(hasVisiblePasskeySection(AccountCenterControlValue.Edit, experienceSettings)).toBe(true);
    expect(hasVisiblePasskeySection(AccountCenterControlValue.ReadOnly, experienceSettings)).toBe(
      true
    );
    expect(hasVisiblePasskeySection(AccountCenterControlValue.Off, experienceSettings)).toBe(false);
    expect(hasVisiblePasskeySection(undefined, experienceSettings)).toBe(false);
    expect(
      hasVisiblePasskeySection(AccountCenterControlValue.Edit, {
        ...experienceSettings,
        passkeySignIn: { enabled: false },
      })
    ).toBe(false);
  });

  it('getPasskeyFieldControl falls back to the MFA control when no passkey control is set', () => {
    expect(
      getPasskeyFieldControl(AccountCenterControlValue.ReadOnly, AccountCenterControlValue.Edit)
    ).toBe(AccountCenterControlValue.ReadOnly);
    expect(getPasskeyFieldControl(undefined, AccountCenterControlValue.Edit)).toBe(
      AccountCenterControlValue.Edit
    );

    const noControl: AccountCenterControlValue | undefined = undefined;
    expect(getPasskeyFieldControl(noControl, noControl)).toBeUndefined();
  });
});
