import type { RedirectContext } from './social-redirect-fallback-context';
import {
  consumeRedirectContext,
  getRedirectContextByState,
  removeRedirectContext,
  storeRedirectContext,
  sweepExpiredRedirectContexts,
} from './social-redirect-fallback-context';

const createTestInput = (
  overrides?: Partial<Omit<RedirectContext, 'createdAt' | 'expiresAt'>>
): Omit<RedirectContext, 'createdAt' | 'expiresAt'> => ({
  state: 'test-state-123',
  flow: 'social',
  connectorId: 'mock-connector',
  verificationId: 'verification-456',
  appId: 'app-789',
  organizationId: 'org-001',
  uiLocales: 'en',
  ...overrides,
});

const fallbackKeyPrefix = 'logto:redirect-context:fallback:';

beforeEach(() => {
  localStorage.clear();
});

describe('storeRedirectContext + getRedirectContextByState', () => {
  it('should round-trip: store then get returns same context', () => {
    const input = createTestInput();
    storeRedirectContext(input);

    const result = getRedirectContextByState(input.state);
    expect(result).toMatchObject(input);
    expect(result?.createdAt).toEqual(expect.any(Number));
    expect(result?.expiresAt).toEqual(expect.any(Number));
    expect(result!.expiresAt).toBeGreaterThan(result!.createdAt);
  });

  it('should return undefined for non-existent state', () => {
    expect(getRedirectContextByState('non-existent')).toBeUndefined();
  });
});

describe('consumeRedirectContext', () => {
  it('should return context and delete the key', () => {
    const input = createTestInput();
    storeRedirectContext(input);

    const result = consumeRedirectContext(input.state);
    expect(result).toMatchObject(input);

    // Subsequent get should return undefined
    expect(getRedirectContextByState(input.state)).toBeUndefined();
    expect(localStorage.getItem(`${fallbackKeyPrefix}${input.state}`)).toBeNull();
  });

  it('should return undefined for non-existent state', () => {
    expect(consumeRedirectContext('non-existent')).toBeUndefined();
  });
});

describe('removeRedirectContext', () => {
  it('should remove an existing key', () => {
    const input = createTestInput();
    storeRedirectContext(input);

    removeRedirectContext(input.state);
    expect(getRedirectContextByState(input.state)).toBeUndefined();
  });

  it('should not throw when removing a non-existent key', () => {
    expect(() => {
      removeRedirectContext('non-existent');
    }).not.toThrow();
  });

  it('should be idempotent — calling twice does not throw', () => {
    const input = createTestInput();
    storeRedirectContext(input);

    removeRedirectContext(input.state);
    expect(() => {
      removeRedirectContext(input.state);
    }).not.toThrow();
  });
});

describe('expired context handling', () => {
  it('should return undefined for expired context and delete the key', () => {
    const input = createTestInput();
    storeRedirectContext(input);

    // Manually tamper with the stored bundle to make it expired
    const key = `${fallbackKeyPrefix}${input.state}`;
    const stored = JSON.parse(localStorage.getItem(key)!) as RedirectContext;
    localStorage.setItem(key, JSON.stringify({ ...stored, expiresAt: Date.now() - 1000 }));

    expect(getRedirectContextByState(input.state)).toBeUndefined();
    // Key should be cleaned up
    expect(localStorage.getItem(key)).toBeNull();
  });
});

describe('malformed data handling', () => {
  it('should return undefined for malformed JSON and delete the key', () => {
    const key = `${fallbackKeyPrefix}bad-json`;
    localStorage.setItem(key, '{not valid json!!!');

    expect(getRedirectContextByState('bad-json')).toBeUndefined();
    expect(localStorage.getItem(key)).toBeNull();
  });

  it('should return undefined for schema-invalid record and delete the key', () => {
    const key = `${fallbackKeyPrefix}schema-invalid`;
    localStorage.setItem(key, JSON.stringify({ state: 'schema-invalid' }));

    expect(getRedirectContextByState('schema-invalid')).toBeUndefined();
    expect(localStorage.getItem(key)).toBeNull();
  });
});

describe('sweepExpiredRedirectContexts', () => {
  it('should delete only expired bundles and keep valid ones', () => {
    // Store two valid contexts
    const valid1 = createTestInput({ state: 'valid-1' });
    const valid2 = createTestInput({ state: 'valid-2' });
    storeRedirectContext(valid1);
    storeRedirectContext(valid2);

    // Manually expire one of them
    const expiredKey = `${fallbackKeyPrefix}valid-1`;
    const stored = JSON.parse(localStorage.getItem(expiredKey)!) as RedirectContext;
    localStorage.setItem(expiredKey, JSON.stringify({ ...stored, expiresAt: Date.now() - 1000 }));

    // Also add a malformed entry
    localStorage.setItem(`${fallbackKeyPrefix}malformed`, 'not-json');

    sweepExpiredRedirectContexts();

    // Expired and malformed should be removed
    expect(localStorage.getItem(expiredKey)).toBeNull();
    expect(localStorage.getItem(`${fallbackKeyPrefix}malformed`)).toBeNull();

    // Valid one should remain
    expect(getRedirectContextByState('valid-2')).toMatchObject(valid2);
  });

  it('should not affect keys without the fallback prefix', () => {
    localStorage.setItem('other-key', 'other-value');
    storeRedirectContext(createTestInput());

    sweepExpiredRedirectContexts();

    expect(localStorage.getItem('other-key')).toBe('other-value');
  });
});

describe('localStorage unavailable', () => {
  it('should not throw when localStorage operations fail', () => {
    // Mock localStorage to throw
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });
    const getItemSpy = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage unavailable');
    });

    expect(() => {
      storeRedirectContext(createTestInput());
    }).not.toThrow();

    expect(getRedirectContextByState('test-state-123')).toBeUndefined();
    expect(consumeRedirectContext('test-state-123')).toBeUndefined();

    expect(() => {
      removeRedirectContext('test-state-123');
    }).not.toThrow();

    expect(() => {
      sweepExpiredRedirectContexts();
    }).not.toThrow();

    // Restore
    setItemSpy.mockRestore();
    getItemSpy.mockRestore();
  });
});
