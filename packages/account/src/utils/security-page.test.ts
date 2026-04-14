import assert from 'node:assert/strict';
import test from 'node:test';

import { AccountCenterControlValue, ConnectorPlatform, MfaPolicy } from '@logto/schemas';

import type * as SecurityPageModule from './security-page';

const {
  isEditableField,
  canOpenPasswordEditFlow,
  hasVisibleSecuritySection,
  hasVisibleSocialSection,
} = (await import(new URL('security-page.ts', import.meta.url).href)) as typeof SecurityPageModule;

void test('hasVisibleSecuritySection returns false when account center is disabled', () => {
  assert.equal(
    hasVisibleSecuritySection({
      enabled: false,
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

void test('canOpenPasswordEditFlow requires editable password control and a usable identifier', () => {
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
    false
  );
  assert.equal(
    canOpenPasswordEditFlow(AccountCenterControlValue.ReadOnly, {
      hasPassword: true,
    }),
    false
  );
});
