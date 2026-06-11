import { SignInIdentifier, type UsernamePolicy } from '@logto/schemas';

import { validateIdentifierField } from './form';

const restrictivePolicy: UsernamePolicy = {
  caseSensitive: true,
  minLength: 4,
  maxLength: 8,
  allowedChars: { lowercase: true, uppercase: false, numbers: false, underscore: false },
};

describe('validateIdentifierField username policy', () => {
  it('enforces the full per-tenant policy with the proper error for each violation', () => {
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

  it('applies only the hard floor when no policy is provided', () => {
    expect(validateIdentifierField(SignInIdentifier.Username, '1abc')).toBe(
      'username_should_not_start_with_number'
    );
    expect(validateIdentifierField(SignInIdentifier.Username, 'ab')).toBeUndefined();
  });

  it('does not apply the username policy to email or phone identifiers', () => {
    expect(
      validateIdentifierField(SignInIdentifier.Email, 'foo@logto.io', restrictivePolicy)
    ).toBeUndefined();
    expect(validateIdentifierField(SignInIdentifier.Email, 'invalid', restrictivePolicy)).toBe(
      'invalid_email'
    );
  });
});
