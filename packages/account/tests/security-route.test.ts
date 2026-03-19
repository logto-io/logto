import assert from 'node:assert/strict';
import test from 'node:test';

import { getAccountIndexPage } from '../src/utils/security-route.ts';

void test('returns home for the index route when dev features are disabled', () => {
  assert.equal(getAccountIndexPage(false, true), 'home');
});

void test('returns security for the index route when dev features are enabled', () => {
  assert.equal(getAccountIndexPage(true, true), 'security');
});

void test('returns home when account center is disabled even if dev features are enabled', () => {
  assert.equal(getAccountIndexPage(true, false), 'home');
});
