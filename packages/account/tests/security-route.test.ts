import assert from 'node:assert/strict';
import test from 'node:test';

import { getAccountIndexPage } from '../src/utils/security-route.ts';

test('returns home for the index route when dev features are disabled', () => {
  assert.equal(getAccountIndexPage(false), 'home');
});

test('returns security for the index route when dev features are enabled', () => {
  assert.equal(getAccountIndexPage(true), 'security');
});
