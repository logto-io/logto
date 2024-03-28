import { describe, expect, it, beforeAll, afterAll, vi } from 'vitest';
import { ZodError } from 'zod';

import { PasswordPolicyChecker } from './password-policy.js';

const mockPwnResponse = () => {
  const originalFetch = global.fetch;
  beforeAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    global.fetch = vi.fn().mockResolvedValue({
      // Return hash suffixes for '123456'.
      text: async () =>
        'D032E84B0AEB4E773555C73D6B13BEA7A44:1\nD09CA3762AF61E59520943DC26494F8941B:37615252',
    });
  });

  afterAll(() => {
    // eslint-disable-next-line @silverhand/fp/no-mutation
    global.fetch = originalFetch;
  });
};

describe('PasswordPolicyChecker', () => {
  it('should reject malformed policy', () => {
    expect(() => {
      // @ts-expect-error
      return new PasswordPolicyChecker({ length: { min: 1, max: '2' } });
    }).toThrowError(ZodError);
  });
});

describe('PasswordPolicyChecker -> check()', () => {
  mockPwnResponse();

  const checker = new PasswordPolicyChecker({
    length: { min: 7, max: 15 },
    characterTypes: { min: 3 },
    rejects: {
      pwned: true,
      repetitionAndSequence: true,
      userInfo: true,
      words: ['aaaaaate', 'aaaaaaaa', 'silverhand'],
    },
  });

  it('should accept valid password', async () => {
    expect(await checker.check('aL1!aL1!', {})).toEqual([]);
    expect(await checker.check('silverHAnd213', {})).toEqual([]);
    expect(await checker.check('lo9KI8mJu112', {})).toEqual([]);
  });

  it('should recognize rejection combinations', async () => {
    expect(await checker.check('aL1!aL1!', { name: 'aL1!' })).toEqual([
      { code: 'password_rejected.restricted.user_info' },
    ]);
    expect(await checker.check('lo9KI8mju78911', {})).toEqual([
      { code: 'password_rejected.restricted.sequence' },
    ]);
    expect(await checker.check('lo9KI8MJU789111', {})).toEqual([
      { code: 'password_rejected.restricted.sequence' },
      { code: 'password_rejected.restricted.repetition' },
    ]);
  });

  it('should reject with all failed checks', async () => {
    expect(await checker.check('aaa😀', {})).toEqual([
      { code: 'password_rejected.too_short', interpolation: { min: 7 } },
      { code: 'password_rejected.unsupported_characters' },
      { code: 'password_rejected.restricted.repetition' },
    ]);

    expect(await checker.check('123456', { phoneNumber: '12345' })).toEqual([
      { code: 'password_rejected.too_short', interpolation: { min: 7 } },
      { code: 'password_rejected.character_types', interpolation: { min: 3 } },
      { code: 'password_rejected.pwned' },
      { code: 'password_rejected.restricted.sequence' },
      { code: 'password_rejected.restricted.user_info' },
    ]);

    expect(await checker.check('aaaaaaaaAAAAAAAAbcdCOK', { name: 'CO' })).toEqual([
      { code: 'password_rejected.too_long', interpolation: { max: 15 } },
      { code: 'password_rejected.character_types', interpolation: { min: 3 } },
      { code: 'password_rejected.restricted.repetition' },
      { code: 'password_rejected.restricted.words' },
      { code: 'password_rejected.restricted.sequence' },
      { code: 'password_rejected.restricted.user_info' },
    ]);
  });
});

describe('PasswordPolicyChecker -> checkCharTypes()', () => {
  const checker1 = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 2 },
    rejects: { pwned: false, repetitionAndSequence: false, userInfo: false, words: [] },
  });
  const checker2 = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 4 },
    rejects: { pwned: false, repetitionAndSequence: false, userInfo: false, words: [] },
  });

  it('should reject unsupported characters', () => {
    expect(checker1.checkCharTypes('😀')).toBe('unsupported');
    expect(checker2.checkCharTypes('aA1!😀')).toBe('unsupported');
  });

  it('should reject password with too few character types', () => {
    expect(checker1.checkCharTypes('a')).toBe(false);
    expect(checker2.checkCharTypes('aA')).toBe(false);
  });

  it('should accept password with enough character types', () => {
    expect(checker1.checkCharTypes('aA')).toBe(true);
    expect(checker1.checkCharTypes('aA1!0')).toBe(true);
    expect(checker2.checkCharTypes('aA1!0')).toBe(true);
  });
});

describe('PasswordPolicyChecker -> hasBeenPwned()', () => {
  const checker = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 2 },
    rejects: { pwned: true, repetitionAndSequence: false, userInfo: false, words: [] },
  });

  mockPwnResponse();

  it('should reject pwned password', async () => {
    expect(await checker.hasBeenPwned('123456')).toBe(true);
  });

  it('should accept non-pwned password', async () => {
    expect(await checker.hasBeenPwned('1')).toBe(false);
  });
});

describe('PasswordPolicyChecker -> repetitionLength()', () => {
  const checker = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 2 },
    rejects: { pwned: false, repetitionAndSequence: true, words: [] },
  });

  it('should recognize repeated characters that start at the beginning', () => {
    expect(checker.repetitionLength('aaaa')).toBe(4);
    expect(checker.repetitionLength('aaa12')).toBe(3);
    expect(checker.repetitionLength('AAAAAA😀')).toBe(6);
  });

  it('should ignore repeated characters that do not start at the beginning or are too short', () => {
    expect(checker.repetitionLength('a')).toBe(0);
    expect(checker.repetitionLength('aa')).toBe(0);
    expect(checker.repetitionLength('aaAaaAaa')).toBe(0);
    expect(checker.repetitionLength('aL!bbbbb')).toBe(0);
    expect(checker.repetitionLength('aL1!')).toBe(0);
    expect(checker.repetitionLength('aL1!bbbbbbbbbbbb')).toBe(0);
  });
});

describe('PasswordPolicyChecker -> userInfoLength()', () => {
  const checker = new PasswordPolicyChecker({
    rejects: { pwned: false, repetitionAndSequence: false, userInfo: true, words: [] },
  });

  it('should recognize name', () => {
    expect(checker.userInfoLength('test', { name: 'test' })).toBe(4);
    expect(checker.userInfoLength('test', { name: 'test2' })).toBe(0);
    expect(checker.userInfoLength('FOO', { name: 'Foo bar' })).toBe(3);
    expect(checker.userInfoLength('Foo', { name: 'bar fOo' })).toBe(3);
    expect(checker.userInfoLength('barFooBaz12', { name: 'bar   fOo   baz' })).toBe(9);
    expect(checker.userInfoLength('bar   fOo   baz12', { name: 'bar   fOo   baz' })).toBe(15);
    expect(checker.userInfoLength('bar   fOo baz12', { name: 'bar   fOo   baz' })).toBe(3);
    expect(checker.userInfoLength('barfOo   baz12', { name: 'bar   fOo   baz' })).toBe(3);
  });

  it('should recognize username', () => {
    expect(checker.userInfoLength('test1!', { username: 'teST' })).toBe(4);
    expect(checker.userInfoLength('test123', { username: 'test2' })).toBe(0);
  });

  it('should recognize email', () => {
    expect(checker.userInfoLength('teST1', { email: 'test@foo.com' })).toBe(4);
    expect(checker.userInfoLength('TEST2', { email: 'test1@foo.com' })).toBe(0);
    expect(checker.userInfoLength('FOO', { email: 'test@foo.com' })).toBe(0);
    expect(checker.userInfoLength('Foo!', { email: 'fOO@foo.com' })).toBe(3);
  });

  it('should recognize phone number', () => {
    expect(checker.userInfoLength('123456789ST', { phoneNumber: '123456789' })).toBe(9);
    expect(checker.userInfoLength('123456789ST', { phoneNumber: '12' })).toBe(2);
    expect(checker.userInfoLength('teST1234567890.', { phoneNumber: '123456789' })).toBe(0);
    expect(checker.userInfoLength('TEST12345678', { phoneNumber: '123456789' })).toBe(0);
  });

  it('should return the longest match', () => {
    expect(
      checker.userInfoLength('123456789ST', {
        name: '1234 56789',
        username: '12345',
        email: '1234567',
        phoneNumber: '1234',
      })
    ).toBe(9);
  });
});

describe('PasswordPolicyChecker -> wordLength()', () => {
  const checker = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 2 },
    rejects: {
      pwned: false,
      repetitionAndSequence: false,
      userInfo: false,
      words: ['test', 'teSt2', 'TesT3'],
    },
  });

  it('should recognize blacklisted words (case insensitive)', () => {
    expect(checker.wordLength('test')).toEqual(4);
    expect(checker.wordLength('tEst2')).toEqual(5);
  });

  it('should ignore other words', () => {
    expect(checker.wordLength('tes4')).toEqual(0);
    expect(checker.wordLength('tes4 est5 tes t')).toEqual(0);
    expect(checker.wordLength('tES4 TEst2 teSt3')).toEqual(0);
  });
});

describe('PasswordPolicyChecker -> sequenceLength()', () => {
  const checker = new PasswordPolicyChecker({
    length: { min: 1, max: 256 },
    characterTypes: { min: 2 },
    rejects: { pwned: false, repetitionAndSequence: true, userInfo: false, words: [] },
  });

  it('should recognize string starts with too many sequential characters', () => {
    expect(checker.sequenceLength('1234')).toBe(4);
    expect(checker.sequenceLength('edcba')).toBe(5);
    expect(checker.sequenceLength('BCDEDC')).toBe(4);
    expect(checker.sequenceLength('YUIOP##')).toBe(5);
    expect(checker.sequenceLength('2wsx3edc1')).toBe(4);
    expect(checker.sequenceLength('lo9KI8mJu7890')).toBe(3);
  });

  it('should ignore string starts with too few sequential characters', () => {
    expect(checker.sequenceLength('z')).toBe(0);
    expect(checker.sequenceLength('FE')).toBe(0);
    expect(checker.sequenceLength('aL1!')).toBe(0);
    expect(checker.sequenceLength('aL1!BCDEFA')).toBe(0);
  });
});
