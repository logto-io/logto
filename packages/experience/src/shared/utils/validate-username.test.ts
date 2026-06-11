import { defaultUsernamePolicy, type UsernamePolicy } from '@logto/schemas';

import { isUsernamePolicyViolation, validateUsername } from './validate-username';

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

describe('validateUsername (experience)', () => {
  describe('hard floor only (no policy)', () => {
    it('returns username_required for an empty value', () => {
      expect(validateUsername('')).toBe('username_required');
    });

    it('returns username_should_not_start_with_number for a leading digit', () => {
      expect(validateUsername('1abc')).toBe('username_should_not_start_with_number');
    });

    it('returns username_invalid_charset for an invalid charset', () => {
      expect(validateUsername('ab c')).toBe('username_invalid_charset');
    });

    it('returns undefined for a valid username', () => {
      expect(validateUsername('abc')).toBeUndefined();
    });

    it('does not apply policy length bounds when no policy is given', () => {
      expect(validateUsername('ab')).toBeUndefined();
    });
  });

  describe('with the default policy', () => {
    it('accepts a valid username', () => {
      expect(validateUsername('alice', defaultUsernamePolicy)).toBeUndefined();
    });

    it('accepts a mixed-character username', () => {
      expect(validateUsername('AbC_123', defaultUsernamePolicy)).toBeUndefined();
    });
  });

  describe('with a restrictive policy (lowercase only, 4-8 chars)', () => {
    it('returns username_too_short with the min length', () => {
      expect(validateUsername('abc', lowercaseOnly)).toEqual({
        code: 'username_too_short',
        data: { min: 4 },
      });
    });

    it('returns username_too_long with the max length', () => {
      expect(validateUsername('abcdefghi', lowercaseOnly)).toEqual({
        code: 'username_too_long',
        data: { max: 8 },
      });
    });

    it('rejects an uppercase letter', () => {
      expect(validateUsername('abcD', lowercaseOnly)).toBe('username_uppercase_not_allowed');
    });

    it('rejects a digit', () => {
      expect(validateUsername('abc1', lowercaseOnly)).toBe('username_numbers_not_allowed');
    });

    it('rejects an underscore', () => {
      expect(validateUsername('ab_c', lowercaseOnly)).toBe('username_underscore_not_allowed');
    });

    it('still enforces the hard floor before the policy', () => {
      expect(validateUsername('1abc', lowercaseOnly)).toBe('username_should_not_start_with_number');
    });
  });

  describe('with a restrictive policy (uppercase only)', () => {
    it('rejects a lowercase letter', () => {
      expect(validateUsername('ABCd', uppercaseOnly)).toBe('username_lowercase_not_allowed');
    });

    it('accepts pure uppercase within bounds', () => {
      expect(validateUsername('ABCD', uppercaseOnly)).toBeUndefined();
    });
  });
});

describe('isUsernamePolicyViolation', () => {
  it('classifies length and character-type errors as policy violations', () => {
    expect(isUsernamePolicyViolation({ code: 'username_too_short', data: { min: 4 } })).toBe(true);
    expect(isUsernamePolicyViolation({ code: 'username_too_long', data: { max: 8 } })).toBe(true);
    expect(isUsernamePolicyViolation('username_uppercase_not_allowed')).toBe(true);
    expect(isUsernamePolicyViolation('username_lowercase_not_allowed')).toBe(true);
    expect(isUsernamePolicyViolation('username_numbers_not_allowed')).toBe(true);
    expect(isUsernamePolicyViolation('username_underscore_not_allowed')).toBe(true);
  });

  it('classifies hard-floor errors as non-policy violations', () => {
    expect(isUsernamePolicyViolation('username_required')).toBe(false);
    expect(isUsernamePolicyViolation('username_should_not_start_with_number')).toBe(false);
    expect(isUsernamePolicyViolation('username_invalid_charset')).toBe(false);
  });

  it('ignores errors from other identifier types', () => {
    expect(isUsernamePolicyViolation('invalid_email')).toBe(false);
  });
});
