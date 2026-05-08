import assert from 'node:assert/strict';
import test from 'node:test';

import { AccountCenterControlValue, ConnectorPlatform, MfaPolicy } from '@logto/schemas';

import type * as SecurityPageModule from './security-page';

const {
  canSetInitialPasswordWithoutVerification,
  isEditableField,
  canOpenPasswordEditFlow,
  hasAvailableSecurityVerificationMethod,
  hasVisibleSecuritySection,
  hasVisibleSocialSection,
} = (await import(new URL('security-page.ts', import.meta.url).href)) as typeof SecurityPageModule;

void test('hasVisibleSecuritySection returns false when account center is disabled', () => {
  assert.equal(
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
    }),
    false
  );
});

void test('hasVisibleSecuritySection returns true when any supported field is visible', () => {
  assert.equal(
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
    }),
    true
  );
});

void test('hasVisibleSecuritySection returns true when social field is visible', () => {
  assert.equal(
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
    ),
    true
  );
});

void test('hasVisibleSecuritySection returns true when delete account URL is configured', () => {
  assert.equal(
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
    }),
    true
  );
});

void test('hasVisibleSocialSection returns false when no available social connector exists', () => {
  assert.equal(hasVisibleSocialSection(AccountCenterControlValue.Edit), false);
  assert.equal(
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
    }),
    false
  );
});

void test('isEditableField returns true only for edit control', () => {
  assert.equal(isEditableField(AccountCenterControlValue.Edit), true);
  assert.equal(isEditableField(AccountCenterControlValue.ReadOnly), false);
  assert.equal(isEditableField(), false);
});

void test('hasAvailableSecurityVerificationMethod returns true for password, primary email, or primary phone', () => {
  assert.equal(hasAvailableSecurityVerificationMethod({ hasPassword: true }), true);
  assert.equal(hasAvailableSecurityVerificationMethod({ primaryEmail: 'foo@example.com' }), true);
  assert.equal(hasAvailableSecurityVerificationMethod({ primaryPhone: '+15555555555' }), true);
  assert.equal(hasAvailableSecurityVerificationMethod({ hasPassword: false }), false);
  assert.equal(hasAvailableSecurityVerificationMethod(), false);
});

void test('canSetInitialPasswordWithoutVerification requires explicit no-password user info', () => {
  assert.equal(
    canSetInitialPasswordWithoutVerification({
      hasPassword: false,
    }),
    true
  );
  assert.equal(canSetInitialPasswordWithoutVerification({}), false);
  assert.equal(canSetInitialPasswordWithoutVerification(), false);
  assert.equal(
    canSetInitialPasswordWithoutVerification({
      hasPassword: false,
      primaryEmail: 'foo@example.com',
    }),
    false
  );
  assert.equal(
    canSetInitialPasswordWithoutVerification({
      hasPassword: false,
      primaryPhone: '+15555555555',
    }),
    false
  );
});

void test('canSetInitialPasswordWithoutVerification rejects when email or phone fields are hidden', () => {
  const readableFields = {
    username: AccountCenterControlValue.Edit,
    email: AccountCenterControlValue.ReadOnly,
    phone: AccountCenterControlValue.ReadOnly,
    password: AccountCenterControlValue.Edit,
    social: AccountCenterControlValue.Off,
  };
  assert.equal(
    canSetInitialPasswordWithoutVerification({ hasPassword: false }, readableFields),
    true
  );
  assert.equal(
    canSetInitialPasswordWithoutVerification(
      { hasPassword: false },
      { ...readableFields, email: AccountCenterControlValue.Off }
    ),
    false
  );
  assert.equal(
    canSetInitialPasswordWithoutVerification(
      { hasPassword: false },
      { ...readableFields, phone: AccountCenterControlValue.Off }
    ),
    false
  );
});

void test('canOpenPasswordEditFlow supports verified update and initial password setup paths', () => {
  assert.equal(
    canOpenPasswordEditFlow(AccountCenterControlValue.Edit, {
      hasPassword: false,
      primaryEmail: 'foo@example.com',
    }),
    true
  );
  assert.equal(
    canOpenPasswordEditFlow(AccountCenterControlValue.Edit, {
      hasPassword: false,
    }),
    true
  );
  assert.equal(canOpenPasswordEditFlow(AccountCenterControlValue.Edit, {}), false);
  assert.equal(
    canOpenPasswordEditFlow(AccountCenterControlValue.Edit, {
      hasPassword: true,
    }),
    true
  );
  assert.equal(
    canOpenPasswordEditFlow(AccountCenterControlValue.ReadOnly, {
      hasPassword: true,
    }),
    false
  );
  assert.equal(canOpenPasswordEditFlow(AccountCenterControlValue.Edit), false);
});
