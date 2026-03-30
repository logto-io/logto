import assert from 'node:assert/strict';
import test from 'node:test';

import type * as UserSessionGuardModule from './user-session-guard';

const { isSessionUserMatch } = (await import(
  new URL('user-session-guard.ts', import.meta.url).href
)) as typeof UserSessionGuardModule;

const createMockGetIdTokenClaims = (sub: string) => async () => ({ sub });
// eslint-disable-next-line unicorn/no-useless-undefined
const returnsUndefined = async () => undefined;
const throwsError = async (): Promise<{ sub: string }> => {
  throw new Error('not_authenticated');
};

void test('isSessionUserMatch returns true when sub matches userInfo id', async () => {
  assert.equal(await isSessionUserMatch(createMockGetIdTokenClaims('user-123'), 'user-123'), true);
});

void test('isSessionUserMatch returns false when sub does not match userInfo id', async () => {
  assert.equal(await isSessionUserMatch(createMockGetIdTokenClaims('user-a'), 'user-b'), false);
});

void test('isSessionUserMatch returns false when getIdTokenClaims returns undefined', async () => {
  assert.equal(await isSessionUserMatch(returnsUndefined, 'user-123'), false);
});

void test('isSessionUserMatch returns false when getIdTokenClaims throws', async () => {
  assert.equal(await isSessionUserMatch(throwsError, 'user-123'), false);
});
