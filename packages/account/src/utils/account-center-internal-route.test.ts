import assert from 'node:assert/strict';
import test from 'node:test';

import type * as AccountCenterInternalRouteModule from './account-center-internal-route';

const { getAccountCenterInternalRoute } = (await import(
  new URL('account-center-internal-route.ts', import.meta.url).href
)) as typeof AccountCenterInternalRouteModule;

const origin = 'https://auth.example.com';

void test('getAccountCenterInternalRoute returns a router path for same-origin account center URLs', () => {
  assert.equal(getAccountCenterInternalRoute(`${origin}/account`, origin), '/');
  assert.equal(getAccountCenterInternalRoute(`${origin}/account/`, origin), '/');
  assert.equal(getAccountCenterInternalRoute(`${origin}/account/security`, origin), '/security');
  assert.equal(
    getAccountCenterInternalRoute(`${origin}/account/security?foo=bar#profile`, origin),
    '/security?foo=bar#profile'
  );
});

void test('getAccountCenterInternalRoute supports relative account center URLs', () => {
  assert.equal(
    getAccountCenterInternalRoute('/account/username/success', origin),
    '/username/success'
  );
});

void test('getAccountCenterInternalRoute ignores non-account-center URLs', () => {
  assert.equal(getAccountCenterInternalRoute(`${origin}/accounting`, origin), undefined);
  assert.equal(getAccountCenterInternalRoute(`${origin}/console`, origin), undefined);
  assert.equal(
    getAccountCenterInternalRoute('https://external.example.com/account/security', origin),
    undefined
  );
});

void test('getAccountCenterInternalRoute ignores invalid URLs', () => {
  assert.equal(getAccountCenterInternalRoute('http://[', origin), undefined);
  assert.equal(getAccountCenterInternalRoute('/account/security', 'not-a-url'), undefined);
});
