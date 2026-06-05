import { describe, expect, it } from 'vitest';

import {
  defaultUsernamePolicy,
  usernamePolicyGuard,
  validateUsernameAgainstPolicy,
  validateUsernameHardFloor,
  type UsernamePolicy,
} from './username-policy.js';

const lowercaseOnly: UsernamePolicy = {
  caseSensitive: true,
  minLength: 4,
  maxLength: 8,
  allowedChars: { lowercase: true, uppercase: false, numbers: false, underscore: false },
};

const uppercaseOnly: UsernamePolicy = {
  caseSensitive: true,
  minLength: 4,
  maxLength: 8,
  allowedChars: { lowercase: false, uppercase: true, numbers: false, underscore: false },
};

describe('usernamePolicyGuard', () => {
  it('accepts the default policy', () => {
    expect(usernamePolicyGuard.safeParse(defaultUsernamePolicy).success).toBe(true);
  });

  it('rejects minLength > maxLength', () => {
    const result = usernamePolicyGuard.safeParse({
      ...defaultUsernamePolicy,
      minLength: 10,
      maxLength: 3,
    });
    expect(result.success).toBe(false);
  });

  it('rejects a numbers-only policy (no valid leading char)', () => {
    const result = usernamePolicyGuard.safeParse({
      ...defaultUsernamePolicy,
      allowedChars: { lowercase: false, uppercase: false, numbers: true, underscore: false },
    });
    expect(result.success).toBe(false);
    // Lock the human-readable acknowledgement so the "numbers-only not allowed" message can't
    // silently regress (koaGuard surfaces it verbatim on the Management API).
    expect(result.success ? undefined : result.error.issues[0]?.message).toContain(
      'numbers alone are not allowed'
    );
  });

  it('accepts underscore as the only leading char class', () => {
    const result = usernamePolicyGuard.safeParse({
      ...defaultUsernamePolicy,
      allowedChars: { lowercase: false, uppercase: false, numbers: true, underscore: true },
    });
    expect(result.success).toBe(true);
  });

  it('rejects out-of-range length', () => {
    expect(usernamePolicyGuard.safeParse({ ...defaultUsernamePolicy, minLength: 0 }).success).toBe(
      false
    );
    expect(
      usernamePolicyGuard.safeParse({ ...defaultUsernamePolicy, maxLength: 129 }).success
    ).toBe(false);
  });
});

describe('validateUsernameHardFloor', () => {
  it('returns "required" for an empty string', () => {
    expect(validateUsernameHardFloor('')).toBe('required');
  });
  it('returns "starts_with_number" for a leading digit', () => {
    expect(validateUsernameHardFloor('1abc')).toBe('starts_with_number');
  });
  it('returns "invalid_charset_hard" for an unsupported character', () => {
    expect(validateUsernameHardFloor('ab c')).toBe('invalid_charset_hard');
  });
  it('returns undefined for a valid username', () => {
    expect(validateUsernameHardFloor('abc')).toBeUndefined();
  });
});

describe('validateUsernameAgainstPolicy (default policy)', () => {
  it('accepts a lowercase username', () => {
    expect(validateUsernameAgainstPolicy('abc', defaultUsernamePolicy)).toBeUndefined();
  });
  it('accepts a mixed-case username with digits and underscore', () => {
    expect(validateUsernameAgainstPolicy('AbC_123', defaultUsernamePolicy)).toBeUndefined();
  });
  it('applies the hard floor before policy checks', () => {
    expect(validateUsernameAgainstPolicy('1abc', defaultUsernamePolicy)).toBe('starts_with_number');
  });
});

describe('validateUsernameAgainstPolicy (lowercase-only, length 4-8)', () => {
  it('rejects too short', () => {
    expect(validateUsernameAgainstPolicy('abc', lowercaseOnly)).toBe('too_short');
  });
  it('rejects too long', () => {
    expect(validateUsernameAgainstPolicy('abcdefghi', lowercaseOnly)).toBe('too_long');
  });
  it('rejects an uppercase letter', () => {
    expect(validateUsernameAgainstPolicy('abcD', lowercaseOnly)).toBe('uppercase_not_allowed');
  });
  it('rejects a digit', () => {
    expect(validateUsernameAgainstPolicy('abc1', lowercaseOnly)).toBe('numbers_not_allowed');
  });
  it('rejects an underscore', () => {
    expect(validateUsernameAgainstPolicy('ab_c', lowercaseOnly)).toBe('underscore_not_allowed');
  });
  it('accepts a lowercase username within bounds', () => {
    expect(validateUsernameAgainstPolicy('abcd', lowercaseOnly)).toBeUndefined();
  });
});

describe('validateUsernameAgainstPolicy (uppercase-only, length 4-8)', () => {
  it('rejects a lowercase letter', () => {
    expect(validateUsernameAgainstPolicy('ABCd', uppercaseOnly)).toBe('lowercase_not_allowed');
  });
  it('accepts an uppercase username within bounds', () => {
    expect(validateUsernameAgainstPolicy('ABCD', uppercaseOnly)).toBeUndefined();
  });
});
