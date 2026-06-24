import {
  AccountCenterControlValue,
  MfaFactor,
  MfaPolicy,
  type UserMfaVerificationResponse,
} from '@logto/schemas';

import {
  getPasskeyFieldControl,
  hasConfiguredSecondFactor,
  hasEnabledSecondFactor,
  hasVisibleMfaSection,
  hasVisiblePasskeySection,
  isPasskeySignInEnabled,
  isWebAuthnConfigurable,
} from './security-page';

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

  it('hasVisibleMfaSection excludes WebAuthn while passkey sign-in is enabled', () => {
    expect(hasVisibleMfaSection(AccountCenterControlValue.Edit, experienceSettings)).toBe(false);

    // Only WebAuthn enabled + passkey sign-in on: WebAuthn is a sign-in passkey, not a second
    // factor, so the section has nothing to manage and stays hidden.
    expect(
      hasVisibleMfaSection(AccountCenterControlValue.Edit, {
        ...experienceSettings,
        mfa: { factors: [MfaFactor.WebAuthn], policy: MfaPolicy.UserControlled },
      })
    ).toBe(false);

    // A real second factor (TOTP) alongside WebAuthn keeps the section visible.
    expect(
      hasVisibleMfaSection(AccountCenterControlValue.Edit, {
        ...experienceSettings,
        mfa: { factors: [MfaFactor.TOTP, MfaFactor.WebAuthn], policy: MfaPolicy.UserControlled },
      })
    ).toBe(true);

    // Passkey sign-in off: WebAuthn still counts as a second factor as before.
    expect(
      hasVisibleMfaSection(AccountCenterControlValue.Edit, {
        ...experienceSettings,
        mfa: { factors: [MfaFactor.WebAuthn], policy: MfaPolicy.UserControlled },
        passkeySignIn: { enabled: false },
      })
    ).toBe(true);
  });

  it('hasEnabledSecondFactor excludes WebAuthn while passkey sign-in is enabled', () => {
    expect(hasEnabledSecondFactor(experienceSettings)).toBe(false);

    expect(
      hasEnabledSecondFactor({
        ...experienceSettings,
        mfa: { factors: [MfaFactor.WebAuthn], policy: MfaPolicy.UserControlled },
      })
    ).toBe(false);

    expect(
      hasEnabledSecondFactor({
        ...experienceSettings,
        mfa: { factors: [MfaFactor.TOTP, MfaFactor.WebAuthn], policy: MfaPolicy.UserControlled },
      })
    ).toBe(true);

    // Passkey sign-in off: WebAuthn counts as a real second factor.
    expect(
      hasEnabledSecondFactor({
        ...experienceSettings,
        mfa: { factors: [MfaFactor.WebAuthn], policy: MfaPolicy.UserControlled },
        passkeySignIn: { enabled: false },
      })
    ).toBe(true);
  });

  it('isWebAuthnConfigurable mirrors the backend binding rule', () => {
    // Passkey sign-in on without a WebAuthn factor: still configurable (passkey doubles as the
    // sign-in credential), matching the backend binding rule.
    expect(isWebAuthnConfigurable(experienceSettings)).toBe(true);

    // WebAuthn is an enabled factor: configurable regardless of passkey sign-in.
    expect(
      isWebAuthnConfigurable({
        ...experienceSettings,
        mfa: { factors: [MfaFactor.WebAuthn], policy: MfaPolicy.UserControlled },
        passkeySignIn: { enabled: false },
      })
    ).toBe(true);

    // Neither a WebAuthn factor nor passkey sign-in: not configurable.
    expect(
      isWebAuthnConfigurable({
        ...experienceSettings,
        mfa: { factors: [MfaFactor.TOTP], policy: MfaPolicy.UserControlled },
        passkeySignIn: { enabled: false },
      })
    ).toBe(false);
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

  it('hasConfiguredSecondFactor does not count WebAuthn while passkey sign-in is enabled', () => {
    const webAuthnOnly = [
      { id: 'webauthn', createdAt: '2026-05-13T00:00:00.000Z', type: MfaFactor.WebAuthn },
    ] satisfies UserMfaVerificationResponse;
    const webAuthnAndTotp = [
      ...webAuthnOnly,
      { id: 'totp', createdAt: '2026-05-13T00:00:00.000Z', type: MfaFactor.TOTP },
    ] satisfies UserMfaVerificationResponse;

    // Passkey sign-in on: a lone WebAuthn credential is a sign-in passkey, not a second factor.
    expect(hasConfiguredSecondFactor(webAuthnOnly, experienceSettings)).toBe(false);
    expect(hasConfiguredSecondFactor(webAuthnAndTotp, experienceSettings)).toBe(true);
    expect(hasConfiguredSecondFactor([], experienceSettings)).toBe(false);
    expect(hasConfiguredSecondFactor(undefined, experienceSettings)).toBe(false);

    // Passkey sign-in off: WebAuthn counts as a configured second factor as before.
    const passkeySignInOff = { ...experienceSettings, passkeySignIn: { enabled: false } };
    expect(hasConfiguredSecondFactor(webAuthnOnly, passkeySignInOff)).toBe(true);
  });
});
