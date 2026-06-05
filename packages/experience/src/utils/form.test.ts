import { SignInIdentifier, type UsernamePolicy } from '@logto/schemas';

const restrictivePolicy: UsernamePolicy = {
  caseSensitive: true,
  minLength: 4,
  maxLength: 8,
  allowedChars: { lowercase: true, uppercase: false, numbers: false, underscore: false },
};

/**
 * Re-import `validateIdentifierField` with the dev-feature flag forced on or off. The flag is a
 * build-time constant read at call time inside the validator, so the module must be reloaded to
 * pick up a different value.
 */
const loadValidateIdentifierField = async (isDevFeaturesEnabled: boolean) => {
  jest.resetModules();
  jest.doMock('@/constants/env', () => ({ isDevFeaturesEnabled }));
  const { validateIdentifierField } = await import('./form');
  return validateIdentifierField;
};

describe('validateIdentifierField username policy gating', () => {
  afterEach(() => {
    jest.resetModules();
  });

  describe('when dev features are off', () => {
    it('applies only the hard floor and ignores the per-tenant policy', async () => {
      const validateIdentifierField = await loadValidateIdentifierField(false);

      // Hard-floor violations are still reported (unchanged from the original code).
      expect(validateIdentifierField(SignInIdentifier.Username, '', restrictivePolicy)).toBe(
        'username_required'
      );
      expect(validateIdentifierField(SignInIdentifier.Username, '1abc', restrictivePolicy)).toBe(
        'username_should_not_start_with_number'
      );
      expect(validateIdentifierField(SignInIdentifier.Username, 'ab c', restrictivePolicy)).toBe(
        'username_invalid_charset'
      );

      // Policy-only violations are NOT reported — behavior is identical to the original hard-floor
      // validation even though a restrictive policy is supplied.
      expect(
        validateIdentifierField(SignInIdentifier.Username, 'ab', restrictivePolicy)
      ).toBeUndefined();
      expect(
        validateIdentifierField(SignInIdentifier.Username, 'abcdefghijk', restrictivePolicy)
      ).toBeUndefined();
      expect(
        validateIdentifierField(SignInIdentifier.Username, 'abcD', restrictivePolicy)
      ).toBeUndefined();
      expect(
        validateIdentifierField(SignInIdentifier.Username, 'ab_c', restrictivePolicy)
      ).toBeUndefined();
    });
  });

  describe('when dev features are on', () => {
    it('enforces the full per-tenant policy with the proper error for each violation', async () => {
      const validateIdentifierField = await loadValidateIdentifierField(true);

      // The hard floor still runs first.
      expect(validateIdentifierField(SignInIdentifier.Username, '', restrictivePolicy)).toBe(
        'username_required'
      );
      expect(validateIdentifierField(SignInIdentifier.Username, '1abc', restrictivePolicy)).toBe(
        'username_should_not_start_with_number'
      );
      expect(validateIdentifierField(SignInIdentifier.Username, 'ab c', restrictivePolicy)).toBe(
        'username_invalid_charset'
      );

      // Length violations carry the bound as interpolation data.
      expect(validateIdentifierField(SignInIdentifier.Username, 'abc', restrictivePolicy)).toEqual({
        code: 'username_too_short',
        data: { min: 4 },
      });
      expect(
        validateIdentifierField(SignInIdentifier.Username, 'abcdefghi', restrictivePolicy)
      ).toEqual({ code: 'username_too_long', data: { max: 8 } });

      // Disallowed character classes.
      expect(validateIdentifierField(SignInIdentifier.Username, 'abcD', restrictivePolicy)).toBe(
        'username_uppercase_not_allowed'
      );
      expect(validateIdentifierField(SignInIdentifier.Username, 'abc1', restrictivePolicy)).toBe(
        'username_numbers_not_allowed'
      );
      expect(validateIdentifierField(SignInIdentifier.Username, 'ab_c', restrictivePolicy)).toBe(
        'username_underscore_not_allowed'
      );
      // `lowercase_not_allowed` needs a policy that disallows lowercase.
      const uppercaseOnly: UsernamePolicy = {
        ...restrictivePolicy,
        allowedChars: { lowercase: false, uppercase: true, numbers: false, underscore: false },
      };
      expect(validateIdentifierField(SignInIdentifier.Username, 'ABCd', uppercaseOnly)).toBe(
        'username_lowercase_not_allowed'
      );

      // A username satisfying the policy passes.
      expect(
        validateIdentifierField(SignInIdentifier.Username, 'abcd', restrictivePolicy)
      ).toBeUndefined();
    });

    it('does not apply the username policy to email or phone identifiers', async () => {
      const validateIdentifierField = await loadValidateIdentifierField(true);

      expect(
        validateIdentifierField(SignInIdentifier.Email, 'foo@logto.io', restrictivePolicy)
      ).toBeUndefined();
      expect(validateIdentifierField(SignInIdentifier.Email, 'invalid', restrictivePolicy)).toBe(
        'invalid_email'
      );
    });
  });
});
