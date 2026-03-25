import assert from 'node:assert/strict';
import test from 'node:test';

import type * as SessionStorageModule from './session-storage';

type StorageMock = {
  getItem: (key: string) => string | undefined;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
  clear: () => void;
};

const createStorageMock = (): StorageMock => {
  const storage = new Map<string, string>();

  return {
    getItem: (key) => storage.get(key),
    setItem: (key, value) => {
      storage.set(key, value);
    },
    removeItem: (key) => {
      storage.delete(key);
    },
    clear: () => {
      storage.clear();
    },
  };
};

const windowMock = {
  sessionStorage: createStorageMock(),
  localStorage: createStorageMock(),
};

Reflect.defineProperty(globalThis, 'window', {
  value: windowMock,
  configurable: true,
});

const { accountStorage } = (await import(
  new URL('session-storage.ts', import.meta.url).href
)) as typeof SessionStorageModule;

void test('socialFlow persists pending and verified records through explicit entry points', () => {
  windowMock.sessionStorage.clear();

  const expiresAt = new Date(Date.now() + 60_000).toISOString();

  accountStorage.socialFlow.setPending('google', {
    verificationRecordId: 'pending-id',
    expiresAt,
    state: 'state-123',
  });

  assert.deepEqual(accountStorage.socialFlow.get('google'), {
    status: 'pending',
    verificationRecordId: 'pending-id',
    expiresAt,
    state: 'state-123',
  });

  accountStorage.socialFlow.setVerified('google', {
    verificationRecordId: 'verified-id',
    expiresAt,
  });

  assert.deepEqual(accountStorage.socialFlow.get('google'), {
    status: 'verified',
    verificationRecordId: 'verified-id',
    expiresAt,
  });
});

void test('socialFlow removes expired records', () => {
  windowMock.sessionStorage.clear();

  accountStorage.socialFlow.setPending('google', {
    verificationRecordId: 'expired-id',
    expiresAt: new Date(Date.now() - 60_000).toISOString(),
    state: 'expired-state',
  });

  assert.equal(accountStorage.socialFlow.get('google'), undefined);
});

void test('routeRestore expires after ttl window', () => {
  windowMock.sessionStorage.clear();

  const originalNow = Date.now;
  const runAt = (timestamp: number, callback: () => void) => {
    Reflect.defineProperty(Date, 'now', {
      value: () => timestamp,
      configurable: true,
    });
    callback();
  };

  runAt(0, () => {
    accountStorage.routeRestore.set('/account/password');
    assert.equal(accountStorage.routeRestore.get(), '/account/password');
  });

  runAt(10 * 60 * 1000 + 1, () => {
    assert.equal(accountStorage.routeRestore.get(), undefined);
  });

  Reflect.defineProperty(Date, 'now', {
    value: originalNow,
    configurable: true,
  });
});

void test('pendingReturn expires after ttl window', () => {
  windowMock.sessionStorage.clear();

  const originalNow = Date.now;
  const runAt = (timestamp: number, callback: () => void) => {
    Reflect.defineProperty(Date, 'now', {
      value: () => timestamp,
      configurable: true,
    });
    callback();
  };

  runAt(0, () => {
    accountStorage.pendingReturn.set('https://example.com/account');
    assert.equal(accountStorage.pendingReturn.get(), 'https://example.com/account');
  });

  runAt(10 * 60 * 1000 + 1, () => {
    assert.equal(accountStorage.pendingReturn.get(), undefined);
  });

  Reflect.defineProperty(Date, 'now', {
    value: originalNow,
    configurable: true,
  });
});
