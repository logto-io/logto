import assert from 'node:assert/strict';
import test from 'node:test';

import { AccountCenterControlValue } from '@logto/schemas';

import type * as SecurityPageModule from './security-page';

const { canOpenPasswordEditFlow, hasVisibleSecuritySection } = (await import(
  new URL('security-page.ts', import.meta.url).href
)) as typeof SecurityPageModule;

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
    hasVisibleSecuritySection({
      enabled: true,
      fields: {
        username: AccountCenterControlValue.Off,
        email: AccountCenterControlValue.Off,
        phone: AccountCenterControlValue.Off,
        password: AccountCenterControlValue.Off,
        social: AccountCenterControlValue.Edit,
      },
    }),
    true
  );
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
