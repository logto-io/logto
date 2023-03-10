import { passwordRegEx } from './regex.js';

describe('passwordRegEx', () => {
  it('should match password with at least 8 chars', () => {
    expect(passwordRegEx.test('1234ddf')).toBeFalsy();
    expect(passwordRegEx.test('1234ddf!')).toBeTruthy();
  });

  it('password should not contains non ASCII visible chars', () => {
    expect(passwordRegEx.test('a1?aaaaa测试')).toBeFalsy();

    expect(passwordRegEx.test('a1?aaaaa测试')).toBeFalsy();

    expect(passwordRegEx.test('a1?aaaaa🌹')).toBeFalsy();

    expect(passwordRegEx.test('a1?aaaaa')).toBeTruthy();
  });

  describe('password should contains at least 2 of 3 types of chars', () => {
    const singleTypeChars = ['aaaaaaaa', '11111111', '!@#$%^&*(())'];

    it.each(singleTypeChars)('single typed password format %p should be invalid', (password) => {
      expect(passwordRegEx.test(password)).toBeFalsy();
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
      expect(passwordRegEx.test(password)).toBeTruthy();
    });

    const tripleTypeChars = ['ASD!@#45', 'a!@#$%123', '1ASDfg654', '*123345GHJ'];

    it.each(tripleTypeChars)('triple typed password format %p should be valid', (password) => {
      expect(passwordRegEx.test(password)).toBeTruthy();
    });
  });
});
