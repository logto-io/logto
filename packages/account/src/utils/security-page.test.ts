import { AccountCenterControlValue, ConnectorPlatform, MfaPolicy } from '@logto/schemas';

import {
  canSetInitialPasswordWithoutVerification,
  isEditableField,
  canOpenPasswordEditFlow,
  hasAvailableSecurityVerificationMethod,
  hasVisibleSecuritySection,
  hasVisibleSocialSection,
} from './security-page';

describe('security-page utils', () => {
  it('hasVisibleSecuritySection returns false when account center is disabled', () => {
    expect(
      hasVisibleSecuritySection({
        enabled: false,
        deleteAccountUrl: null,
        fields: {
          username: AccountCenterControlValue.Edit,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
        },
      })
    ).toBe(false);
  });

  it('hasVisibleSecuritySection returns true when any supported field is visible', () => {
    expect(
      hasVisibleSecuritySection({
        enabled: true,
        deleteAccountUrl: null,
        fields: {
          username: AccountCenterControlValue.ReadOnly,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
        },
      })
    ).toBe(true);
  });

  it('hasVisibleSecuritySection returns true when social field is visible', () => {
    expect(
      hasVisibleSecuritySection(
        {
          enabled: true,
          deleteAccountUrl: null,
          fields: {
            username: AccountCenterControlValue.Off,
            email: AccountCenterControlValue.Off,
            phone: AccountCenterControlValue.Off,
            password: AccountCenterControlValue.Off,
            social: AccountCenterControlValue.Edit,
          },
        },
        {
          socialConnectors: [
            {
              id: 'google-web',
              target: 'google',
              platform: ConnectorPlatform.Web,
              name: { en: 'Google' },
              logo: '',
              logoDark: '',
            },
          ],
          mfa: { factors: [], policy: MfaPolicy.UserControlled },
        }
      )
    ).toBe(true);
  });

  it('hasVisibleSecuritySection returns true when delete account URL is configured', () => {
    expect(
      hasVisibleSecuritySection({
        enabled: true,
        deleteAccountUrl: 'https://example.com/delete-account',
        fields: {
          username: AccountCenterControlValue.Off,
          email: AccountCenterControlValue.Off,
          phone: AccountCenterControlValue.Off,
          password: AccountCenterControlValue.Off,
          social: AccountCenterControlValue.Off,
          mfa: AccountCenterControlValue.Off,
        },
      })
    ).toBe(true);
  });

  it('hasVisibleSocialSection returns false when no available social connector exists', () => {
    expect(hasVisibleSocialSection(AccountCenterControlValue.Edit)).toBe(false);
    expect(
      hasVisibleSocialSection(AccountCenterControlValue.Edit, {
        socialConnectors: [
          {
            id: 'google-native',
            target: 'google',
            platform: ConnectorPlatform.Native,
            name: { en: 'Google' },
            logo: '',
            logoDark: '',
          },
        ],
        mfa: { factors: [], policy: MfaPolicy.UserControlled },
      })
    ).toBe(false);
  });

  it('isEditableField returns true only for edit control', () => {
    expect(isEditableField(AccountCenterControlValue.Edit)).toBe(true);
    expect(isEditableField(AccountCenterControlValue.ReadOnly)).toBe(false);
    expect(isEditableField()).toBe(false);
  });

  it('hasAvailableSecurityVerificationMethod returns true for password, primary email, or primary phone', () => {
    expect(hasAvailableSecurityVerificationMethod({ hasPassword: true })).toBe(true);
    expect(hasAvailableSecurityVerificationMethod({ primaryEmail: 'foo@example.com' })).toBe(true);
    expect(hasAvailableSecurityVerificationMethod({ primaryPhone: '+15555555555' })).toBe(true);
    expect(hasAvailableSecurityVerificationMethod({ hasPassword: false })).toBe(false);
    expect(hasAvailableSecurityVerificationMethod()).toBe(false);
  });

  it('canSetInitialPasswordWithoutVerification requires explicit no-password user info', () => {
    expect(
      canSetInitialPasswordWithoutVerification({
        hasPassword: false,
      })
    ).toBe(true);
    expect(canSetInitialPasswordWithoutVerification({})).toBe(false);
    expect(canSetInitialPasswordWithoutVerification()).toBe(false);
    expect(
      canSetInitialPasswordWithoutVerification({
        hasPassword: false,
        primaryEmail: 'foo@example.com',
      })
    ).toBe(false);
    expect(
      canSetInitialPasswordWithoutVerification({
        hasPassword: false,
        primaryPhone: '+15555555555',
      })
    ).toBe(false);
  });

  it('canSetInitialPasswordWithoutVerification rejects when email or phone fields are hidden', () => {
    const readableFields = {
      username: AccountCenterControlValue.Edit,
      email: AccountCenterControlValue.ReadOnly,
      phone: AccountCenterControlValue.ReadOnly,
      password: AccountCenterControlValue.Edit,
      social: AccountCenterControlValue.Off,
    };

    expect(canSetInitialPasswordWithoutVerification({ hasPassword: false }, readableFields)).toBe(
      true
    );
    expect(
      canSetInitialPasswordWithoutVerification(
        { hasPassword: false },
        { ...readableFields, email: AccountCenterControlValue.Off }
      )
    ).toBe(false);
    expect(
      canSetInitialPasswordWithoutVerification(
        { hasPassword: false },
        { ...readableFields, phone: AccountCenterControlValue.Off }
      )
    ).toBe(false);
  });

  it('canOpenPasswordEditFlow supports verified update and initial password setup paths', () => {
    expect(
      canOpenPasswordEditFlow(AccountCenterControlValue.Edit, {
        hasPassword: false,
        primaryEmail: 'foo@example.com',
      })
    ).toBe(true);
    expect(
      canOpenPasswordEditFlow(AccountCenterControlValue.Edit, {
        hasPassword: false,
      })
    ).toBe(true);
    expect(canOpenPasswordEditFlow(AccountCenterControlValue.Edit, {})).toBe(false);
    expect(
      canOpenPasswordEditFlow(AccountCenterControlValue.Edit, {
        hasPassword: true,
      })
    ).toBe(true);
    expect(
      canOpenPasswordEditFlow(AccountCenterControlValue.ReadOnly, {
        hasPassword: true,
      })
    ).toBe(false);
    expect(canOpenPasswordEditFlow(AccountCenterControlValue.Edit)).toBe(false);
  });
});
