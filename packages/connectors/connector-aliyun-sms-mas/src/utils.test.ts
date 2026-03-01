import { describe, it, expect } from 'vitest';

import {
  escaper,
  getSignature,
  isMainlandChinaPhoneNumber,
  mainlandChinaCountryCode,
  normalizeMainlandChinaPhoneNumber,
  request,
} from './utils.js';

describe('escaper()', () => {
  it('should encode special characters according to Aliyun rules', () => {
    // Standard encodeURIComponent encoding
    expect(escaper('hello')).toBe('hello');
    expect(escaper('test value')).toBe('test%20value');

    // Aliyun special escape rules
    expect(escaper('*')).toBe('%2A');
    expect(escaper('+')).toBe('%2B');
    expect(escaper('!')).toBe('%21');
    expect(escaper('"')).toBe('%22');
    expect(escaper("'")).toBe('%27');
    expect(escaper('(')).toBe('%28');
    expect(escaper(')')).toBe('%29');
  });

  it('should handle complex strings with multiple special characters', () => {
    const input = 'Hello (World)! *Test* +123';
    const expected = 'Hello%20%28World%29%21%20%2ATest%2A%20%2B123';
    expect(escaper(input)).toBe(expected);
  });
});

describe('getSignature()', () => {
  it('should generate consistent signature for same parameters', () => {
    const params = {
      AccessKeyId: 'test-key',
      Timestamp: '2024-01-01T00:00:00Z',
      SignatureNonce: 'test-nonce',
    };
    const secret = 'test-secret';

    const sig1 = getSignature(params, secret, 'POST');
    const sig2 = getSignature(params, secret, 'POST');

    expect(sig1).toBe(sig2);
  });

  it('should generate different signatures for different parameters', () => {
    const params1 = { AccessKeyId: 'key1', Timestamp: '2024-01-01T00:00:00Z' };
    const params2 = { AccessKeyId: 'key2', Timestamp: '2024-01-01T00:00:00Z' };
    const secret = 'test-secret';

    const sig1 = getSignature(params1, secret, 'POST');
    const sig2 = getSignature(params2, secret, 'POST');

    expect(sig1).not.toBe(sig2);
  });

  it('should generate different signatures for different HTTP methods', () => {
    const params = { AccessKeyId: 'test-key', Timestamp: '2024-01-01T00:00:00Z' };
    const secret = 'test-secret';

    const postSig = getSignature(params, secret, 'POST');
    const getSig = getSignature(params, secret, 'GET');

    expect(postSig).not.toBe(getSig);
  });

  it('should generate correct signature format (base64)', () => {
    const params = { AccessKeyId: 'test' };
    const signature = getSignature(params, 'secret', 'POST');

    // Base64 format validation
    expect(Buffer.from(signature, 'base64').toString('base64')).toBe(signature);
    // Should not contain padding issues
    expect(signature).toMatch(/^[\d+/A-Za-z]*={0,2}$/);
  });

  it('should sort parameters alphabetically', () => {
    // Parameters in random order
    const params = {
      Zebra: 'z',
      Alpha: 'a',
      Mike: 'm',
    };

    // Same parameters in different order should produce same signature
    const paramsOrdered = {
      Alpha: 'a',
      Mike: 'm',
      Zebra: 'z',
    };

    const sig1 = getSignature(params, 'secret', 'POST');
    const sig2 = getSignature(paramsOrdered, 'secret', 'POST');

    expect(sig1).toBe(sig2);
  });
});

describe('request()', () => {
  it('should be a function', () => {
    expect(typeof request).toBe('function');
  });

  // Note: We don't test actual HTTP requests here as they require mocking got
  // The request function is tested indirectly through index.test.ts
});

describe('normalizeMainlandChinaPhoneNumber()', () => {
  it('should keep mainland China national number unchanged', () => {
    expect(normalizeMainlandChinaPhoneNumber('13012345678')).toBe('13012345678');
  });

  it('should normalize 86 prefix', () => {
    expect(normalizeMainlandChinaPhoneNumber('8613012345678')).toBe('13012345678');
  });

  it('should normalize +86 prefix', () => {
    expect(normalizeMainlandChinaPhoneNumber('+8613012345678')).toBe('13012345678');
  });

  it('should normalize 0086 prefix', () => {
    expect(normalizeMainlandChinaPhoneNumber('008613012345678')).toBe('13012345678');
  });

  it('should return original value for non-mainland format', () => {
    expect(normalizeMainlandChinaPhoneNumber('18888888888')).toBe('18888888888');
  });
});

describe('mainlandChinaCountryCode', () => {
  it('should be 86', () => {
    expect(mainlandChinaCountryCode).toBe('86');
  });
});

describe('isMainlandChinaPhoneNumber()', () => {
  it.each(['13012345678', '8613012345678', '+8613012345678', '008613012345678'])(
    'should return true for valid format: %s',
    (value) => {
      expect(isMainlandChinaPhoneNumber(value)).toBe(true);
    }
  );

  it.each(['+1123123123', 'abc', '123456'])(
    'should return false for invalid format: %s',
    (value) => {
      expect(isMainlandChinaPhoneNumber(value)).toBe(false);
    }
  );
});
