import assert from 'node:assert/strict';
import test from 'node:test';

import { SignInIdentifier } from '@logto/schemas';

import { getIsDevFeaturesEnabled } from '../src/utils/dev-features.ts';
import { getEditFlowRedirectUrl } from '../src/utils/edit-flow-redirect.ts';
import { applyBoundIdentifierToUserInfo } from '../src/utils/user-info.ts';

void test('preserves the caller redirect when opening a security edit flow', () => {
  assert.equal(
    getEditFlowRedirectUrl('https://app.example/callback', 'https://logto.dev/account'),
    'https://app.example/callback'
  );
});

void test('falls back to the current account page when no caller redirect exists', () => {
  assert.equal(
    getEditFlowRedirectUrl(undefined, 'https://logto.dev/account'),
    'https://logto.dev/account'
  );
});

void test('keeps dev features off for production builds unless the override is enabled', () => {
  assert.equal(getIsDevFeaturesEnabled(true), false);
  assert.equal(getIsDevFeaturesEnabled(true, 'true'), true);
});

void test('enables dev features for non-production builds', () => {
  assert.equal(getIsDevFeaturesEnabled(false), true);
});

void test('updates the cached primary email after a successful bind', () => {
  assert.deepEqual(
    applyBoundIdentifierToUserInfo(
      { primaryEmail: 'old@example.com' },
      SignInIdentifier.Email,
      'new@example.com'
    ),
    { primaryEmail: 'new@example.com' }
  );
});

void test('updates the cached primary phone after a successful bind', () => {
  assert.deepEqual(
    applyBoundIdentifierToUserInfo(
      { primaryPhone: '+123456789' },
      SignInIdentifier.Phone,
      '+1987654321'
    ),
    { primaryPhone: '+1987654321' }
  );
});
