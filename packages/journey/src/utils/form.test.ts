import { validatePassword } from './form';

describe('password format', () => {
  it('password min length should be 8', () => {
    expect(validatePassword('a1?')).toEqual({ code: 'password_min_length', data: { min: 8 } });
    expect(validatePassword('aaa123aa')).toBe(undefined);
  });

  it('password should not contains non ASCII visible chars', () => {
    expect(validatePassword('a1?aaaaa测试')).toEqual({
      code: 'invalid_password',
      data: { min: 8 },
    });

    expect(validatePassword('a1?aaaaa测试')).toEqual({
      code: 'invalid_password',
      data: { min: 8 },
    });

    expect(validatePassword('a1?aaaaa🌹')).toEqual({
      code: 'invalid_password',
      data: { min: 8 },
    });

    expect(validatePassword('a1?aaaaa')).toBe(undefined);
  });

  describe('password should contains at least 2 of 3 types of chars', () => {
    const singleTypeChars = ['aaaaaaaa', '11111111', '!@#$%^&*(())'];

    it.each(singleTypeChars)('single typed password format %p should be invalid', (password) => {
      expect(validatePassword(password)).toEqual({
        code: 'invalid_password',
        data: { min: 8 },
      });
    });

    const doubleTypeChars = [
      'asdfghj1',
      'asdfghj$',
      '1234567@',
      '1234567a',
      '!@#$%^&1',
      '!@#$%^&a',
    ];

    it.each(doubleTypeChars)('double typed password format %p should be valid', (password) => {
      expect(validatePassword(password)).toBe(undefined);
    });

    const tripleTypeChars = ['ASD!@#45', 'a!@#$%123', '1ASDfg654', '*123345GHJ'];

    it.each(tripleTypeChars)('triple typed password format %p should be valid', (password) => {
      expect(validatePassword(password)).toBe(undefined);
    });
  });
});
